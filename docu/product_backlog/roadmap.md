# Roadmap

The roadmap shows **in which order** the product grows: milestones with their goal, the epics they
contain and when they are done. Details of each epic are in the [backlog](backlog.md); why the
product exists is described in the [vision](vision.md).

## Rules

- Milestone *n* (`MS n`) is the only phase scheme; there are no separate phase numbers.
- Which epic belongs to which milestone is stated on the epic itself
  (`**Milestone:** MS 1 – Project Initialisation`). The Agentic Ticket System builds its roadmap
  from that field; this document must match it.
- Only the **current** milestone is planned in detail (epics in order, dependencies, done
  criteria). Later milestones are outlined as expected results and are cut into epics only when
  they become current.
- Ideas without a milestone stay in the backlog with status `IDEA`.

## Overview

| Milestone | Title | Status | Goal |
|-----------|-------|--------|------|
| [MS 1](#ms-1--project-initialisation) | Project Initialisation | IN PROGRESS | Runnable skeleton and planning in place |
| [MS 2](#ms-2--playable-mvp-draft) | Playable MVP | DRAFT | A playable MVP exists |
| [MS 3](#ms-3--polished-game-draft) | Polished Game | DRAFT | The game is polished and fun to play |
| [MS 4](#ms-4--go-live-draft) | Go-Live | DRAFT | The product is live |

The goals are the success criteria from the [vision](vision.md#success-criteria).

Milestone status: `DRAFT` (outlined, no epics yet) · `PLANNED` (epics cut) · `IN PROGRESS` ·
`DONE`.

---

## MS 1 – Project Initialisation

**Status:** IN PROGRESS (current focus)

**Goal:** a documented, agreed foundation on which the first functional epics can start directly.

| # | Epic | Expected result | Depends on | Status |
|---|------|-----------------|------------|--------|
| 1 | [TWA-1](backlog.md#epic-twa-1--vision--goals) | Vision, problem, target audience, goals, non-goals and success criteria are agreed | – | DONE |
| 2 | [TWA-2](backlog.md#epic-twa-2--working-rules--documentation-structure) | Rules for agents, workflow and documentation structure are in place | – | IN PROGRESS |
| 3 | [TWA-3](backlog.md#epic-twa-3--mandatory-decisions-before-the-first-code) | The decisions needed before the first code are made and recorded as ADRs | TWA-1 | DONE |
| 4 | [TWA-4](backlog.md#epic-twa-4--runnable-project-skeleton) | Bounded contexts, backend and frontend exist as a runnable skeleton | TWA-1, TWA-3 | TODO |

**Done when:** all four epics are `DONE` – the project skeleton is runnable and the planning
(vision, roadmap, backlog) is in place.

---

## MS 2 – Playable MVP (draft)

**Status:** DRAFT – outlined from what the Tech Tool Trainer already offers; epics are cut when
MS 1 is done.

**Goal:** a playable MVP exists.

**Expected results:**

- Learning paths on different IT topics, each with its own colour and a start screen "Choose your
  path".
- Tool cards per path, grouped into sets of increasing difficulty.
- Games per path that unlock one after another (e.g. sorting cards into categories, clearing
  cards).
- Learning progress per user: a card counts as learned after repeated correct answers; progress
  is shown as learned cards.
- A statistics page per user.

---

## MS 3 – Polished Game (draft)

**Status:** DRAFT – further expected results are outlined when MS 2 is planned.

**Goal:** the game is polished and fun to play.

**Expected results:**

- A colour concept for the frontend with roles (primary, secondary, accent, …) for light and
  dark mode, developed in this milestone and applied to the frontend by an agent in the workflow
  (open decision TD-31, ADR-0003).
- A sensible testing strategy that is not too expensive: the application is not critical, so it
  decides which levels are worth testing (unit, integration with a real database, frontend,
  end-to-end) and how coverage is handled. Open decisions TD-02, TD-03, TD-26 and TD-27; input are
  the ADRs of the Tech Tool Trainer and the Agentic Ticket System.

Until then tests stay lean: only non-trivial rules are tested, without coverage thresholds and
without end-to-end tests.

---

## MS 4 – Go-Live (draft)

**Status:** DRAFT – expected results are outlined when MS 3 is planned.

**Goal:** the product is live.
