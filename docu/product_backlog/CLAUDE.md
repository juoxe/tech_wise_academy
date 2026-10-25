# Product Backlog – Structure & Conventions

This directory contains the product planning: vision, roadmap and backlog. It grows step by step
and starts with Epic **TWA-1 – Vision & Goals**. The process is described in the skill
[`/workflow`](../../.claude/skills/workflow/SKILL.md); backlog and roadmap are maintained by the
sub-agent [`backlog-manager`](../../.claude/agents/backlog-manager.md).

## Files

| File | Content |
|------|---------|
| [vision.md](vision.md) | Why the product exists: goal, vision statement, problem, target audience, roles, non-goals, success criteria |
| [roadmap.md](roadmap.md) | In which order the product grows: milestones with goal, epics, dependencies and done criteria |
| [backlog.md](backlog.md) | What is built: status overview, epics and user stories |

## Structure of the Backlog

1. **Title + short description**.
2. **Status Overview** – table of all epics with milestone and status, followed by the
   **next free epic number** and a link to the roadmap.
3. **Epics & User Stories**.

## Structure of the Roadmap

1. **Rules** and an **overview** table of all milestones with status (`DRAFT`, `PLANNED`,
   `IN PROGRESS`, `DONE`) and goal.
2. One section per milestone (`## MS n – <Title>`) with status, goal and – for the current
   milestone – a table of its epics in order with expected result, dependencies and status, plus
   the done criteria. Later milestones are outlined as expected results only.

```markdown
## Status Overview

| Epic | Title | Milestone | Status |
|------|-------|-----------|--------|
| [TWA-1](#epic-twa-1--vision--goals) | Vision & Goals | MS 1 | TODO |
```

## ID Scheme

### Epic ID: `TWA-<No>`

- All epics use the project prefix **`TWA`** (Tech Wise Academy); there are no prefixes per area
  or service.
- The **number runs sequentially** across all epics: `TWA-1` → `TWA-2` → `TWA-3` …
- Numbers are **never reused**: if an epic is dropped, its number stays taken.

Each epic documents its **title**, **description** (goal and benefit, preferably as "As … we want
…, so that …"), **affected components** and its **user stories**.

### User Story ID: `<Epic ID>.<No>`

The number runs sequentially **within the epic**, starting at 1 (`TWA-1.1`, `TWA-1.2`, …).

### Structure of an Issue

Every issue (user story) consists of exactly these three parts, in this order, each under its own
bold line:

| Part | Content |
|------|---------|
| `**Problem Description**` | What is missing or wrong today and why it matters – the current state, not the solution. One short paragraph. |
| `**Action Steps**` | Numbered list of the concrete steps that solve the problem, in the order they are done. Decisions by J are a step of their own. |
| `**Acceptance Criteria**` | Bulleted list of testable conditions that must hold when the issue is `DONE`. They describe the result, not the steps. |

```markdown
### TWA-<No>.<No> – <Title>

**Status:** TODO

**Problem Description**

<What is missing or wrong today and why it matters.>

**Action Steps**

1. <Step>
2. <Step>

**Acceptance Criteria**

- <Testable condition>
```

Epics keep their own structure: **Description** ("As … we want …, so that …"), **Affected
components** and optional common acceptance criteria that apply to all of their issues.

## Machine-Readable Format

The backlog files are also read by tools (e.g. the Agentic Ticket System). For a ticket to be
recognised:

- Epic heading exactly `## Epic TWA-<No> – <Title>`, story heading exactly
  `### TWA-<No>.<No> – <Title>`.
- The status is on its own line `**Status:** <VALUE>` directly below the heading; free text may
  follow. If a story has none, the epic's status applies.
- Milestone on the epic: `**Milestone:** MS 1 – <Title>` (identifier, dash, title; in the status
  line or on its own line). Epics without a milestone are not scheduled yet.
- Ideas are epics or stories with status `IDEA` and without a milestone.
- Optional fields in the status line or on their own line: `**Before:** <latest point>`,
  `**Depends on:** <IDs>`, `**Priority:** <value>`, `**Effort:** <value>`. Scales for priority and
  effort are not decided yet; leave them out until they are.
- Acceptance criteria are a list below their own line `**Acceptance Criteria**`.
- The Agentic Ticket System shows the paragraph below `**Problem Description**` as the ticket
  description; it does not read the action steps yet.
- Examples containing epic or story headings belong in code blocks.

## Status Values (canonical)

The same values apply to epics **and** user stories:

| Status | Meaning |
|--------|---------|
| `IDEA` | Proposal, not planned yet |
| `TODO` | Planned, not started yet |
| `IN PROGRESS` | Being implemented |
| `DONE` | Implemented |
| `REJECTED` | Rejected, will not be implemented (counts as closed) |

> On every status change, the epic or story itself and the **Status Overview** in
> [backlog.md](backlog.md#status-overview) must stay consistent; for an epic also its line in the
> [roadmap](roadmap.md). A new epic also gets a line in the status overview, in the roadmap of its
> milestone, and raises the next free epic number.
