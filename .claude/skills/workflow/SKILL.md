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
- Open technology decisions are not made here: name them and ask J, or record a proposal (see
  "Technology Decisions" below).

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

## Technology Decisions (ADRs)

Used whenever a story needs a technology or architecture decision. Decisions are listed in
`docu/adr/open-decisions.md`: chapter 1 holds the **open** decisions with the next due one first,
chapter 2 is the **decision record** of the decisions that have been made. ADRs live in
`docu/adr/`; the ADR index and the next free ADR number are in `docu/adr/README.md`, the next free
`TD-` number is at the end of `open-decisions.md`.

**Preparing a decision**

1. Write the options into an ADR with status `proposed`, based on `docu/adr/0000-template.md`:
   file name `NNNN-<title-in-kebab-case>.md`, numbered sequentially. Related topics share one ADR
   instead of one ADR per topic.
2. Under "Decision", create one **decision matrix per topic**: criteria as rows, options as
   columns, rated from `+++` (very good) over `o` (neutral) to `–––` (very poor), at most three
   signs, not weighted. Add a short reasoning below each matrix, and an **outcome table** with one
   row per topic (choice, status `recommended`/`accepted`/`rejected`, who decided and when).
3. Evaluate neutrally. Criteria come from the requirements, the architecture and the product.
   Existing code is not a criterion, only experience with a technology counts. Personal goals of
   J are named as a criterion of their own so that their weight is visible.
4. Set the entry in chapter 1 of `open-decisions.md` to `IN PROGRESS` and add the ADR to the index.

**Deciding**

5. Ask J topic by topic; a recommendation fixes nothing. Never decide on your own and never
   implement a recommendation that J has not accepted.
6. After J has decided a topic: set its outcome row to `accepted` with "J, date". The ADR becomes
   `accepted` when all its topics are decided. A superseded ADR is kept and gets the status
   `superseded by ADR-NNNN`.

**After a decision**

7. Move the decision from chapter 1 to chapter 2 of `open-decisions.md`, so that the open
   decisions stay on top. Update the ADR index, the accepted tables in
   `docu/architecture/techstack.md` and the places named under "Affected".
8. Let `backlog-manager` set the story to `DONE` with a `**Result:**` line that links the ADR.
