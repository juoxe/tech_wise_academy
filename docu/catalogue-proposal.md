# Catalogue Proposal – What Is Missing

Status: **the recommended core set was chosen by J on 2026-11-06 and added** (migration 0016,
[TWA-12.9](product_backlog/backlog.md) and [TWA-12.10](product_backlog/backlog.md)): 38 tools and 4 languages, in
the file `seed_catalogue_2.json`. The rows without a check mark (✔) are **not added**; they stay here as the
list for a later round.

Origin: J's review of 2026-11-06 ("Why is Obsidian backend? No programming languages in the tools. I never saw
Flutter or FastAPI. Check the sentences, the categories and whether more is missing.").

## What the Review Found

| Finding | State |
|---------|-------|
| **Obsidian in Backend.** The Tech Tool Trainer had twelve tool types, among them "Wissen und Dokumentation". When this project kept only five areas, tools of the other types were filed under the area of the path where they appeared. | **Fixed** in [TWA-12.7](product_backlog/backlog.md): new sixth area `DEV_ENV` "Entwicklung & Wissen" with 13 tools: Obsidian, Mermaid, IntelliJ IDEA, Visual Studio Code, Postman, DBeaver, pgAdmin, Swagger UI, SDKMAN!, Dev Containers, Figma, Chrome DevTools, React Developer Tools. |
| **Programming languages among the tools.** None of the 284 tools is a programming language; all 23 languages are in the area `LANGUAGE`. Borderline: Mermaid (a text-based diagram syntax) and Sass (a CSS extension) stay tools. | Rule written down in [TWA-12.8](product_backlog/backlog.md). |
| **Summaries.** All 307 sentences were read. No missing punctuation, no English, none shorter than 68 or longer than 187 characters, none duplicated. One grammar error: Hashcat ("Schnellster Werkzeug" → "Schnellstes Werkzeug"). | **Fixed** (seed file and migration 0015). |
| **AI model names.** Checked on the web on 2026-11-06: Google Gemma 4 (released 2026-04-02, Apache 2.0), Qwen 3.5 (2026-02) and 3.6 (2026-04), FLUX.2 [klein] (2026-01-15, 4B and 9B) and Mistral Small 4 / Ministral 3 are current. **Meta Llama 3.3 was outdated:** the open successor is Llama 4 (Scout and Maverick). | **Fixed** in migration 0016: the entry is "Meta Llama 4" now. |
| **Examples.** 53 of 307 entries have no code example (for instance Alertmanager, Babel, Bitwarden, cert-manager, CircleCI, ClickHouse). | Open; the example is optional. |
| **Languages in the broad sense.** HTML, CSS, SQL, Bash and Prolog are in the area of the languages. HTML and CSS are markup and style languages, not programming languages. | **Decided by J on 2026-11-06:** the area is called "Sprachen" (label only; the code stays `LANGUAGE`). |
| **Pairs.** Mermaid and Obsidian have no alternatives. | Open; they may stay without. |

## What Is Missing

None of the proposed entries exists in the catalogue (checked by name and key on 2026-11-06). ✔ marks the
**recommended core set**; "Prio" is the proposed default priority (Hoch, Normal or Niedrig).

The backend part of the catalogue is Java-centred (about 45 of 50 backend tools), and the stack of this project
(FastAPI, SQLAlchemy, Alembic, pytest, uv, Ruff, PostgreSQL, Docker Compose) is not in it at all.

### Backend

| Core | Tool | Why | Prio |
|:----:|------|-----|------|
| ✔ | FastAPI | Python web framework; this project's backend | Hoch |
| ✔ | Flask | Small Python web framework, common in interviews | Normal |
| ✔ | Django | Full Python web framework | Hoch |
| ✔ | Pydantic | Data validation in Python, used by FastAPI | Hoch |
| ✔ | SQLAlchemy | The standard database toolkit for Python | Hoch |
| ✔ | Alembic | Database migrations for SQLAlchemy | Normal |
| ✔ | pytest | The standard test framework for Python | Hoch |
| ✔ | Celery | Task queue for Python | Normal |
| ✔ | Express | The classic Node.js web framework | Hoch |
| ✔ | NestJS | Structured Node.js framework with TypeScript | Normal |
| ✔ | PostgreSQL | The most used open-source relational database; not in the catalogue yet | Hoch |
| ✔ | MySQL | Widespread relational database | Hoch |
| ✔ | SQLite | Embedded database in one file | Normal |
| ✔ | GraphQL | Query language for APIs | Normal |
| ✔ | gRPC | Fast RPC framework with Protocol Buffers | Normal |
|   | MariaDB | MySQL fork | Niedrig |
|   | Microsoft SQL Server | Relational database from Microsoft | Niedrig |
|   | ASP.NET Core | Web framework for .NET | Niedrig |
|   | Laravel | PHP web framework | Niedrig |

### DevOps

| Core | Tool | Why | Prio |
|:----:|------|-----|------|
| ✔ | Docker Compose | Several containers in one file; used by this project | Hoch |
| ✔ | GitHub | The platform around Git: pull requests, issues, reviews | Hoch |
| ✔ | GitLab | Git platform with built-in CI/CD | Normal |
| ✔ | AWS | The largest cloud provider | Hoch |
| ✔ | Microsoft Azure | Cloud provider, strong in companies | Normal |
| ✔ | Google Cloud | Cloud provider | Normal |
|   | Cloudflare | CDN, DNS and edge services | Normal |
|   | Kibana | Dashboards for Elasticsearch (ELK stack) | Normal |
|   | Datadog | Monitoring service | Niedrig |
|   | Vagrant | Reproducible virtual machines | Niedrig |
|   | MinIO | S3-compatible object storage | Niedrig |

### Frontend and Mobile

| Core | Tool | Why | Prio |
|:----:|------|-----|------|
| ✔ | Flutter | Cross-platform apps with Dart (needs the language Dart) | Hoch |
| ✔ | React Native | Mobile apps with React | Hoch |
| ✔ | Expo | Tooling around React Native | Normal |
| ✔ | Electron | Desktop apps with web technology | Normal |
| ✔ | Bootstrap | The classic CSS component framework | Normal |
| ✔ | Material UI | React component library | Normal |
|   | Tauri | Light desktop apps with Rust | Niedrig |
|   | Pinia | State management for Vue | Niedrig |
|   | Apollo Client | GraphQL client | Niedrig |

### Security

| Core | Tool | Why | Prio |
|:----:|------|-----|------|
| ✔ | Bandit | Security linter for Python code | Normal |
| ✔ | Auth0 | Hosted identity service | Normal |
| ✔ | OWASP Juice Shop | Deliberately insecure web app to practise attacks | Normal |
|   | Kali Linux | Linux distribution for penetration tests | Normal |
|   | John the Ripper | Password cracker, like Hashcat | Niedrig |

### AI and Data

| Core | Tool | Why | Prio |
|:----:|------|-----|------|
| ✔ | OpenAI API | Programming interface of OpenAI, next to the Claude API | Hoch |
| ✔ | Google Gemini API | Programming interface of Google | Normal |
| ✔ | Transformers | Hugging Face library for models | Normal |
|   | Apache Flink | Stream processing | Niedrig |
|   | Trino | Distributed SQL query engine | Niedrig |
|   | Metabase | Simple dashboards for databases | Niedrig |
|   | Apache Superset | Dashboards and data exploration | Niedrig |
|   | Snowflake | Cloud data warehouse | Niedrig |
|   | BigQuery | Data warehouse from Google | Niedrig |
|   | Databricks | Data platform around Spark | Niedrig |

### Development and Knowledge (new area)

| Core | Tool | Why | Prio |
|:----:|------|-----|------|
| ✔ | PyCharm | JetBrains IDE for Python | Hoch |
| ✔ | Vim | The classic terminal editor | Normal |
| ✔ | curl | Calls HTTP APIs from the command line | Hoch |
| ✔ | jq | Reads and changes JSON on the command line | Normal |
| ✔ | Jira | Ticket and project tool | Normal |
|   | Neovim | Modern Vim | Niedrig |
|   | WebStorm | JetBrains IDE for JavaScript | Niedrig |
|   | Android Studio | IDE for Android apps (Flutter) | Normal |
|   | Xcode | IDE for Apple platforms | Niedrig |
|   | tmux | Several terminal sessions in one window | Niedrig |
|   | Make | Build and task runner | Niedrig |
|   | Linux | The operating system under most servers; may be better as a topic than as a tool | Normal |

### Programming Languages (area `LANGUAGE`)

| Core | Language | Paradigm | Why |
|:----:|----------|----------|-----|
| ✔ | Dart | Object-oriented | The language of Flutter |
| ✔ | R (Programmiersprache) | Multi-paradigm | Statistics and data analysis |
| ✔ | Julia | Multi-paradigm | Numerical computing |
| ✔ | Lua | Multi-paradigm | Small embedded scripting language (games, NGINX) |
|   | Groovy | Object-oriented | JVM scripting, Gradle and Jenkins |
|   | Perl | Multi-paradigm | Old but still found in scripts |
|   | Zig | Procedural | Modern systems language |
|   | F# | Functional | Functional language of .NET |
|   | OCaml | Functional | Functional language |
|   | Objective-C | Object-oriented | Older Apple language |

## Size

The recommended core set has **38 tools and 4 languages** (42 entries). All proposed entries together are 66
tools and 10 languages (76 entries). Every entry needs a full text (summary, at least three hints without its
name, an example, alternatives, a documentation link, the learning content), so the core set is 42 entries to
write and review. The catalogue grew from 307 to 349 entries with the core set (38 tools and 4 languages) and would reach 383 with
everything.

## How to Choose

Mark the rows to add, or say "the core set". Then [TWA-12.10](product_backlog/backlog.md) writes the entries
and J reviews the texts like in TWA-12.5.
