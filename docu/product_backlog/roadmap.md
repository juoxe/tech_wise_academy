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
| [MS 2](#ms-2--playable-mvp) | Playable MVP | IN PROGRESS | A playable MVP exists |
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
| 4 | [TWA-4](backlog.md#epic-twa-4--runnable-project-skeleton) | A runnable skeleton with backend, frontend and database and the first entity (Tool) working end to end | TWA-1, TWA-3 | DONE |
| 5 | [TWA-5](backlog.md#epic-twa-5--playable-game) | Level 0 of the game (knowledge check per area) – rejected as a separate epic, code committed with TWA-4 | TWA-4 | REJECTED |

**Done when:** all epics are `DONE` or `REJECTED` – the project skeleton is runnable and the planning
(vision, roadmap, backlog) is in place.

---

## MS 2 – Playable MVP

**Status:** IN PROGRESS – TWA-8 is being built (TWA-6, TWA-7 and TWA-9 are done); the milestone is still outlined as
expected results and not yet cut into a planned epic table.

**Goal:** a playable MVP exists.

**Expected results:**

- Learning paths on different IT topics, each with its own colour and a start screen "Choose your
  path".
- Tool cards per path, grouped into sets of increasing difficulty.
- Games per path that unlock one after another (e.g. sorting cards into categories, clearing
  cards).
- Learning progress per user: a card counts as learned after repeated correct answers; progress
  is shown as learned cards.
- A statistics tab: the saved progress of the knowledge games per game, level and area, the tools to
  repeat and the stored rounds of SQL-Bausteine, Code beurteilen and Memory
  ([TWA-6](backlog.md#epic-twa-6--statistics), `DONE`; reviewed by J in the browser on 2026-11-06).
- Knowledge games: five games – Wissens-Check and Karten abräumen with three levels and saved
  progress; SQL-Bausteine, Code beurteilen and Memory with three difficulty levels chosen by the
  player and without saved learning progress
  ([TWA-7](backlog.md#epic-twa-7--knowledge-games), `DONE`, built ahead of the planning of MS 2;
  reviewed by J in the browser on 2026-11-06).
- Interview preparation: card sets generated from a job advertisement, in the local network
  ([TWA-8](backlog.md#epic-twa-8--interview-preparation), `IN PROGRESS`, built ahead of the planning
  of MS 2).
- A generalised overview with create, edit, delete and detail view: a reusable table and detail
  view for the tools, so that the tools can be maintained in the UI
  ([TWA-9](backlog.md#epic-twa-9--generalised-overview-with-create-edit-delete-and-detail-view),
  `DONE`; all four stories done). Depends on: TWA-4 (tool overview and Tool API); TWA-9.3 (create
  and edit) and TWA-9.4 (delete) were built after J's decision of 2026-11-06.
- Tool extraction from any text: the tools a text names, the tools of a mentioned ecosystem and
  concepts shown as topics, independent of interviews; the matching quality moved here from
  TWA-8.7 ([TWA-10](backlog.md#epic-twa-10--tool-extraction-from-text), `TODO`).
- Own card sets: sets created by hand or from a text, every set with a name, selected and learned
  by name ([TWA-11](backlog.md#epic-twa-11--own-card-sets), `TODO`). Depends on: TWA-8 (sets and
  games); story TWA-11.4 depends on TWA-10 (story TWA-10.6).
- Learning content in depth: structured German content for all 307 entries (23 languages and 284
  tools) on the card of a tool or language instead of the hints of the games, reviewed by J
  ([TWA-12](backlog.md#epic-twa-12--learning-content-in-depth), `IN PROGRESS`).
- Personal card priority: a score per card and player for how important a tool is to the learner,
  set on the card and in the tool overview, used by the games (draw weight, "Mein Tech-Stack") and
  the statistics ([TWA-14](backlog.md#epic-twa-14--personal-card-priority), `TODO`, next to be
  built, J's priority). Relation to TWA-11 is decided in TWA-14.1.

---

## MS 3 – Polished Game (draft)

**Status:** DRAFT – further expected results are outlined when MS 2 is planned.

**Goal:** the game is polished and fun to play.

**Expected results:**

- English content and UI: the English summaries and hints of the tools, the translation of the
  UI (TD-34) and the language switch. The data model and the API already prepare the language
  parameter; the first slice is German.
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
