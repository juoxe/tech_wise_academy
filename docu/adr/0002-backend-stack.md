# ADR-0002: Backend Stack

- **Status:** accepted (J, 2026-10-25) – evaluated language-neutrally after the architecture
  concept
- **Date:** 2026-10-25
- **Open decisions:** TD-05, TD-04, TD-19, TD-01 (backend part) in [open-decisions.md](open-decisions.md)
- **Stories:** [TWA-3.1](../product_backlog/backlog.md#twa-31--backend-language-and-framework-version),
  [TWA-3.2](../product_backlog/backlog.md#twa-32--database-and-persistence-access),
  [TWA-3.8](../product_backlog/backlog.md#twa-38--api-description-and-generated-types),
  [TWA-3.5](../product_backlog/backlog.md#twa-35--formatter-and-linting) (backend part)
- **Depends on:** [ADR-0001](0001-architecture-concept.md) (architecture concept)
- **Based on:** Tech Tool Trainer ADR-0009 and ADR-0010, Agentic Ticket System ADR-0008

## Context

The backend offers REST APIs for learning packs, game rounds and learning progress; admins maintain
learning packs, and AI features (e.g. generating tasks, explaining mistakes) are foreseen for later.

### Language-Neutral Evaluation

The stack is evaluated **language-neutrally**:

- The criteria come from the requirements of the [architecture concept](0001-architecture-concept.md#requirements-for-the-stacks)
  and from the product, not from a preferred language.
- Existing code is **not** a criterion: the games are redesigned with a proper plan. Only the
  experience with a stack counts.
- J's personal goal to get further in Python is named as a criterion of its own, so its weight is
  visible instead of hidden in other ratings.

### Database and Access Are Different Decisions

The **database** (where data is stored, e.g. PostgreSQL) and the **access library** (how the code
talks to it, e.g. SQLAlchemy or plain SQL) are separate topics below. A library such as SQLAlchemy
is not an alternative to a database; the alternative to a library is writing SQL yourself.

## Options

**Language and framework**

- **Java + Spring Boot:** current Java LTS and Boot release.
- **Python 3.14 + FastAPI:** lightweight API framework with Pydantic models and a generated OpenAPI
  description.
- **Python 3.14 + Django (REST framework):** full framework with its own ORM, admin UI, auth and
  migrations.
- **TypeScript + Node.js (NestJS):** one language for frontend and backend.

The following topics are evaluated for Python, the chosen language.

**Packages and build**

- **uv:** fast package and project manager with lockfile, manages the Python version too.
- **Poetry:** established project manager with lockfile.
- **pip + venv:** standard tools, no lockfile of their own.

**Database**

- **PostgreSQL:** relational server database.
- **SQLite:** relational database in a single file, no server.
- **Document database (e.g. MongoDB):** JSON documents instead of tables.

**Persistence access**

- **SQLAlchemy 2 + psycopg, migrations with Alembic:** query builder and ORM; models are Python
  classes mapped to tables.
- **SQLModel + Alembic:** one class as Pydantic and SQLAlchemy model, less code.
- **psycopg with plain SQL + Alembic:** SQL written by hand in the repositories, rows mapped to
  Pydantic models by hand.

**API description**

- **Generated from the code (code-first):** the framework produces an OpenAPI description from the
  routes and models; the frontend generates its types from the exported file.
- **API-first with a generator:** the OpenAPI description is written by hand first and server and
  client code are generated from it.
- **Markdown only:** the API is described by hand in documents.

**Formatter, linting and types**

- **Ruff + ty:** one fast tool for lint and format, type checker from the same vendor.
- **Ruff + mypy:** Ruff with the long-established type checker.
- **Black + Flake8 + isort + mypy:** the classic combination of single tools.

## Decision

Rating from `+++` (very good) over `o` (neutral) to `–––` (very poor), at most three signs.

### Decision Matrix – Language and Framework

| Criterion | Java + Spring Boot | Python + FastAPI | Python + Django REST | TypeScript + NestJS |
|-----------|:------------------:|:----------------:|:--------------------:|:-------------------:|
| Business rules testable without framework and database (ADR-0001) | +++ | +++ | + (ORM-bound) | ++ |
| Automatic architecture checks (ADR-0001) | +++ (ArchUnit) | ++ (import-linter) | + | ++ (dependency-cruiser) |
| API description generated from code (ADR-0001) | ++ | +++ | + | ++ |
| Type safety | +++ | ++ | o | ++ |
| AI ecosystem (model APIs, embeddings) | + | +++ | +++ | ++ |
| Admin UI for learning packs out of the box | – | – | +++ | – |
| Maturity and long-term support | +++ | ++ | +++ | ++ |
| Footprint (start time, memory) | – | ++ | + | ++ |
| Few concepts for a small project | o | +++ | + | + |
| Experience with the stack | ++ | ++ | – | o |
| J's goal: get further in Python | ––– | +++ | +++ | ––– |

**Reasoning:** Java and FastAPI both fulfil the architecture requirements very well; Java is ahead
on type safety and architecture checks, FastAPI on the generated API description, the AI ecosystem,
footprint and a small number of concepts. J's Python goal then tips the balance to FastAPI.
Django's admin UI is a real advantage for maintaining learning packs, but its ORM ties business
rules to the database models, and much of it (templates, sessions) is not needed next to a React
frontend. NestJS would mean one language everywhere but brings no advantage for the Python goal or
AI.

### Decision Matrix – Packages and Build

| Criterion | uv | Poetry | pip + venv |
|-----------|:--:|:------:|:----------:|
| Speed | +++ | o | – |
| Reproducible lockfile | +++ | ++ | –– |
| Manages the Python version too | +++ | – | ––– |
| Experience with the tool | +++ | – | + |
| Number of tools to learn | ++ | + | +++ |

**Reasoning:** uv is fast, locks dependencies and the Python version, and is familiar.

### Decision Matrix – Database

| Criterion | PostgreSQL | SQLite | Document database |
|-----------|:----------:|:------:|:-----------------:|
| Relational data fits (packs, cards, progress per user) | +++ | +++ | o |
| Many users writing at the same time | +++ | – | ++ |
| Setup effort locally (container needed or not) | + | +++ | + |
| Rich features (JSON, arrays, full-text search, vectors for later AI) | +++ | – | ++ |
| Hosting options and operations | +++ | ++ | ++ |
| Experience with the database | ++ | + | – |

**Reasoning:** The data is clearly relational. SQLite is the simplest to start with but weak for
many users writing at once and for hosting; PostgreSQL covers growth and later AI features
(vector search) without a second system. The cost is a container for local development.

### Decision Matrix – Persistence Access

| Criterion | SQLAlchemy 2 + Alembic | SQLModel + Alembic | psycopg + plain SQL + Alembic |
|-----------|:----------------------:|:------------------:|:-----------------------------:|
| Few concepts to learn | o | + | +++ |
| Little boilerplate | ++ | ++ | – |
| Full control of SQL and PostgreSQL features | ++ | + | +++ |
| Migrations | +++ (autogenerate) | +++ | ++ (by hand) |
| Typed results | ++ | ++ | o (mapping by hand) |
| Maturity and documentation | +++ | o | +++ |

**Reasoning:** A close call. Plain SQL is the simplest to understand and gives full control, but
every query and every mapping to a model is written by hand. SQLAlchemy needs more concepts
(sessions, mapped classes) but saves boilerplate and can generate migrations. SQLModel mixes API
and database models and is less mature. With the simple Layered structure of ADR-0001, both
SQLAlchemy and plain SQL fit; J chose SQLAlchemy.

### Decision Matrix – API Description

| Criterion | Generated from code | API-first with generator | Markdown only |
|-----------|:-------------------:|:------------------------:|:-------------:|
| Description stays in sync with the code | +++ | ++ | –– |
| Frontend types generated automatically (ADR-0001) | +++ | +++ | ––– |
| Little effort | ++ | – | +++ |
| Purpose and rules readable for humans | + | + | +++ |
| Fits FastAPI and Pydantic | +++ | – | o |

**Reasoning:** FastAPI produces the description from routes and Pydantic models, so it cannot drift
from the code, and the frontend generates its types from it; breaking changes show up at build
time. Markdown API documentation stays only as a functional complement (purpose, rules, stories);
fields and types are authoritative in the generated description.

### Decision Matrix – Formatter, Linting and Types

| Criterion | Ruff + ty | Ruff + mypy | Black + Flake8 + isort + mypy |
|-----------|:---------:|:-----------:|:-----------------------------:|
| Speed | +++ | ++ | – |
| Few tools, one configuration | +++ | ++ | –– |
| Maturity of the type checker | o (young, actively developed) | +++ | +++ |
| Experience with the tools | +++ | + | o |

**Reasoning:** Ruff for lint and format is clear. ty is fast, comes from the same vendor and has
proven itself in the `ticket-service`.

### Outcome

| Topic | Choice | Status | Decided by / on |
|-------|--------|--------|-----------------|
| Language and framework (TD-05) | Python 3.14 + FastAPI (Pydantic) | accepted | J, 2026-10-25 |
| Packages and build (TD-05) | uv with `uv.lock` | accepted | J, 2026-10-25 |
| Database (TD-04) | PostgreSQL | accepted | J, 2026-10-25 |
| Persistence access (TD-04) | SQLAlchemy 2 (async) + psycopg, migrations with Alembic (chosen over plain SQL in a close call) | accepted | J, 2026-10-25 |
| API description (TD-19) | OpenAPI generated by the framework (code-first); frontend generates its types from the exported file; Markdown API documentation only as functional complement | accepted | J, 2026-10-25 |
| Formatter, linting and types (TD-01) | Ruff (lint, format) + ty | accepted | J, 2026-10-25 |

All six topics were accepted by J on 2026-10-25. The exact versions are pinned in
`pyproject.toml` and `uv.lock` when the backend is created (Python 3.14).

## Consequences

- The backend has a `pyproject.toml`, `uv.lock` and a Dockerfile based on an
  official Python image; commands `uv run pytest`, `uv run ruff check`, `uv run ruff format`,
  `uv run ty check`.
- PostgreSQL runs in a container for local development; migrations are managed with Alembic.
- FastAPI generates the OpenAPI description; it is exported to a file from which the frontend
  generates its API types after every change of the API models.
- The architecture tests of ADR-0001 are written as import-linter contracts for the layers and the
  module boundaries.
- Admins maintain learning packs through own API endpoints and frontend pages (no ready-made admin
  UI); this is planned with the first content-maintenance epic.
