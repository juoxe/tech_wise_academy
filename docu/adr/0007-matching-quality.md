# ADR-0007: Tool Extraction from Text – Metadata and Term-Level Matching

- **Status:** proposed – all topics are recommendations for J
- **Date:** 2026-11-02
- **Open decisions:** TD-42, TD-43, TD-44, TD-45 in [open-decisions.md](open-decisions.md)
- **Stories:** [TWA-10.1](../product_backlog/backlog.md#epic-twa-10--tool-extraction-from-text) (epic TWA-10)
- **Depends on:** [ADR-0006](0006-local-semantic-matching.md) (matching approach C, ONNX Runtime,
  MiniLM, pgvector)

## Context

J tried the interview feature with a real job ad and it works badly. J does not want the matching to
be specific to interviews: **it has to pull the tools out of any text** (a job ad, a project
description, a course outline, notes), and the result becomes a named card set (epics
[TWA-10](../product_backlog/backlog.md#epic-twa-10--tool-extraction-from-text) and
[TWA-11](../product_backlog/backlog.md#epic-twa-11--own-card-sets)). The failing case is a job ad. The ad says "Konzeption und
Implementierung skalierbarer Microservices und Microfrontends auf Basis JVM basierten Technologien
und Node.js". J reports two faults:

1. **"JVM" is not understood.** Java, Kotlin and the other JVM tools get no card.
2. **"Microservices" becomes a tool.** A concept of the ad turns into a card.

J suspects that the approach is not good enough, or has to take the tool metadata and the tool
description into account, and asked for an ADR. ADR-0006 chose names plus embeddings without the
planned measurement; its own sanity check had already found that only about a quarter of the
"similar" cards were right. This ADR looks at why, and at what would improve it. The model
(MiniLM) stays as decided; what is open is what the system gives it and how the result is used.

## What the failing ad shows

The stored set of the ad and two small probes with the production model (name plus summary of each
tool, 307 tools; script in the session scratchpad, not in the repository):

| Query | What comes out | Reading |
|-------|----------------|---------|
| Whole sentence with "Microservices … JVM … Node.js" | 1st Micronaut (0.60), 2nd Gradle (0.55), **Java 6th (0.52)**, Kotlin 85th (0.35) | Java is below the threshold of 0.55, so it gets no card. One sentence holds five topics; its vector matches none of them well. |
| Only "JVM basierten Technologien" | 1st Gradle (0.73), 2nd **Java (0.65)**, 4th Micronaut, 10th Scala, **Kotlin 33rd (0.39)** | Short phrases match better, but Kotlin is still far down: its text says "Java-Plattform", not "JVM". |
| Only "Microservices" | 1st **Micrometer (0.62)**, 2nd Micronaut (0.50) | The model matches the **spelling** ("Micro…"), not the concept. This is the fault J saw. |
| Same, with the text "Plattform: JVM" added to 27 JVM tools | Java 2nd (0.73), Scala 6th, Kotlin **16th** (0.59), Spring Boot 22nd | A tag in the embedded text helps a little, but a similarity score still cannot say "all JVM tools". |
| Same, with the tool hints added to the text | no better | Already seen in ADR-0006: the hints were left out for this reason. |

Tool texts also use different words for one thing: five tools say "JVM", Kotlin, Scala and
Clojure say "Java-Plattform", Java and Erlang say "virtuelle Maschine". The seed has **no field
for the ecosystem or the platform**, so the relation "Kotlin runs on the JVM" exists only by chance
in a sentence.

Three kinds of fault follow:

1. **Ecosystem terms** (JVM, .NET, "Cloud-Technologien") name a group of tools. A similarity score
   is the wrong instrument; an explicit relation is needed.
2. **Concept terms** (Microservices, Microfrontends, CI/CD, AI) are not tools. A small model
   matches their spelling and invents cards.
3. **Whole sentences dilute single terms.**

**Limits of this evidence:** one real ad and two probes. The tendency is clear, the sizes are not.
The first measurement (TWA-8.6) is still postponed; this ad is a first real case for it.

## Options

**Topic 1 – Where the relations between terms and tools come from (TD-42)**

- **A. Nothing new:** as built. Aliases stay in `interview/model.py` (code), tools carry name and
  summary only.
- **B. Tool metadata in the seed and the database:** per tool a list of **aliases** (today's code
  list), **tags** for ecosystem and platform (`jvm`, `node`, `cloud-native`) and **concepts** it
  belongs to (`microservices`, `ci-cd`, `testing`). A new table `tool_term (tool_key, kind, term)`;
  the seed file gets the same fields, a migration loads them.
- **C. Relations only in the code:** extend the lists in `model.py` for the terms that have failed.
- **D. Generated at index time:** an LLM derives tags and concepts for each tool once, a human
  reviews them, and the result is stored as in B.

**Topic 2 – What is matched: the query side (TD-43)**

- **A. Sentences** (as built): one vector per sentence or bullet.
- **B. Terms and phrases:** split the ad at commas, "und", "sowie", brackets and "wie"; each part
  is matched alone and an exact term match (topic 1) is checked first. The sentence stays as a
  second level.
- **C. Whole ad** as one vector: not considered, it dilutes more than sentences do.

**Topic 3 – How the cards are ranked (TD-44)**

- **A. Embeddings only** (as built, with the names).
- **B. Hybrid:** exact matches of aliases, tags and concepts first (explainable, deterministic),
  then embeddings for what is left, with a threshold.
- **C. Hybrid plus a cross-encoder reranker:** a small multilingual model that reads the phrase
  and the tool text together and scores them. A second model to download, about 120 to 560 MB
  (size not checked).
- **D. LLM extraction (hosted):** option E of ADR-0006; the ad leaves the machine.

**Topic 4 – Concepts that are not tools (TD-45)**

- **A. Ignore:** as built; "Microservices" can become a card.
- **B. Stop list:** concept words never produce a similar card; they are only dropped.
- **C. Concept layer:** a curated list maps a concept to tools that implement or support it
  (Microservices → Micronaut, Quarkus, Spring Cloud, …) and shows the concept as a **topic** of the
  set, with the matching tools as "passt dazu". Without a curated entry a concept gives no card.

## Decision

Rating from `+++` (very good) over `o` (neutral) to `–––` (very poor), at most three signs.
Criteria are not weighted; the reasoning below each matrix explains which criteria tip the balance.

### Decision Matrix – Source of the Relations (TD-42)

| Criterion | A. Nothing new | B. Metadata in seed and database | C. Lists in the code | D. Generated, then reviewed |
|-----------|:--------------:|:--------------------------------:|:--------------------:|:---------------------------:|
| Ecosystem terms (JVM → Java, Kotlin, …) | ––– | +++ | ++ | +++ |
| Explainable to the learner ("tag JVM") | o | +++ | ++ | ++ |
| Same result for the same ad | +++ | +++ | +++ | +++ |
| Data lives with the tool (one place) | – | +++ | ––– (spread over code) | +++ |
| Effort to build | +++ | + (new table, seed, migration) | ++ | – (plus review) |
| Maintenance for new tools | +++ | – (a few terms per tool) | –– | – |
| Fits the later tool maintenance in the UI (TWA-9) | o | +++ | ––– | ++ |

**Reasoning:** the failing case is a missing relation, not a missing model. The seed has the
tools but not what job ads say about them. Metadata in the seed puts that knowledge where the tool
is, shows it in the tool detail view of TWA-9, and moves the alias list out of the code. Writing
the terms for 307 tools is work; the second step, a one-time suggestion by an LLM that J reviews
(D), makes it cheap without any LLM at runtime. **Recommendation: B, filled with the help of D.**
Honest note: it is manual knowledge that has to be kept up to date, and no method removes that.

### Decision Matrix – Query Side (TD-43)

| Criterion | A. Sentences | B. Terms and phrases, then sentences |
|-----------|:------------:|:------------------------------------:|
| Single term in a long sentence | –– (measured: Java 6th, Kotlin 85th) | ++ (Java 2nd) |
| Works with exact term matching | – | +++ |
| Evidence for the learner (which phrase) | + (the sentence) | ++ (the phrase) |
| Effort | +++ | + (a splitter, rules for German) |
| Risk of splitting badly | +++ | – (e.g. "Aufbau und Betrieb von Pipelines") |

**Reasoning:** one sentence carries five topics, which is what the probe showed. **Recommendation:
B**, keeping the sentence as a second level so that a bad split does not lose a match.

### Decision Matrix – Ranking (TD-44)

| Criterion | A. Embeddings only | B. Exact terms first, then embeddings | C. B plus reranker | D. Hosted LLM |
|-----------|:------------------:|:-------------------------------------:|:------------------:|:-------------:|
| Ecosystem terms | ––– | +++ | +++ | +++ |
| Spelling-based false hits ("Micro…") | ––– | – (embedding stage remains) | ++ | +++ |
| Explainable | + | +++ | ++ | ++ |
| Same result for the same ad | +++ | +++ | +++ | o |
| Ad stays local, offline | +++ | +++ | +++ | ––– |
| Small, independent net (J's goal) | +++ | +++ | ++ (two nets) | ––– |
| Effort | +++ | + | –– (second model, tuning) | + |
| Cost at runtime | +++ | +++ | +++ | ++ |

**Reasoning:** B gives exact and explainable results for everything that has a relation in the
metadata and leaves the embedding for the fuzzy rest. A reranker (C) would remove more false hits
but costs a second model and tuning on data that does not exist yet (the measurement is
postponed). **Recommendation: B now; C only if the measurement shows that the false hits remain.**
D stays the answer if quality ever matters more than locality.

### Decision Matrix – Concepts (TD-45)

| Criterion | A. Ignore | B. Stop list | C. Concept layer |
|-----------|:---------:|:------------:|:----------------:|
| No invented tool cards ("Microservices" → Micrometer) | ––– | ++ | +++ |
| Learner sees what the ad asks beyond tools | ––– | ––– | +++ (topics) |
| Useful cards for the concept (Micronaut, Quarkus, …) | – (by chance) | ––– | ++ (curated) |
| Effort | +++ | ++ | – (curated list, UI for topics) |
| Maintenance | +++ | + | – |

**Reasoning:** the stop list fixes the visible fault cheaply. The concept layer solves the same
problem and tells the learner that the ad asks about microservices, which no tool card does. It is
built on the same metadata as topic 1 (`kind = concept`), so most of it comes with B.
**Recommendation: C, starting with a short list of the most frequent concepts of job ads
(Microservices, CI/CD, REST, Agile, Cloud, AI); a stop list (B) is the first step towards it.**

### Outcome

| Topic | Choice | Status | Decided by / on |
|-------|--------|--------|-----------------|
| Source of the relations (TD-42) | B. Metadata in seed and database, filled with the help of D | recommended | – |
| Query side (TD-43) | B. Terms and phrases, then sentences | recommended | – |
| Ranking (TD-44) | B. Exact terms first, then embeddings; reranker only if the measurement asks for it | recommended | – |
| Concepts (TD-45) | C. Concept layer, with a stop list as the first step | recommended | – |

## Consequences

- **Before building on it:** J decides topics 1 to 4. The ADR does not change the model, the
  runtime or pgvector (ADR-0006).
- **Data model:** a table `tool_term (tool_key, kind, term)` with `kind` in alias, tag and concept;
  the seed fields `aliases`, `tags` and `concepts`; the next free migration, which loads them; the alias
  list leaves `interview/model.py`. [Data model](../data_model/interview-data-model.md) and the
  [tool data model](../data_model/learning-content-data-model.md) have to be extended.
- **Rules:** the seed tests (hint does not name the tool, alternatives symmetric) get a test that
  tags and concepts are lower-case terms without duplicates.
- **Work to fill the terms:** 307 tools. Proposed: an LLM suggests them once, in a file that J
  reviews; no LLM at runtime. This is not a new technology in the product, but J approves the use
  of Claude for the suggestions.
- **Independent of interviews:** the extraction moves out of the module `interview` into its own
  module with a public interface (ADR-0001); the interview preparation and the sets by hand or from
  any text use it. Input and output are generic: a text in, tools and topics out.
- **API and UI of the sets:** a card says why it is there ("genannt", "Tag JVM", "ähnlich"); concept
  topics are shown beside the cards. The API gets a field for the reason; [API](../api/interview-api.md)
  and [game rules](../game-play.md) are updated.
- **Measurement (TWA-8.6):** this ad is the first real test case. Every ad that fails is kept as a
  regression case, with the tools J expects, so that the decision on a reranker (TD-44 C) rests on
  numbers. Ads are third-party texts and stay out of the repository.
- **Small fault found on the way, no decision needed:** the title of the set is the first line of
  the ad, here "Deine Aufgaben:". Every set gets a mandatory, changeable name instead (TWA-11.1).
- **Not decided here:** the threshold (0.55) stays until the measurement; the second level
  (sentences) keeps it.
