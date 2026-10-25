# Product Backlog

Product backlog with **product-wide sequential** numbering. The backlog starts with Epic
**TWA-1 – Vision & Goals** and grows step by step. The ID and status scheme, the structure of an
issue and the machine-readable format are described in [CLAUDE.md](CLAUDE.md).

## Status Overview

| Epic | Title | Milestone | Status |
|------|-------|-----------|--------|
| [TWA-1](#epic-twa-1--vision--goals) | Vision & Goals | MS 1 | DONE |
| [TWA-2](#epic-twa-2--working-rules--documentation-structure) | Working Rules & Documentation Structure | MS 1 | IN PROGRESS |
| [TWA-3](#epic-twa-3--mandatory-decisions-before-the-first-code) | Mandatory Decisions Before the First Code | MS 1 | TODO |
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

**Status:** TODO

**Problem Description**

There is no place to record open technology decisions and their outcome. Decisions risk being made
along the way and cannot be traced later.

**Action Steps**

1. Create `docu/open-decisions.md` from the Tech Tool Trainer and keep only the relevant entries.
2. Create an ADR template and an index in `docu/adr/`.
3. Describe the path open decision → proposed ADR → accepted ADR in the workflow skill.

**Acceptance Criteria**

- `docu/open-decisions.md` lists the open decisions with status.
- `docu/adr/` contains an ADR template and an index.
- The workflow describes the path open decision → proposed ADR → accepted ADR.

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

## Epic TWA-3 – Mandatory Decisions Before the First Code

**Status:** TODO · **Milestone:** MS 1 – Project Initialisation

**Description**

As a team, we want to make the unavoidable technology decisions before the first code, so that
nothing has to be rebuilt later. The ADRs of the Tech Tool Trainer serve as input; each decision
is confirmed or changed by J, not taken over silently.

**Affected components:** all services, frontend, repository, pipeline

**Common acceptance criteria (apply to every story):**

- An ADR with status "accepted" is in `docu/adr/` and listed in the ADR index.
- The entry in `open-decisions.md` is `DONE` and links the ADR.

---

### TWA-3.1 – Backend Language and Framework Version

**Status:** TODO · **Before:** first backend code

**Problem Description**

Language and framework versions of the backend are not fixed. If they change shortly after the
start, all code has to be upgraded.

**Action Steps**

1. Collect the options in `open-decisions.md` (input: Tech Tool Trainer ADR-0009).
2. Create an ADR with status "proposed".
3. J decides.
4. Set the ADR to "accepted" and the entry in `open-decisions.md` to `DONE`.

**Acceptance Criteria**

- The ADR names language, framework and their versions.

---

### TWA-3.2 – Persistence Access

**Status:** TODO · **Before:** first repository · **Depends on:** TWA-3.1

**Problem Description**

It is not fixed how services access the database, so every repository could be built differently.

**Action Steps**

1. Collect the options in `open-decisions.md` (input: Tech Tool Trainer ADR-0010).
2. Create an ADR with status "proposed".
3. J decides.
4. Set the ADR to "accepted" and the entry in `open-decisions.md` to `DONE`.

**Acceptance Criteria**

- The ADR names database and access approach.

---

### TWA-3.3 – Frontend Stack

**Status:** TODO · **Before:** first UI code

**Problem Description**

The frontend skeleton cannot be created until framework, build tooling, UI components, styling and
test setup are fixed.

**Action Steps**

1. Collect the options in `open-decisions.md` (input: Tech Tool Trainer ADR-0003 to ADR-0008).
2. Create one ADR per topic with status "proposed".
3. J decides.
4. Set the ADRs to "accepted" and the entries in `open-decisions.md` to `DONE`.

**Acceptance Criteria**

- ADRs cover framework, build and tooling, UI components and styling, frontend tests, frontend
  architecture and design.

---

### TWA-3.4 – Architecture Profile per Service

**Status:** TODO · **Before:** first service · **Depends on:** TWA-4.1

**Problem Description**

The internal structure of each service (e.g. DDD / Hexagonal or Layered) is not defined, so it
cannot be followed consistently or checked automatically.

**Action Steps**

1. Collect the profiles in `open-decisions.md` (input: Tech Tool Trainer ADR-0001 and ADR-0002).
2. Create one ADR per service with status "proposed".
3. J decides.
4. Set the ADRs to "accepted" and the entries in `open-decisions.md` to `DONE`.

**Acceptance Criteria**

- One ADR per service names its profile.

---

### TWA-3.5 – Formatter and Linting

**Status:** TODO · **Before:** first code · **Depends on:** TWA-3.1, TWA-3.3

**Problem Description**

Without a formatter and linting, code from humans and agents looks different and reviews get stuck
on formatting instead of content.

**Action Steps**

1. Collect the options for backend and frontend in `open-decisions.md`.
2. Create an ADR with status "proposed".
3. J decides.
4. Set the ADR to "accepted" and the entry in `open-decisions.md` to `DONE`.

**Acceptance Criteria**

- The ADR names formatter and linter for backend and frontend.

---

### TWA-3.6 – API Versioning

**Status:** TODO · **Before:** first endpoint used by the frontend

**Problem Description**

It is not decided whether and how APIs are versioned. Changing paths later breaks all callers.

**Action Steps**

1. Collect the options in `open-decisions.md`.
2. Create an ADR with status "proposed".
3. J decides.
4. Set the ADR to "accepted", the entry in `open-decisions.md` to `DONE` and reference the rule in
   the API documentation template.

**Acceptance Criteria**

- The ADR states the rule; it is referenced in the API documentation template.

---

## Epic TWA-4 – Runnable Project Skeleton

**Status:** TODO · **Milestone:** MS 1 – Project Initialisation

**Description**

As a team, we want a runnable skeleton with services, frontend and local environment, so that
functional epics can build on it directly. The skeleton is created according to the decisions
from TWA-3 and contains no functional code yet.

**Affected components:** repository, all services, frontend

---

### TWA-4.1 – Domain Map and Bounded Contexts

**Status:** TODO · **Depends on:** TWA-1

**Problem Description**

It is not defined which services exist and which service owns which data, so neither the
architecture profiles nor the skeleton can be planned.

**Action Steps**

1. Derive core, supporting and generic domains from the approved vision.
2. Cut the bounded contexts and give each a responsibility and a service name.
3. Describe the relationships between the contexts in a context map.
4. Agree the result with J.

**Acceptance Criteria**

- Core, supporting and generic domains are named.
- Each bounded context has a responsibility and a service name.
- A context map describes the relationships between the contexts.

---

### TWA-4.2 – Services and Frontend as Skeleton

**Status:** TODO · **Depends on:** TWA-3, TWA-4.1

**Problem Description**

There is no buildable code base yet, so functional code has no fixed place.

**Action Steps**

1. Create one service per bounded context according to its architecture profile.
2. Create the frontend according to the frontend ADRs.
3. Add an architecture test per service.
4. Add the commands for build, test and start to the rules.

**Acceptance Criteria**

- Each service and the frontend build and their (empty) tests pass.
- Each service has an architecture test for its profile.
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
