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
| [TWA-4](#epic-twa-4--runnable-project-skeleton) | Runnable Project Skeleton | MS 1 | TODO |

**Next free epic number: 5**

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
criterion moves to the story that creates the API documentation.

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

**Status:** TODO · **Milestone:** MS 1 – Project Initialisation

**Description**

As a team, we want a runnable skeleton with backend, frontend and local environment, so that
functional epics can build on it directly. The skeleton is created according to the decisions
from TWA-3 and contains no functional code yet.

**Affected components:** repository, backend, frontend

---

### TWA-4.1 – Domain Map and Bounded Contexts

**Status:** TODO · **Depends on:** TWA-1

**Problem Description**

It is not defined which bounded contexts exist and which context owns which data, so neither the
module structure nor the skeleton can be planned.

**Action Steps**

1. Derive core, supporting and generic domains from the approved vision.
2. Cut the bounded contexts and give each a responsibility and a module name (or service name,
   depending on the service cut in ADR-0001).
3. Describe the relationships between the contexts in a context map.
4. Agree the result with J.

**Acceptance Criteria**

- Core, supporting and generic domains are named.
- Each bounded context has a responsibility and a module or service name.
- A context map describes the relationships between the contexts.

---

### TWA-4.2 – Backend and Frontend as Skeleton

**Status:** TODO · **Depends on:** TWA-3, TWA-4.1

**Problem Description**

There is no buildable code base yet, so functional code has no fixed place.

**Action Steps**

1. Create the backend with one module per bounded context according to the architecture concept. Pin the
   dependency versions with `uv.lock`.
2. Create the frontend according to the frontend ADRs.
3. Add the automatic architecture tests for the backend rules.
4. Add the commands for build, test and start to the rules.

**Acceptance Criteria**

- Backend and frontend build and their (empty) tests pass.
- The backend structure is documented and has automatic architecture tests.
- The rules contain the commands for build, test and start.

---

### TWA-4.3 – Local Environment with One Command

**Status:** TODO · **Depends on:** TWA-4.2

**Problem Description**

Starting databases, migrations and services requires manual steps, which slows down development
and leads to different local setups.

**Action Steps**

1. Describe databases, migrations and services in one compose file.
2. Provide an example environment file with all local values.
3. Document the start command in the rules.

**Acceptance Criteria**

- One command starts everything in the right order; ports are bound to `127.0.0.1` only.
- No secrets in the repository; local values come from an example environment file.
