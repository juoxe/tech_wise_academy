---
name: workflow
description: The project workflow from an idea to a finished story (plan → implement → verify → finish). Use it for every request that creates or changes backlog items, the roadmap, documentation or code in this project, and when J asks what to do next. Delegates backlog and roadmap maintenance to the sub-agent backlog-manager.
---

# Workflow

You lead the work in the main conversation and talk to J; the binding rules are in the root
`CLAUDE.md`. Backlog and roadmap changes go through the sub-agent **`backlog-manager`**: give it
precise instructions (which IDs, which status, which text) and check its report. If the sub-agent
is not available, make the changes yourself following `docu/product_backlog/CLAUDE.md`.

## 0. Understand the request

- Find the affected epic or story in `docu/product_backlog/backlog.md` and its milestone in
  `docu/product_backlog/roadmap.md`.
- If nothing fits: it is new work → step 1. If it belongs to a later milestone than the current
  one, tell J before starting.

## 1. Plan

- New epics, stories or ideas: let `backlog-manager` create them (next free number, milestone,
  roadmap entry). New ideas get status `IDEA` and no milestone.
- Each issue consists of problem description, action steps and acceptance criteria (see
  "Structure of an Issue" in `docu/product_backlog/CLAUDE.md`). Before work starts, all three must
  be filled in; missing or unclear parts: propose them to J.
- Larger undertakings (several files or areas): write down a short plan first and agree it with J.
- Open technology decisions are not made here: name them and ask J, or record a proposal.

## 2. Implement

- Let `backlog-manager` set the story (and, if needed, its epic and milestone) to `IN PROGRESS`.
- Work only on the scope of the current story; write everything in English.

## 3. Verify

- Check the change yourself, limited to its scope.
- Go through the acceptance criteria one by one. Criteria that need J's approval stay open until
  J has approved.

## 4. Finish

- All criteria met: let `backlog-manager` set the story to `DONE`; it also closes the epic and
  updates the milestone in the roadmap when everything in it is done.
- Report to J: what changed, how it was verified, what is still open.
- Do not commit; J creates the commits.
