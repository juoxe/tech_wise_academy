# ADR-0006: Matching Job Ads to Tools

- **Status:** proposed – TD-03 (test database) is decided by J; all other topics are open
- **Date:** 2026-11-02
- **Open decisions:** TD-36, TD-37, TD-38, TD-39, TD-40, TD-41, TD-03 in [open-decisions.md](open-decisions.md)
- **Stories:** [TWA-8.1](../product_backlog/backlog.md#twa-81--decide-vector-store-embedding-runtime-and-model)
- **Depends on:** [ADR-0002](0002-backend-stack.md) (PostgreSQL), [ADR-0004](0004-local-environment.md)
  (Docker Compose)

## Context

A learner pastes a job advertisement and gets a card set for interview preparation
([TWA-8](../product_backlog/backlog.md#epic-twa-8--interview-preparation)). The system must find the
tools of the catalogue (307 tools, German summaries and three German hints each) that the ad
**names**, and ideally also those it only **describes** ("Container-Orchestrierung" without the word
Kubernetes).

What J has said:

- **Local network preferred:** at first J wanted everything to stay in the local network. On
  2026-11-02 J opened this up: hosted embedding and LLM APIs are full options, and "local only" is a
  **criterion**, not a fixed constraint.
- **Postgres probably moves to pgvector** (J's word: "probably"), and **similarity values are
  persisted**.
- **A small, lightweight model is preferred**, and J wants to try independent neural nets that run
  locally rather than a big or hosted one. This is J's personal goal and is a criterion of its own
  below, so that its weight is visible.

Facts of the environment that matter:

- Ads are German or English, the tool texts are German, the tool names are mostly English.
- The pasted text is usually a **public job ad**: low sensitivity in itself. Sending it out still
  tells a provider which jobs the learner looks at.
- The machine has an Intel i7-9700 (8 cores, AVX2, **no AVX-512**), 16 GB RAM and an RTX 2060 with
  8 GB. Docker's disk image is on drive C:, which ran full during this work (see below).
- A first version was built ahead of this ADR with Ollama and `bge-m3`. Pulling the Ollama image
  filled drive C:; its largest layer alone was over 3 GB, and Docker Desktop crashed. This ADR
  replaces that unreviewed choice. The code keeps the embedding behind a small interface, so the
  runtime can be replaced.

## Options

**Topic 1 – Vector store**

- **pgvector:** extension of PostgreSQL; vectors in the existing database, similarity in SQL.
- **No vector store:** vectors (if any) in a normal column or in memory, similarity in Python.
- **Separate vector database** (Qdrant, Chroma, Milvus): its own service.

**Topic 2 – Matching approach**

- **A. Names only:** find the tools whose name or a known alias stands in the ad, as a word of its
  own (`Java` not in `JavaScript`, but in `Java-Kenntnisse`). No model.
- **B. Names + lexical search:** A, plus the most similar tools by word overlap with summary and hints
  (BM25, or full-text or trigram search in Postgres). No model.
- **C. Names + embeddings:** A, plus the most similar tools by the cosine similarity of embeddings,
  local or hosted (topic 3).
- **D. Embeddings only.**
- **E. Names + LLM extraction (hosted):** A, plus one call to an LLM (e.g. Claude) that reads the ad
  and returns the matching keys of the catalogue. Structured output restricts the answer to the 307
  keys, so it cannot invent a tool. The same call can list the technologies of the ad that have **no**
  card (PostgreSQL, AWS, …).

**Topic 3 – Embedding runtime** (only if topic 2 is C or D)

- **ONNX Runtime in the backend:** `onnxruntime` and `tokenizers` as Python libraries, the model as a
  file. No extra service.
- **sentence-transformers in the backend:** the same models through PyTorch.
- **Ollama:** a local model server in compose, HTTP API.
- **Other local server:** e.g. Hugging Face Text Embeddings Inference or the llama.cpp server, also in
  compose.
- **Hosted embedding API:** Voyage AI, OpenAI or Cohere over HTTPS with an API key.

**Topic 4 – Embedding model** (only if topic 2 is C or D)

Local:

- **paraphrase-multilingual-MiniLM-L12-v2** (sentence-transformers, Apache 2.0): 118 M parameters,
  384 dimensions, 50+ languages.
- **multilingual-e5-small** (intfloat, MIT): 118 M parameters, 384 dimensions, about 100 languages;
  trained for search (query and passage prefixes). A generic int8 ONNX file (118.1 MB) is in the
  `Xenova/multilingual-e5-small` repository; the original repository only has an int8 file built for
  AVX-512 VNNI.
- **bge-m3** (BAAI, MIT): 568 M parameters, 1024 dimensions, 100+ languages.
- **nomic-embed-text** (Nomic, Apache 2.0): 137 M parameters, 768 dimensions, mainly English.

Hosted (list prices found on 2026-11-02, see Sources):

- **Voyage `voyage-4-lite`** (or `voyage-3.5-lite`): $0.02 per million tokens.
- **OpenAI `text-embedding-3-small`:** $0.02 per million tokens.
- **Cohere Embed v4:** about $0.12 per million tokens (third-party sources only).

**Topic 5 – Persisted similarity values**

- **Every tool per set:** one row per tool of the catalogue with its value, also for tools without a
  card (about 300 rows per set).
- **Only the cards:** the value of the tools that are in the set.

**Topic 6 – LLM for the extraction** (only if topic 2 is E)

- **Claude Opus 5.5** (`claude-opus-5-5`): the current default model, $4 input / $20 output per
  million tokens.
- **Claude Haiku 5.5** (`claude-haiku-5-5`): the small, fast model, $0.10 / $0.50 per million
  tokens for prompts up to 100,000 tokens (an extraction stays far below that).

**Topic 7 – Database for the measurement test (TD-03)**

- **Testcontainers:** the test starts its own PostgreSQL with pgvector in a container and runs the
  migrations against it.
- **Test database via compose:** a fixed database in `compose.yaml` that the test uses.
- **No database:** the measurement runs in Python only.

## Measurements

### Comparison on four job ads (2026-11-02)

Four realistic ads, written for this test: Java backend (German), machine learning (English),
frontend (German), DevSecOps (English, **names no tool on purpose**). Before any matching ran, each
ad was labelled with the tools it names and the tools it only describes ("implied"). Script and data:
`lexical.py`, `labels.json` and `ad_*.txt` in the session scratchpad. They are not part of the
repository.

| Ad | Named tools found (A) | Wrong names | Implied tools in the 6 extra cards (B, BM25) | Implied in the top 15 (B) |
|----|----------------------:|------------:|---------------------------------------------:|--------------------------:|
| Java backend, DE | 11 / 11 | 0 | 1 / 6 | 2 / 6 |
| Machine learning, EN | 7 / 7 | 0 | 0 / 10 | 0 / 10 |
| Frontend, DE | 3 / 3 | 0 | 2 / 9 | 5 / 9 |
| DevSecOps, EN | – (none named) | 0 | 2 / 17 | 4 / 17 |
| **Total** | **21 / 21** | **0** | **5 of 24 extra cards correct (21 %)** | **11 / 42** |

Name matching took under 60 ms per ad in Python, the BM25 run included.

What the numbers say:

- **Names alone (A) are exact** on these ads: every named tool, no false card. The aliases (`k8s`,
  `Golang`, `Kafka`) and the case rules for ordinary words (`Go`, `React`, `Helm`) carry this.
- **Lexical search (B) is weak for the implied tools**: one extra card in five is right. On the
  English ad it finds nothing, because the hints are German and words do not match across languages.
  It adds noise such as `pre-commit` and `Consul` for the DevSecOps ad.
- **Embeddings (C) and LLM extraction (E) are not measured.** Embeddings need a model download or an
  API key, and E needs an API key; J approves either first. Both help only with the implied tools,
  which is exactly where lexical search fails.

**Limits of this test:** four ads written by the same agent who wrote the aliases, so A is likely
rated too well; real ads use spellings that are not in the alias list yet. The labels of the implied
tools are a judgement call. The test shows a tendency, not a quality figure.

**What matters more than the method:** the catalogue has no PostgreSQL, MySQL, Linux, AWS, Azure or
Google Cloud. They are among the most frequent words in real ads, and no method can produce a card
for them ([TWA-8.5](../product_backlog/backlog.md#twa-85--tools-missing-from-the-catalogue)). Only E
can at least name them as "not covered".

### Planned measurement on five real job ads (J, 2026-11-02)

The comparison above uses ads written by the same agent that wrote the aliases. J decided to measure
again on **five real, public job ads**, mixed German and English, which **J provides and labels**
(named tools, implied tools). The measurement is a test with Testcontainers (TD-03) against
PostgreSQL with pgvector, after all migrations. It is marked `measurement` and does not run in the
normal test run.

| Variant | What it adds to the names | Fixed before the ads are known |
|---------|---------------------------|--------------------------------|
| A+ | a curated concept list: descriptions to tools ("Container-Orchestrierung" → Kubernetes, "Secret Detection" → Gitleaks) | the concept list |
| B | BM25 over summary, hints **and English keywords per tool**, so B is not handicapped by German-only texts | the keywords |
| C | paraphrase-multilingual-MiniLM-L12-v2 through ONNX Runtime, similarity in pgvector | model and text of each tool |
| E | Claude Haiku 5.5 picks keys from the catalogue (structured output) | the prompt |

**Success measure (proposed; J decides the numbers before the run):**

- Each variant shows **at most 6 extra cards** per ad, that is cards for tools the ad does not name.
  The same cap for all variants, no tuned threshold.
- **Primary:** the share of correct extra cards, summed over the five ads (an extra card is correct
  if J labelled the tool as implied).
- **Secondary:** the share of J's implied tools that appear among the extra cards.
- **Guard:** the named tools found and the wrong named cards must stay as with A.
- **Proposed bar:** a variant is worth its cost if at least **50 %** of its extra cards are correct
  and it beats B by at least **15 points**. If none passes, A alone is the choice.
- For E only, the terms without a card that it lists are reported, but not scored.

The numbers are added here after the run.

### Size, cost and fit

Model file sizes are from Hugging Face, wheel sizes from PyPI and prices from the providers' pages
and price trackers, all on 2026-11-02. RAM, latency and token counts are estimates, not measured here.

**Token volume:** one ad has about 1,000 to 2,000 tokens. Embedding the catalogue once is about
50,000 tokens. An LLM extraction sends the ad plus the list of 307 keys and names (about 5,000 tokens
in all) and gets about 500 tokens back, plus thinking tokens.

| Option | Download / setup | RAM (estimate) | Cost | Latency per ad (estimate) | Offline |
|--------|------------------|---------------:|------|--------------------------:|:-------:|
| A / B (names, BM25 or Postgres full-text) | nothing | – | none | < 0.1 s | yes |
| ONNX Runtime + small model | 25 MB wheels + 118.5 MB (MiniLM int8) or 118.1 MB (e5-small int8) | ~0.3 to 0.6 GB | none | < 1 s on CPU | yes |
| sentence-transformers + PyTorch | PyTorch wheel 127 MB, several hundred MB installed | ~1 GB + model | none | < 1 s | yes |
| Ollama + bge-m3 | image > 3 GB + model about 1.2 GB | ~2 GB | none | 1 to 2 s | yes |
| TEI / llama.cpp server | image 0.1 to 1 GB + model | ~0.3 GB + model | none | < 1 s | yes |
| Hosted embeddings (Voyage, OpenAI) | API key | – | $0.02 per million tokens: about $0.001 for the catalogue, far below a cent per ad | 0.3 to 1 s | no |
| Hosted embeddings (Cohere Embed v4) | API key | – | about $0.12 per million tokens: still far below a cent per ad | 0.3 to 1 s | no |
| E with Claude Opus 5.5 | API key | – | about $0.03 to $0.05 per ad | several seconds | no |
| E with Claude Haiku 5.5 | API key | – | about $0.001 per ad | 1 to 3 s | no |

**Privacy of the hosted options:** the pasted ad, and with it the information which jobs the learner
looks at, goes to the provider and is processed and kept under its API terms. Zero data retention
is only available by agreement. The tool catalogue also leaves the machine, but it is not sensitive.
An API key becomes a secret that the local environment has to keep (TD-10).

## Decision

Rating from `+++` (very good) over `o` (neutral) to `–––` (very poor), at most three signs.
Criteria are not weighted; the reasoning below each matrix explains which criteria tip the balance.

### Decision Matrix – Vector Store (TD-36)

| Criterion | pgvector | No vector store | Separate vector database |
|-----------|:--------:|:---------------:|:------------------------:|
| J's stated direction | +++ | – | –– |
| Similarity computed where it is stored (SQL) | +++ | – | ++ |
| Effort: services and setup | ++ (image change) | +++ | –– |
| Needed for 307 tools | o | +++ | ––– |
| Useful if no embeddings are used (topic 2 = A, B or E) | ––– | +++ | ––– |
| Grows to many more tools or sets | ++ | o | +++ |

**Reasoning:** pgvector keeps vectors and similarity values in the one database and follows J's
direction, which J gave as "probably"; it is therefore decided together with TD-37. **Honest note:** for 307 tools it is not needed for speed; Python would compare them in
milliseconds. It only pays off with embeddings (topic 2 = C or D), local or hosted. If J chooses A, B
or E, the image change and the extension can be dropped again.

### Decision Matrix – Matching Approach (TD-37)

| Criterion | A. Names only | B. Names + lexical | C. Names + embeddings | D. Embeddings only | E. Names + LLM extraction |
|-----------|:-------------:|:------------------:|:---------------------:|:------------------:|:-------------------------:|
| Named tools found (measured) | +++ | +++ | +++ | – (not measured; embeddings blur close names such as Kafka and RabbitMQ) | +++ |
| Implied tools found (measured / expected) | ––– | – (21 % of extra cards) | ? (not measured yet) | ? | ++ (expected: an LLM reads "secret detection" as Gitleaks; not measured) |
| Names the technologies without a card | ––– | ––– | ––– | ––– | +++ |
| German ad, German hints, English names | +++ | o (fails across languages) | ++ (multilingual models) | ++ | +++ |
| Explainable to the learner | +++ (the word in the ad) | ++ | + (the closest sentence) | o | ++ (the model can quote the sentence) |
| Same result for the same ad | +++ | +++ | +++ | +++ | o |
| Cost per ad | +++ | +++ | +++ (local) / ++ (hosted) | +++ / ++ | ++ (Haiku) / + (Opus) |
| Works offline, ad stays local | +++ | +++ | +++ (local) / ––– (hosted) | +++ / ––– | ––– |
| Uses a small local neural net (J's goal) | ––– | ––– | +++ (local) / – (hosted) | +++ / – | ––– |
| Setup and maintenance | – (alias list grows) | – | – (model or key, threshold) | –– | o (API key, prompt) |

**Reasoning:** for the tools an ad **names**, names are enough, and better than any model: exact,
explainable, free and offline. Every option except D keeps them. The difference lies in the
**implied** tools. Lexical search is shown to be weak there. Two approaches could do better:

- **C with a small local model** fits J's goal and keeps the ad on the machine. Its gain is not proven
  yet.
- **E (LLM extraction)** is the strongest option on paper: it understands descriptions in German and
  English, and it is the only one that also names the technologies without a card, which is the
  bigger gap. It costs the most locality: the ad leaves the machine, it needs internet and a key, and
  two runs can differ.

**Recommendation: C with a small local model, under one condition**: measure it on the same four ads
first. If it does not clearly beat B on the implied tools, the choice is between **A alone** (if
locality matters most) and **E** (if quality matters most). D is not recommended: it would lose the
exact named matches. This recommendation follows J's personal goal. Without that goal, **E** would be
the first choice on quality.

### Decision Matrix – Embedding Runtime (TD-38)

| Criterion | ONNX Runtime in the backend | sentence-transformers | Ollama | TEI / llama.cpp server | Hosted embedding API |
|-----------|:---------------------------:|:---------------------:|:------:|:----------------------:|:--------------------:|
| Size on disk | +++ (~25 MB + model) | – (PyTorch) | ––– (image > 3 GB) | o | +++ (none) |
| RAM | ++ | – | o | + | +++ |
| Setup effort | ++ (two libraries, one file) | ++ | ++ (compose, model pull) | o | ++ (key, HTTP call) |
| Extra service to run | +++ (none) | +++ (none) | – | – | +++ (none locally) |
| Ad stays local, works offline | +++ | +++ | +++ | +++ | ––– |
| Small, independent net in the own code (J's goal) | +++ | ++ | + (black box behind HTTP) | + | ––– |
| Quality on German ads | + (small model) | + | ++ (bge-m3) | ++ | ++ |
| Cost | +++ | +++ | +++ | +++ | ++ (fractions of a cent) |
| Other machine in the local network can serve it | – | – | +++ | +++ | – |
| Experience / documentation | ++ | +++ | +++ | + | +++ |

**Reasoning:** for a 118 MB model, a model server is out of proportion: the Ollama image alone is
more than twenty times the model, and it already filled drive C: once. ONNX Runtime runs the same
model inside the backend with two small libraries and fits J's goal best: the net is a file in the
project's own pipeline, not a service. Hosted embeddings are cheap and simple, but they give up the
ad's locality without being better than E. **Hosted embeddings are not recommended:** if the ad
leaves the machine anyway, E gives more for it. **Recommendation: ONNX Runtime.** Ollama remains the
option if J later wants big models on the GPU or on another machine in the network.

### Decision Matrix – Embedding Model (TD-39)

| Criterion | paraphrase-multilingual-MiniLM-L12-v2 | multilingual-e5-small | bge-m3 | nomic-embed-text | Hosted (voyage-4-lite, text-embedding-3-small, Cohere Embed v4) |
|-----------|:-------------------------------------:|:---------------------:|:------:|:----------------:|:----------------------------------:|
| Size (small preferred by J) | +++ (118.5 MB int8) | +++ (118.1 MB int8) | –– (1.2 to 2.2 GB) | ++ (0.3 GB) | +++ (nothing local) |
| Fits this CPU (AVX2) | +++ | ++ (int8 from a community repository) | o | ++ | +++ |
| German ads, English names | ++ | ++ | +++ | – | ++ |
| Made for search (short query against longer text) | o (made for sentence similarity) | ++ | +++ | ++ | +++ |
| Licence / terms | +++ (Apache 2.0) | +++ (MIT) | +++ (MIT) | +++ (Apache 2.0) | o (provider terms) |
| Small, independent net (J's goal) | +++ | +++ | + | ++ | ––– |
| Ad stays local | +++ | +++ | +++ | +++ | ––– |

**Reasoning:** both small multilingual models fit J's goal and have an int8 file of about 118 MB.
MiniLM's comes from its original repository, e5-small's from a community conversion; e5-small is the
stronger search model on paper. **Recommendation:** measure **paraphrase-multilingual-MiniLM-L12-v2**
(118.5 MB) first, as J chose for the measurement, and e5-small only if MiniLM is not good enough. bge-m3 is not recommended: four to
twenty times larger for a catalogue of 307 tools. The hosted models would only be considered if J
chooses hosted embeddings.

### Decision Matrix – Persisted Similarity Values (TD-40)

| Criterion | Every tool per set | Only the cards |
|-----------|:------------------:|:--------------:|
| Selection can be re-tuned without the model | +++ | ––– |
| Shows how close a tool came ("near misses") | +++ | ––– |
| Storage (about 300 rows per set) | + | +++ |
| Simplicity | ++ | +++ |

**Reasoning:** J asked for persisted similarity values. Storing them for every tool makes them useful
for tuning the threshold and for later statistics, at a cost of a few kilobytes per set.
**Recommendation: every tool per set.** With A the stored value becomes "named or not" plus the word
that matched; with E it is the model's answer per tool (selected or not, with the quoted sentence).

### Decision Matrix – LLM for the Extraction (TD-41, only for E)

| Criterion | Claude Opus 5.5 | Claude Haiku 5.5 |
|-----------|:---------------:|:----------------:|
| Quality of reading implied tools | +++ | ++ |
| Cost per ad | + (about $0.03 to $0.05) | +++ (about $0.001) |
| Latency | o (several seconds) | ++ |
| Ad stays local | ––– | ––– |

**Reasoning:** the task is short and well bounded: one ad, a fixed list of keys, structured output.
Opus 5.5 is the current default model and the safest for quality. Haiku 5.5 costs about a fortieth and
is likely good enough for a fixed list; whether the difference matters would be measured on the same
four ads. **Recommendation:** start with **Opus 5.5**, and let J decide on Haiku 5.5 for cost after a
comparison. J chose **Haiku 5.5 for the measurement** (2026-11-02); the choice for production stays
open. Topic 6 only applies if J chooses E.

### Decision Matrix – Database for the Measurement Test (TD-03)

| Criterion | Testcontainers | Test database via compose | No database |
|-----------|:--------------:|:-------------------------:|:-----------:|
| Tests the real path (migrations, pgvector SQL) | +++ | +++ | ––– |
| Independent of the running local environment and its data | +++ | – | +++ |
| Effort | + (one library, Docker needed) | ++ | +++ |
| Size | + (pgvector image, about 0.15 GB) | + | +++ |

**Reasoning:** the measurement must run the matching as the product runs it, including the
migrations and the similarity in pgvector, without touching J's local data. **J decided:**
Testcontainers with the pgvector image, on 2026-11-02, for this measurement. The general testing
strategy (TD-03 beyond this test, TD-02, TD-26, TD-27) stays in MS 3.

### Outcome

| Topic | Choice | Status | Decided by / on |
|-------|--------|--------|-----------------|
| Local network | A criterion, no longer a fixed constraint | accepted | J, 2026-11-02 |
| Vector store (TD-36) | pgvector, only needed for topic 2 = C or D; depends on TD-37 | recommended | – |
| Matching approach (TD-37) | C with a small local model, if a measurement shows a gain; otherwise A (locality) or E (quality) | recommended | – |
| Embedding runtime (TD-38) | ONNX Runtime in the backend; hosted embeddings not recommended | recommended | – |
| Embedding model (TD-39) | paraphrase-multilingual-MiniLM-L12-v2 (118.5 MB), e5-small as fallback | recommended | – |
| Persisted similarity values (TD-40) | Every tool per set | recommended | – |
| LLM for the extraction (TD-41) | Claude Opus 5.5, Haiku 5.5 after a comparison (only for E); Haiku 5.5 for the measurement | recommended | – |
| Database for the measurement test (TD-03) | Testcontainers with `pgvector/pgvector:pg16`, for this measurement only | accepted | J, 2026-11-02 |

## Consequences

- **Before building on it:** J decides topics 2 to 6 on the numbers of the planned measurement. The
  measurement needs, each confirmed by J before it is installed: the MiniLM model (118.5 MB, from
  Hugging Face, onto drive D:), the libraries `onnxruntime`, `tokenizers`, `testcontainers` and, for
  E, `anthropic` (all in the dev group only), and an Anthropic API key that J puts into `.env`.
  Without the key, E is skipped. Cost of E: well under one dollar.
- **Docker's disk image must leave drive C:** before any further image is pulled. The pgvector image
  is small, but even small pulls fail while C: is full.
- **If ONNX Runtime is accepted:** the `ollama` and `ollama-model` services leave `compose.yaml`; the
  backend gets an ONNX embedder behind the existing interface; the model file is downloaded once
  (configurable path, not in the repository); `EMBEDDING_URL` gives way to a model path.
- **If E is accepted:** the embedding code, the vector columns and the pgvector image are removed; the
  backend gets an extractor behind the same kind of interface, an API key in `.env` (never in the
  repository), and the UI says that the ad is sent to Anthropic. Without a key or without internet,
  the set falls back to A.
- **If A (names only) is accepted:** the embedding code, the vector columns and the pgvector image are
  removed; `interview_set_tool` keeps the named tools and the matching sentence.
- **Either way:** the alias list in `interview/model.py` has to grow with real ads, and the catalogue
  gaps ([TWA-8.5](../product_backlog/backlog.md#twa-85--tools-missing-from-the-catalogue)) limit
  every method more than the choice of model does.
- To update when decided: [open-decisions.md](open-decisions.md), the [ADR index](README.md),
  [techstack](../architecture/techstack.md), [data model](../data_model/interview-data-model.md),
  `compose.yaml`, `.env.example`.

## Sources

Prices checked on 2026-11-02; check again before deciding.

- Claude models and prices: [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing),
  checked on 2026-11-02.
- Voyage AI: [Voyage models (MongoDB docs)](https://mongodb.com/docs/voyageai/models/).
- OpenAI: [text-embedding-3-small](https://developers.openai.com/api/docs/models/text-embedding-3-small).
- Cohere Embed v4 (third-party only, no official page found):
  [Costbench – Cohere Embed](https://www.costbench.com/software/embedding-apis/cohere-embed/),
  [AWS Marketplace listing](https://aws.amazon.com/marketplace/pp/prodview-j3fgisven2yrs).
- Model files: Hugging Face model trees of `intfloat/multilingual-e5-small`,
  `Xenova/multilingual-e5-small` and
  `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`; wheels: PyPI pages of
  `onnxruntime`, `tokenizers`, `torch`.
