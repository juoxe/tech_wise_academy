# Product Backlog

Product backlog with **product-wide sequential** numbering. The backlog starts with Epic
**TWA-1 – Vision & Goals** and grows step by step. The ID and status scheme, the structure of an
issue and the machine-readable format are described in [CLAUDE.md](CLAUDE.md).

## Status Overview

| Epic | Title | Milestone | Status |
|------|-------|-----------|--------|
| [TWA-1](#epic-twa-1--vision--goals) | Vision & Goals | MS 1 | DONE |
| [TWA-2](#epic-twa-2--working-rules--documentation-structure) | Working Rules & Documentation Structure | MS 1 | IN PROGRESS |
| [TWA-3](#epic-twa-3--mandatory-decisions-before-the-first-code) | Mandatory Decisions Before the First Code | MS 1 | DONE |
| [TWA-4](#epic-twa-4--runnable-project-skeleton) | Runnable Project Skeleton | MS 1 | DONE |
| [TWA-5](#epic-twa-5--playable-game) | Playable Game | MS 1 | REJECTED |
| [TWA-6](#epic-twa-6--statistics) | Statistics | – | IDEA |
| [TWA-7](#epic-twa-7--knowledge-games) | Knowledge Games | MS 2 | IN PROGRESS |
| [TWA-8](#epic-twa-8--interview-preparation) | Interview Preparation | MS 2 | IN PROGRESS |

**Next free epic number: 9**

Order of the epics, milestones and their goals: see the [roadmap](roadmap.md).

---

# Epics & User Stories

## Epic TWA-1 – Vision & Goals

**Status:** DONE · **Milestone:** MS 1 – Project Initialisation

**Description**

As a team, we want to clarify and record the product vision and goals, so that all further epics
contribute to a shared, well-founded goal and priorities can be justified.

**Affected components:** project-wide (docu)

**Result:** [vision.md](vision.md), approved by J on 2026-10-25.

---

### TWA-1.1 – Vision Statement

**Status:** DONE

**Problem Description**

The product has no agreed one-sentence description yet. Without it, decisions about scope and
priority have no common reference. A draft taken over from the Tech Tool Trainer is in
[vision.md](vision.md#vision-statement).

**Action Steps**

1. Review the draft vision statement with J.
2. Adjust the wording to J's feedback.
3. Record the approved version in `vision.md`.

**Acceptance Criteria**

- One concise sentence describes what the product essentially is and does.
- The vision statement is recorded in the documentation and approved by J.

---

### TWA-1.2 – Problem & Target Audience

**Status:** DONE

**Problem Description**

It is not agreed yet which problem the product solves and for whom. The draft names developers as
the main target audience, in particular people preparing for technical interviews; the problem
statements are not yet aligned with that.

**Action Steps**

1. Review the sections "Problem" and "Target Audience" in [vision.md](vision.md#problem) with J.
2. Align the problem statements with the main target audience (interview preparation).
3. Name the target audiences or personas together with their needs.
4. Record the approved version in `vision.md`.

**Acceptance Criteria**

- The core problem is described.
- The target audiences or personas are named together with their needs.
- Problem and target audience are recorded in the documentation and approved by J.

---

### TWA-1.3 – Goals

**Status:** DONE

**Problem Description**

The goal in the draft is deliberately kept general (no specific topics, game formats or
technologies). It is not yet agreed what Tech Wise Academy is meant to achieve.

**Action Steps**

1. Review the section "Goal" in [vision.md](vision.md#goal) with J.
2. Decide with J how specific the goal should be (topics, game formats).
3. Record the approved goals in `vision.md`.

**Acceptance Criteria**

- The product goals (what is to be achieved) are described.
- The goals are recorded in the documentation and approved by J.

---

### TWA-1.4 – Non-Goals

**Status:** DONE

**Problem Description**

Without clear limits the scope grows unnoticed. The draft names only two non-goals.

**Action Steps**

1. Review the non-goals in [vision.md](vision.md#non-goals) with J.
2. Add further limits that J names.
3. Record the approved non-goals in `vision.md`.

**Acceptance Criteria**

- The non-goals are named as a clear delimitation.
- The non-goals are recorded in the documentation and approved by J.

---

### TWA-1.5 – Success Criteria

**Status:** DONE

**Problem Description**

There is no measurable way to tell whether the product achieves its goal. The draft contains one
criterion and a placeholder.

**Action Steps**

1. Collect candidate criteria (e.g. usage, number of learned cards, completed paths).
2. Choose at least one measurable criterion with J.
3. Record the approved criteria in [vision.md](vision.md#success-criteria).

**Acceptance Criteria**

- At least one measurable success criterion is named.
- The success criteria are recorded in the documentation and approved by J.

---

## Epic TWA-2 – Working Rules & Documentation Structure

**Status:** IN PROGRESS · **Milestone:** MS 1 – Project Initialisation

**Description**

As a team, we want binding rules for agents, a described workflow and a fixed documentation
structure, so that humans and agents work the same way from the start. Content is taken over
step by step from the Agentic Template and the Tech Tool Trainer, revised and translated into
English.

**Affected components:** project-wide (docu, .claude)

---

### TWA-2.1 – Backlog Conventions and Roadmap

**Status:** DONE

**Problem Description**

Without fixed conventions, epics and issues are written differently, the Agentic Ticket System
cannot read them and the order of the work is not visible.

**Action Steps**

1. Take over the backlog conventions from the Tech Tool Trainer and translate them.
2. Switch to the project prefix `TWA` with sequential epic numbers.
3. Define the structure of an issue (problem description, action steps, acceptance criteria).
4. Create `roadmap.md` with the milestones.

**Acceptance Criteria**

- ID scheme, issue structure, status values and machine-readable format are described in
  [CLAUDE.md](CLAUDE.md).
- The [roadmap](roadmap.md) shows the milestones with goal, epics and done criteria.

---

### TWA-2.2 – Agent Rules and Workflow

**Status:** DONE

**Problem Description**

Agents need binding rules in every session, but a long workflow description in the always-loaded
`CLAUDE.md` costs context in every session and mixes rules with process.

**Action Steps**

1. Write the binding rules into the root `CLAUDE.md`.
2. Describe the workflow as the skill `/workflow`.
3. Create the sub-agent `backlog-manager` for backlog and roadmap maintenance.

**Acceptance Criteria**

- The root `CLAUDE.md` contains the binding rules (git, language, technology decisions,
  verification, documentation).
- The workflow skill `/workflow` describes the steps plan → implement → verify → finish and
  delegates backlog and roadmap maintenance to the sub-agent `backlog-manager`.

---

### TWA-2.3 – Quality Guidelines

**Status:** TODO

**Problem Description**

There are no written rules for markdown style, naming and when a story is done, so reviews depend
on individual judgement.

**Action Steps**

1. Take over markdown style, naming conventions and definition of done from the Tech Tool Trainer.
2. Translate them and remove references to things that do not exist in this project.
3. Link them from the rules and the workflow skill.

**Acceptance Criteria**

- Markdown style, naming conventions and definition of done are in `docu/quality/`, in English and
  without references to things that do not exist in this project.
- The rules and the workflow link to them.

---

### TWA-2.4 – Decision Records

**Status:** DONE

**Problem Description**

There is no place to record open technology decisions and their outcome. Decisions risk being made
along the way and cannot be traced later.

**Action Steps**

1. Create `docu/adr/open-decisions.md` from the Tech Tool Trainer, with the open decisions on top
   (the next due one first) and the record of the decided ones below.
2. Create an ADR template and an index in `docu/adr/`.
3. Describe the process open decision → proposed ADR → accepted ADR in the workflow skill.

**Acceptance Criteria**

- `docu/adr/open-decisions.md` lists the open decisions (next first) and the record of the
  decided ones.
- `docu/adr/` contains an ADR template and an index.
- The workflow describes the path open decision → proposed ADR → accepted ADR.

**Result:** [open-decisions.md](../adr/open-decisions.md), the [ADR index](../adr/README.md) and the
section "Technology Decisions (ADRs)" in the workflow skill.

---

### TWA-2.5 – Sub-Agents and Project Commands

**Status:** TODO

**Problem Description**

Checks after each change (tests, naming, consistency of the documentation) are done
inconsistently as long as there are no dedicated agents for them.

**Action Steps**

1. Review the agents and commands of the Tech Tool Trainer and select those that fit the current
   state of the project.
2. Translate and adapt them.
3. Name in the rules which agents run at the end of each change.

**Acceptance Criteria**

- Only the agents and commands that fit the current state of the project are taken over and
  translated into English.
- The rules name which agents run at the end of each change.

---

### TWA-2.6 – Developer README

**Status:** TODO

**Problem Description**

There is no README that explains the project to developers and shows how to work with it. The ADR
README is only an index, and the rules for agents live in `CLAUDE.md` and the workflow skill, which
are not written for developers.

**Action Steps**

1. Write a root README: what the product is (link to the vision), the architecture and tech stack
   in short (links to the ADRs and the techstack), how to set up and run the project once the
   skeleton exists (TWA-4) and where the documentation lives.
2. Complete `docu/adr/README.md` for developers: how to read an ADR and its decision matrix.
3. Keep agent rules out of the READMEs; they belong in the workflow skill.

**Acceptance Criteria**

- A root README explains the project to developers and links the vision, roadmap, ADRs and
  techstack.
- The README describes how to set up and run the project (after TWA-4).
- The TODO note in `docu/adr/README.md` is removed.
- Agent-specific rules are in the workflow skill, not in the READMEs.

---

## Epic TWA-3 – Mandatory Decisions Before the First Code

**Status:** DONE · **Milestone:** MS 1 – Project Initialisation

**Description**

As a team, we want to make the unavoidable technology decisions before the first code, so that
nothing has to be rebuilt later. The ADRs of the Tech Tool Trainer and the Agentic Ticket System
serve as input; each decision is confirmed or changed by J, not taken over silently. The decisions
are grouped into three ADRs. The architecture is decided first and language-neutrally; the stacks
then have to support it. Existing code is not a criterion, because the game logic is redesigned.
The testing strategy is not decided here: it is developed in MS 3 and tests stay lean until then.

**Affected components:** all services, frontend, repository, pipeline

**Working documents:** [open-decisions.md](../adr/open-decisions.md), [ADR index](../adr/README.md),
[architecture profiles](../architecture/architecture-profiles.md),
[techstack](../architecture/techstack.md).

### Order

| # | Story | ADR | Topics | Depends on |
|---|-------|-----|--------|------------|
| 1 | [TWA-3.4](#twa-34--architecture-concept) | [ADR-0001](../adr/0001-architecture-concept.md) | Backend structure and its checks, service cut and communication, frontend architecture | – |
| 2 | [TWA-3.6](#twa-36--api-versioning) | [ADR-0001](../adr/0001-architecture-concept.md) | API versioning | – |
| 3 | [TWA-3.1](#twa-31--backend-language-and-framework-version) | [ADR-0002](../adr/0002-backend-stack.md) | Backend language, framework, packages and build | TWA-3.4 |
| 4 | [TWA-3.2](#twa-32--database-and-persistence-access) | [ADR-0002](../adr/0002-backend-stack.md) | Database and persistence access | TWA-3.1 |
| 5 | [TWA-3.3](#twa-33--frontend-stack) | [ADR-0003](../adr/0003-frontend-stack.md) | Frontend framework, tooling, UI, design | TWA-3.4 |
| 6 | [TWA-3.5](#twa-35--formatter-and-linting) | [ADR-0002](../adr/0002-backend-stack.md), [ADR-0003](../adr/0003-frontend-stack.md) | Formatter and linting | TWA-3.1, TWA-3.3 |
| 7 | [TWA-3.8](#twa-38--api-description-and-generated-types) | [ADR-0002](../adr/0002-backend-stack.md) | API description and generated frontend types | TWA-3.1, TWA-3.3 |

**Common acceptance criteria (apply to every story):**

- The decision is recorded in its ADR in `docu/adr/` with a decision matrix and marked "accepted"
  in the outcome table.
- The entries in `open-decisions.md` are `DONE` and link the ADR; accepted technologies are listed
  in the techstack.

---

### TWA-3.1 – Backend Language and Framework Version

**Status:** DONE · **Before:** first backend code · **Depends on:** TWA-3.4

**Problem Description**

Language, framework, versions and build tool of the backend are not fixed. If they change after the
start, all code has to be rewritten or upgraded. The stack is evaluated language-neutrally against
the requirements of the architecture concept.

**Action Steps**

1. Compare the stacks language-neutrally in a decision matrix in
   [ADR-0002](../adr/0002-backend-stack.md) (input: Tech Tool Trainer ADR-0009, Agentic Ticket
   System ADR-0008).
2. J decides.
3. Mark the topics "accepted" in the outcome table of ADR-0002, set the entry in
   `open-decisions.md` to `DONE` and fill in the techstack.

**Acceptance Criteria**

- ADR-0002 names language, framework and package tool; the exact versions are pinned in
  `pyproject.toml` and `uv.lock` when the backend is created (TWA-4.2).

**Result:** [ADR-0002](../adr/0002-backend-stack.md) accepted by J on 2026-10-25 – Python 3.14,
FastAPI, uv.

---

### TWA-3.2 – Database and Persistence Access

**Status:** DONE · **Before:** first repository · **Depends on:** TWA-3.1

**Problem Description**

It is not fixed which database is used and how the code accesses it, so every repository could
be built differently.

**Action Steps**

1. Add the options for the database and for the access library, each with a decision matrix, to
   [ADR-0002](../adr/0002-backend-stack.md) (input: Tech Tool Trainer ADR-0010, `ticket-service` of
   the Agentic Ticket System).
2. J decides.
3. Mark the topic "accepted" in the outcome table of ADR-0002 and set the entry in
   `open-decisions.md` to `DONE`.

**Acceptance Criteria**

- ADR-0002 names database, access approach and migration tool.

**Result:** [ADR-0002](../adr/0002-backend-stack.md) accepted by J on 2026-10-25 – PostgreSQL,
SQLAlchemy 2 with psycopg, migrations with Alembic.

---

### TWA-3.3 – Frontend Stack

**Status:** DONE · **Before:** first UI code · **Depends on:** TWA-3.4

**Problem Description**

The frontend skeleton cannot be created until framework, build tooling, UI components, styling and
design are fixed.

**Action Steps**

1. Write the options with one decision matrix per topic into
   [ADR-0003](../adr/0003-frontend-stack.md) (input: Tech Tool Trainer ADR-0003 to ADR-0005 and
   ADR-0008).
2. J decides.
3. Mark the topics "accepted" in the outcome table of ADR-0003 and the entries in
   `open-decisions.md` to `DONE`.

**Acceptance Criteria**

- ADR-0003 covers framework, build and tooling, UI components and styling, and design.

**Result:** [ADR-0003](../adr/0003-frontend-stack.md) accepted by J on 2026-10-25 – React +
TypeScript (SPA), Vite, npm, ESLint, Prettier, Tailwind CSS + shadcn/ui, own design tokens in light
and dark. The colour concept is developed in MS 3.

---

### TWA-3.4 – Architecture Concept

**Status:** DONE · **Before:** first service

**Problem Description**

It is not defined how code is structured inside the backend and the frontend, whether the backend
is one application or several services, nor how these rules are checked automatically. Without
this, every part grows its own structure.

**Action Steps**

1. Write the options with one decision matrix per topic into
   [ADR-0001](../adr/0001-architecture-concept.md): backend structure and its checks, service cut
   and communication, frontend architecture (input: Tech Tool Trainer ADR-0001, ADR-0002,
   ADR-0007). Question every option against the size of the product.
2. J decides.
3. Mark the topics "accepted" in the outcome table of ADR-0001 and the entries in
   `open-decisions.md` to `DONE`.

**Acceptance Criteria**

- ADR-0001 names the backend structure and how it is checked, whether the backend is one
  application or several services, and the frontend architecture.

**Result:** [ADR-0001](../adr/0001-architecture-concept.md) accepted by J on 2026-10-25 – Layered
backend as one application with modules, automatic architecture tests, frontend feature modules.

---

### TWA-3.5 – Formatter and Linting

**Status:** DONE · **Before:** first code · **Depends on:** TWA-3.1, TWA-3.3

**Problem Description**

Without a formatter and linting, code from humans and agents looks different and reviews get stuck
on formatting instead of content.

**Action Steps**

1. Compare the options for the backend in [ADR-0002](../adr/0002-backend-stack.md) and for the
   frontend in [ADR-0003](../adr/0003-frontend-stack.md).
2. J decides.
3. Mark the topics "accepted" and set the entry in `open-decisions.md` to `DONE`.

**Acceptance Criteria**

- ADR-0002 and ADR-0003 name formatter and linter for backend and frontend.

**Result:** accepted by J on 2026-10-25 – backend: Ruff + ty
([ADR-0002](../adr/0002-backend-stack.md)); frontend: ESLint + Prettier
([ADR-0003](../adr/0003-frontend-stack.md)).

---

### TWA-3.6 – API Versioning

**Status:** DONE · **Before:** first endpoint used by the frontend

**Problem Description**

It is not decided whether and how APIs are versioned. Changing paths later breaks all callers.

**Action Steps**

1. Compare the options in a decision matrix in
   [ADR-0001](../adr/0001-architecture-concept.md).
2. J decides.
3. Mark the topic "accepted" and set the entry in `open-decisions.md` to `DONE`.

**Acceptance Criteria**

- ADR-0001 states the versioning rule.

**Result:** [ADR-0001](../adr/0001-architecture-concept.md) accepted by J on 2026-10-25 – no version
in the path, compatible changes only.

**Carry-over:** the rule is referenced in the API documentation template. That acceptance
criterion moved to [TWA-4.3](#twa-43--backend-skeleton-and-tool-api), which creates the API
documentation.

---

### TWA-3.8 – API Description and Generated Types

**Status:** DONE · **Before:** first endpoint used by the frontend · **Depends on:** TWA-3.1, TWA-3.3

**Problem Description**

The architecture concept requires an API description generated from the code so that the frontend
can generate its types. It is not decided how the API is described, how the frontend gets its types
from it and which role Markdown API documentation keeps. Without this, backend and frontend types
drift apart.

**Action Steps**

1. Add the options with a decision matrix to [ADR-0002](../adr/0002-backend-stack.md) (input:
   Agentic Ticket System ADR-0009).
2. J decides.
3. Mark the topic "accepted" and set the entry in `open-decisions.md` to `DONE`.

**Acceptance Criteria**

- ADR-0002 states how the API is described and how the frontend gets its types.
- ADR-0002 states which role Markdown API documentation keeps next to the generated description.

**Result:** [ADR-0002](../adr/0002-backend-stack.md) accepted by J on 2026-10-25 – OpenAPI generated
by FastAPI, frontend types generated from it, Markdown API documentation only as functional
complement.

---

## Epic TWA-4 – Runnable Project Skeleton

**Status:** DONE · **Milestone:** MS 1 – Project Initialisation

**Description**

As a team, we want a runnable skeleton with backend, frontend, database and local environment, with
one first entity (the Tool) working end to end, so that functional epics can build on a proven
chain: database, API and frontend. The skeleton is created according to the decisions from TWA-3.
Its only functional content is the entity Tool with read access; existing code of the Tech Tool
Trainer is not taken over. The first slice is German; English follows in MS 3.

**Affected components:** repository, backend, frontend

**Working documents:** [data model](../data_model/learning-content-data-model.md),
[context map](../architecture/context-map.md), [API documentation](../api/learning-content-api.md)

### Order

| # | Story | Result | Depends on |
|---|-------|--------|------------|
| 1 | [TWA-4.1](#twa-41--bounded-contexts) | Bounded contexts and module names | TWA-1 |
| 2 | [TWA-4.2](#twa-42--data-model-of-the-first-entity) | Data model of the Tool, **approved by J before any setup** | – |
| 3 | [TWA-4.3](#twa-43--backend-skeleton-and-tool-api) | Backend with the Tool API and German seed data | TWA-4.1, TWA-4.2 |
| 4 | [TWA-4.4](#twa-44--frontend-skeleton-with-data-sets-tab) | Frontend with the Data-Sets tab (list of terms), German UI | TWA-4.3, TD-33 |
| 5 | [TWA-4.5](#twa-45--local-environment-with-one-command) | Everything starts with one command | TWA-4.3, TWA-4.4, TD-35 |

**Moved to MS 3:** the English content and UI (see the [roadmap](roadmap.md)). The story number
TWA-4.6 is retired, because it was never started.

---

### TWA-4.1 – Bounded Contexts

**Status:** DONE · **Depends on:** TWA-1

**Problem Description**

It is not defined which bounded contexts exist and which module owns which data, so the module
structure of the backend and the home of the first entity are unclear.

**Action Steps**

1. Derive the bounded contexts from the approved vision. Proposal: Learning Content (tools, later
   learning packs) and Training (game rounds, learning progress; MS 2).
2. Give each context a responsibility and a module name; only `learning_content` gets code in this
   epic.
3. Describe the relationship between the contexts in the
   [context map](../architecture/context-map.md) (draft is written).
4. Agree the result with J.

**Acceptance Criteria**

- Each bounded context has a responsibility and a module name.
- The context map describes the relationship between the contexts.
- It is stated which module owns the entity Tool.

**Result:** bounded contexts agreed by J on 2026-10-27: Learning Content (`learning_content`), Training (`training`, designed in MS 2) and Identity and Access (TD-17). Details in the [context map](../architecture/context-map.md).

---

### TWA-4.2 – Data Model of the First Entity

**Status:** DONE

**Problem Description**

The first entity must be modelled before anything is set up, because the migration, the API and the
frontend all depend on it. The Tool of the Tech Tool Trainer has more fields than the first slice
needs.

**Action Steps**

1. Document the entity Tool with its hints, examples and alternatives in the
   [data model](../data_model/learning-content-data-model.md) (draft is written).
2. Go through the draft with J and settle the open points.
3. J approves the data model. No backend, frontend or database setup starts before this approval.

**Acceptance Criteria**

- The data model lists the tables, fields, types, required fields, relations, the category values
  and the seed tools.
- The open points of the data model are decided.
- J has approved the data model.

**Result:** [data model](../data_model/learning-content-data-model.md) approved by J on 2026-10-25
(five tables, German first, one category per tool, seven seed tools).
---

### TWA-4.3 – Backend Skeleton and Tool API

**Status:** DONE · **Depends on:** TWA-4.1, TWA-4.2

**Problem Description**

There is no backend code yet, so functional code has no fixed place and the architecture rules are
not yet proven.

**Action Steps**

1. Create the backend with uv and FastAPI and pin the dependency versions with `uv.lock`. Create
   the module `learning_content` with the layers `api`, `service` and `repository` according to
   [ADR-0001](../adr/0001-architecture-concept.md).
2. Configure Ruff and ty, and add the automatic architecture tests (import-linter) for the layers
   and the module boundaries.
3. Connect PostgreSQL via environment variables and write the Alembic migration for the approved
   data model, including the seed tools with their German texts.
4. Implement read access as described in the [API documentation](../api/learning-content-api.md):
   list the tools and get one tool by key, with hints, examples and alternatives. The `lang`
   parameter defaults to German. Export the OpenAPI description.
5. Add lean tests for the non-trivial rules: alternatives are returned from both sides of a pair,
   and no hint contains the name of its tool.
6. Finalise the API documentation and state the versioning rule of ADR-0001 in it.
7. Add the commands for build, test and start to the rules.

**Acceptance Criteria**

- The backend starts and returns the seed tools with German hints, examples and alternatives.
- The API accepts the `lang` parameter and returns German texts by default.
- The architecture tests pass and fail when a layer or module rule is violated.
- Ruff and ty report no findings.
- The OpenAPI description can be exported.
- The API documentation describes the endpoints and states the versioning rule of ADR-0001
  (carry-over from TWA-3.6).
- The commands for build, test and start are in the rules.

**Result:** implemented: uv project in `backend/`, module `learning_content` with layers, Alembic migration `0001` with seed tools, read API with `lang`; 11 tests, Ruff, ty and import-linter pass; API checked against PostgreSQL.

---

### TWA-4.4 – Frontend Skeleton with Data-Sets Tab

**Status:** DONE · **Depends on:** TWA-4.3, TD-33

**Problem Description**

There is no frontend yet, so the chain from database to screen is not proven and the module
structure of the frontend is not yet in place.

**Action Steps**

1. Decide the icon source with J (TD-33, recorded in an ADR) before the page is built.
2. Create the frontend according to [ADR-0003](../adr/0003-frontend-stack.md): Vite, React,
   TypeScript strict, Tailwind CSS with shadcn/ui, ESLint and Prettier.
3. Create the feature module `tools` according to the frontend structure of
   [ADR-0001](../adr/0001-architecture-concept.md) and add the ESLint rules for the module
   boundaries.
4. Generate the API types from the exported OpenAPI description.
5. Add a tab "Data-Sets" that shows a list of the terms, i.e. the names of the tools,
   each with its icon or, if it has none, the icon of its category. The UI texts are German.
   Further tabs and a detail page follow later.
6. Add the commands for build, lint and start to the rules.

**Acceptance Criteria**

- Type check, lint and format check pass.
- The tab "Toolübersicht" lists the seed tools from the running backend.
- Terms with an icon show it; the others show the icon of their category.
- The API types are generated, not written by hand.
- The ESLint rules for the module boundaries are active.
- The UI texts are German.

**Result:** implemented: Vite, React, TypeScript, Tailwind, ESLint boundary rules, Data-Sets tab with icons ([ADR-0005](../adr/0005-tool-icons.md)); typecheck, lint, format and build pass.

---

### TWA-4.5 – Local Environment with One Command

**Status:** DONE · **Depends on:** TWA-4.3, TWA-4.4, TD-35

**Problem Description**

Starting the database, the migration, the backend and the frontend requires manual steps, which
slows down development and leads to different local setups. The tooling for containers is not yet
decided (TD-35), so the compose file cannot be written.

**Action Steps**

1. Decide the local container runtime and the compose tooling with J (TD-35, recorded in an ADR).
2. Describe database, migration, backend and frontend in one compose file.
3. Provide an example environment file with all local values.
4. Document the start command in the rules.

**Acceptance Criteria**

- One command starts everything in the right order; ports are bound to `127.0.0.1` only.
- No secrets in the repository; local values come from an example environment file.
- The start command is in the rules.

**Result:** implemented: `compose.yaml` with database, backend (migration on start) and frontend; `.env.example`; all services start and answer through the proxy ([ADR-0004](../adr/0004-local-environment.md)).

## Epic TWA-5 – Playable Game

**Status:** REJECTED · **Milestone:** MS 1 – Project Initialisation

**Description**

As a learner, we want to find out in which areas we already know the tools, so that we know where to
learn. In MS 1 a dummy game (Level 0) checks this by sorting the cards; the full game with several
levels and content follows in MS 2. The rules of the game are documented only in
[game-play.md](../game-play.md); this epic and its stories refer to that document and do not repeat
the rules.

**Affected components:** frontend (Game tab, app shell, feature `game`), documentation

**Working documents:** [game-play](../game-play.md)

---

### TWA-5.1 – Level 0: Knowledge Check

**Status:** REJECTED

**Problem Description**

Nothing shows which of the five areas a learner already knows. The tools are only listed in a table,
and the menu has no tab for a game next to the tool overview.

**Action Steps**

1. Add a menu bar with tabs; the Game tab comes first, before the tool overview, and starts the game
   when it is selected.
2. Implement Level 0 as described in [game-play.md](../game-play.md): the cards are sorted onto the
   piles of their categories, by drag or by click.
3. Show the result per area: how many tools were sorted correctly on the first try.
4. Let the tool list use the full width of the screen.
5. Review the implementation and the rules with J; open points in game-play.md are decided by J.

**Acceptance Criteria**

- The menu bar has the tabs "Game" and "Toolübersicht", in this order; "Game" is selected at start.
- Selecting the Game tab starts Level 0 with all tools.
- A card can be sorted onto its category pile by drag and by click; the category is shown after
  placement.
- A wrong pile keeps the card in the hand, counts a wrong attempt and shows the message.
- When all cards are sorted, the result shows per area how many tools were sorted correctly on the
  first try, the wrong attempts, and offers to play again.
- The tool list spans the full width of the screen.
- The game rules are documented only in [game-play.md](../game-play.md); the story does not repeat them.
- Type check, lint, format check and build pass.

**Result:** rejected as a separate epic. The code of Level 0 is committed together with the project
skeleton in TWA-4 ("TWA-4: Add project skeleton"); the number TWA-5 stays taken.

---

## Epic TWA-6 – Statistics

**Status:** IDEA

**Description**

As a learner, we want to see how my learning progress develops per game and per area, so that I can
judge where I stand and what to learn next.

**Affected components:** frontend (Game tab, statistics page), backend (feature `training`),
documentation

**Note:** the statistics page per user is an expected result of MS 2 (see the [roadmap](roadmap.md)).
The epic has no milestone and no stories yet; it is planned in detail when MS 2 is planned.

---

## Epic TWA-7 – Knowledge Games

**Status:** IN PROGRESS · **Milestone:** MS 2 – Playable MVP

**Description**

As a learner, we want to find out which tools we already know by playing two games, so that we know
where to learn. The games are Wissens-Check (falling cards onto the areas) and Karten abräumen
(clearing the field by naming the tool from its hints). Each game has three levels; the level is set
automatically, and the level after one is open when every tool of the level before is learned.

**Affected components:** frontend (Game tab, feature `game`), backend (feature `training`),
documentation

**Working documents:** [game-play](../game-play.md)

**Note:** the rules are documented only in [game-play.md](../game-play.md). J assigned the epic to
MS 2. The stories below record what was
built (commit 71f586e on branch `twa-7-knowledge-games`). The epic stays IN PROGRESS until J has
reviewed the games in the browser.

---

### TWA-7.1 – Wissens-Check

**Status:** DONE

**Problem Description**

A learner cannot find out in which of the five areas the tools are already known. The tools are only
listed, and there is no game that checks the knowledge per area.

**Action Steps**

1. Let the cards fall onto the five areas, in a round of 90 s.
2. Count a card as learned after two correct placements in a row.
3. Show a summary per area at the end of the round.
4. Document the rules in [game-play.md](../game-play.md).

**Acceptance Criteria**

- A round lasts 90 s; falling cards can be placed onto the five areas.
- A card counts as learned after two correct placements in a row.
- At the end of the round a summary per area is shown.
- The rules are documented only in [game-play.md](../game-play.md).

**Result:** implemented in `frontend/src/features/game/components/card-drop-board.tsx` and
`frontend/src/features/game/lib/drop.ts`; rules in [game-play.md](../game-play.md).

---

### TWA-7.2 – Karten abräumen

**Status:** DONE

**Problem Description**

The Wissens-Check only asks for the area of a tool. Nothing checks whether a learner can name a tool
from its hints.

**Action Steps**

1. Show a field of up to 20 cards and the hints of the asked card.
2. Offer "Nächster Hinweis" and "Weiß ich nicht".
3. Count a card as learned after two first-try answers in a row.

**Acceptance Criteria**

- The field shows up to 20 cards and the hints of the asked card.
- "Nächster Hinweis" shows the next hint; "Weiß ich nicht" gives up the card.
- A card counts as learned after two first-try answers in a row.

**Result:** implemented in `frontend/src/features/game/components/clearing-board.tsx` and
`frontend/src/features/game/lib/clearing.ts`.

---

### TWA-7.3 – Saved Progress and Three Levels

**Status:** DONE

**Problem Description**

Without saved progress a learner starts from zero in every round, and all tools are asked at once
regardless of how much the learner already knows.

**Action Steps**

1. Save the progress per player (anonymous profile ID) and per game in the backend feature
   `training`.
2. Add the levels Kennen, Intermediate and Expert to the tools and the games.
3. Unlock the levels one after another.

**Acceptance Criteria**

- The progress is saved per player (anonymous profile ID) and per game.
- Each game has the levels Kennen, Intermediate and Expert.
- A level is unlocked only after the level before it.

**Result:** implemented in `backend/src/tech_wise_academy/training/`, migrations `0003` to `0005`
(`backend/migrations/versions/`) and `frontend/src/features/game/pages/game-page.tsx`.

---

### TWA-7.4 – Programming Language Set

**Status:** DONE

**Problem Description**

The games only know the tools of the five areas. Programming languages cannot be practised, and
TypeScript is filed under FRONTEND although it is a language. The catalogue also lacks common AI
models and tools.

**Action Steps**

1. Add a second set of 23 common programming languages, sorted by five paradigms (objektorientiert,
   funktional, prozedural, deklarativ, multiparadigma); the paradigms extend the `Category` enum
   (migration `0007`).
2. Move TypeScript from FRONTEND to the languages.
3. Make the set selectable in the Game tab, without levels or unlocking.
4. Add eight AI models and tools to the catalogue: Llama, Gemma, Qwen, Mistral, FLUX.2 Klein, SDXL,
   Whisper, ComfyUI (migration `0006`).

**Acceptance Criteria**

- The Game tab offers the language set with 23 languages in five paradigms, without levels or
  unlocking.
- TypeScript belongs to the languages, not to FRONTEND.
- The eight AI models and tools are in the catalogue.

**Result:** implemented in migrations `0006_seed_ai_models.py` and `0007_programming_languages.py`
(`backend/migrations/versions/`) and `frontend/src/features/game/pages/game-page.tsx`. **Open
point:** the Toolübersicht still shows the raw code of the paradigm (e.g. `OBJECT_ORIENTED`) for
languages.

---

### TWA-7.5 – Overview Card and Review of Wrong Cards

**Status:** DONE

**Problem Description**

After a round the learner sees which cards were wrong, but cannot look up what the tool is. There is
no detailed view of a tool in the games.

**Action Steps**

1. Add a detailed Quartett-style card per tool: name, logo, area, level, summary, all hints,
   example, alternatives and documentation link.
2. Make the wrong cards in the Wissens-Check summary clickable.
3. Let the learner page through the wrong cards with Zurück, Weiter and Schließen.

**Acceptance Criteria**

- The overview card shows name, logo, area, level, summary, all hints, example, alternatives and
  documentation link of a tool.
- In the Wissens-Check summary a wrong card opens its overview card.
- Zurück and Weiter page through the wrong cards; Schließen closes the card.

**Result:** implemented in `frontend/src/features/game/components/tool-overview-card.tsx` and
`frontend/src/features/game/components/card-drop-board.tsx`.

---

## Epic TWA-8 – Interview Preparation

**Status:** IN PROGRESS · **Milestone:** MS 2 – Playable MVP

**Description**

As a learner preparing for a job interview, we want to paste a job advertisement and get a card set
from its tech stack, so that we practise exactly the tools this job asks for. Everything runs in the
local network; no text leaves it.

**Affected components:** backend (new module `interview`, `learning_content` public interface),
database (pgvector), compose (mount of the model folder into the backend), frontend (feature `interview`, feature `game`),
documentation

**Working documents:**
[ADR-0006](../adr/0006-local-semantic-matching.md),
[data model](../data_model/interview-data-model.md), [API](../api/interview-api.md),
[game-play](../game-play.md)

**Note:** the rules of the game are documented only in [game-play.md](../game-play.md).

---

### TWA-8.1 – Decide Vector Store, Embedding Runtime and Model

**Status:** DONE

**Problem Description**

Matching a job ad to tools needs vectors, a place to store them and a model that produces them. J
has set two conditions: everything stays in the local network, and Postgres moves to pgvector. The
runtime, the model and the matching approach are not decided yet.

**Action Steps**

1. Compare the options in ADR-0006 with decision matrices.
2. J decides the topics that J has not stated yet (embedding runtime, embedding model, matching
   approach, stored similarity values).
3. Mark the topics accepted, move the decisions to chapter 2 of open-decisions.md and update the
   techstack.

**Acceptance Criteria**

- ADR-0006 names vector store, runtime, model, matching approach and what is stored.
- Every topic is accepted by J.
- open-decisions.md and the techstack are up to date.

**Result:** [ADR-0006](../adr/0006-local-semantic-matching.md) accepted by J on 2026-11-02, decided
without the postponed measurement (TWA-8.6): pgvector, matching approach C (names exact plus
embeddings), ONNX Runtime inside the backend, model paraphrase-multilingual-MiniLM-L12-v2,
similarity stored for every tool per set.

---

### TWA-8.2 – pgvector and Tool Embeddings

**Status:** DONE · **Depends on:** TWA-8.1

**Problem Description**

The database cannot store or compare vectors, and the tools have no embeddings, so no similarity can
be computed.

**Action Steps**

1. Switch the database image to pgvector.
2. Run the embedding model inside the backend with ONNX Runtime and mount its folder read-only
   into the backend in compose.
3. Migration with the extension and the tables.
4. Embed name, summary and hints of each tool; embed again only what changed.

**Acceptance Criteria**

- Migrations run against a real database, including on a database that already holds the earlier
  migrations.
- All tools have an embedding per model.
- A changed text is embedded again on the next generation; unchanged ones are not.
- No call leaves the local network at runtime.

**Result:** migration `backend/migrations/versions/0008_interview_sets.py` (pgvector 0.8.7, run on
the real database: 307 tool embeddings), embedder
`backend/src/tech_wise_academy/interview/embedding.py`. The model (118.5 MB) lies in a host folder
mounted into the backend; there is no Ollama.

---

### TWA-8.3 – Generate an Interview Set from a Job Ad

**Status:** DONE · **Depends on:** TWA-8.2

**Problem Description**

There is no way to turn a job advertisement into cards. Without it a learner has to pick the
relevant tools by hand from over 300.

**Action Steps**

1. Split the ad into chunks and embed them.
2. Find the tools the ad names.
3. Compute the similarity of every tool in pgvector and rank the cards.
4. Persist the set, its chunks and all similarity values per profile.
5. API to create, list, read and delete sets.

**Acceptance Criteria**

- A pasted ad yields a set with the named tools first and fitting tools after them.
- The similarity of every tool to the ad is stored in Postgres.
- A set is only visible to its profile.
- Without the embedding service the API answers 503 and stores nothing.

**Result:** backend feature `backend/src/tech_wise_academy/interview/`, API described in
[interview-api.md](../api/interview-api.md); 307 similarity rows per set are stored.

---

### TWA-8.4 – Play an Interview Set

**Status:** DONE · **Depends on:** TWA-8.3

**Problem Description**

A generated set is of no use if it cannot be played. The games only know the two fixed sets, and the
Wissens-Check has five areas, while an interview set can mix tools and languages.

**Action Steps**

1. Add the set "Eigene Sets" to the Game tab, with the interview preparation as its first feature: a text field for the ad and the saved sets.
2. Show the cards with similarity and the sentence of the ad behind them.
3. Play the set in both games; mixed sets get a sixth area "Sprachen".
4. Describe the rules in game-play.md.

**Acceptance Criteria**

- Pasting an ad in the UI yields a card set.
- The set can be played in Wissens-Check and Karten abräumen.
- Saved sets can be selected and deleted.
- The UI texts are German.
- Type check, lint and format check pass.

**Result:** `frontend/src/features/interview/` and the set "Eigene Sets" in
`frontend/src/features/game/pages/game-page.tsx`; the flow works in the browser.

---

### TWA-8.5 – Tools Missing from the Catalogue

**Status:** IDEA

**Problem Description**

Job ads often name technologies that have no card: the seed has no PostgreSQL, MySQL, Linux, AWS,
Azure or Google Cloud. An interview set stays silent about them, so the learner does not see the
gap.

**Action Steps**

1. Collect the terms that real ads name and that have no card.
2. J decides which get cards.
3. Add them with a migration, or show the uncovered terms in the set.

**Acceptance Criteria**

- The most common technologies of real ads have a card, or the set shows which terms it does not
  cover.

---

### TWA-8.6 – Measure the Matching Approaches

**Status:** IDEA

**Postponed:** postponed by J on 2026-11-02, together with the 5 test ads. The decision in
[ADR-0006](../adr/0006-local-semantic-matching.md) is taken on the recommendations without this
measurement.

**Note:** a sanity check on four sample ads after the implementation found only about 25 % correct
"similar" cards, no better than lexical search. The measurement matters if the similar cards are to
stay.

**Problem Description**

It is not known which matching approach finds the right tools in real job ads. Without a measurement,
J would decide TD-37 to TD-41 on assumptions, and an approach with extra cost or extra components
could be chosen without a real gain.

**Action Steps**

1. J provides 5 real public job ads and labels them. The ads are third-party texts and are not
   committed.
2. Write a measurement test with Testcontainers (TD-03, decided by J on 2026-11-02; brought forward
   from MS 3 for this test only) that runs the ads against four variants: A names plus a curated
   concept list, B lexical search with English keywords per tool, C
   paraphrase-multilingual-MiniLM-L12-v2 via ONNX Runtime, E LLM extraction with Claude Haiku 5.5
   (only with an API key).
3. Keep the test out of the normal unit test run.
4. J confirms the success bar proposed in [ADR-0006](../adr/0006-local-semantic-matching.md): at
   least 50 % of the up to 6 extra cards correct and at least 15 points above B.
5. Run the measurement and record the results in ADR-0006.
6. J decides TD-37 to TD-41.

**Acceptance Criteria**

- The measurement test runs variants A, B, C and E (E only with an API key) against the 5 labelled
  ads in a database started by Testcontainers.
- The test does not run in the normal unit test run.
- No job ad is committed.
- The success bar is confirmed by J.
- The results are recorded in ADR-0006.

---

