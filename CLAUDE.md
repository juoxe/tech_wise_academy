# Tech Wise Academy – Rules for Agents

This file applies to the whole repository and contains the **binding rules**. More specific rules
live in the `CLAUDE.md` files of subdirectories (e.g.
[docu/product_backlog/CLAUDE.md](docu/product_backlog/CLAUDE.md)) and complement this file.

Current state: the project is being rebuilt step by step from the Tech Tool Trainer. So far the
[vision](docu/product_backlog/vision.md) (approved), the [roadmap](docu/product_backlog/roadmap.md)
and the [backlog](docu/product_backlog/backlog.md) exist; MS 1 – Project Initialisation is in
progress.

## Workflow

- Every request that creates or changes backlog items, roadmap, documentation or code follows the
  skill [`/workflow`](.claude/skills/workflow/SKILL.md) (plan → implement → verify → finish).
- Backlog and roadmap are maintained by the sub-agent
  [`backlog-manager`](.claude/agents/backlog-manager.md).

## Git

- **Never commit on your own.** Write changes to the working tree only; J creates the commits.
  Never push.
- Project planning (milestones, epics, stories, ideas) happens only in Markdown under
  [docu/product_backlog/](docu/product_backlog/). Do not create issues in external tools.

## Language

- **Everything in English**: code, identifiers, documentation, backlog, commit messages.

## Technology Decisions

- **Do not introduce new technologies or libraries on your own.** If a task depends on an open
  decision (see [docu/adr/open-decisions.md](docu/adr/open-decisions.md)): ask, or record it as a
  proposal for J to decide.

## Verification

- Verify your own changes yourself, limited to the scope of the current change. No broad test runs
  over unchanged areas.
- **Keep tests lean.** The application is not critical: test non-trivial rules, but add no coverage
  thresholds and no end-to-end tests. A proper testing strategy is developed in MS 3 (see the
  [roadmap](docu/product_backlog/roadmap.md)).
- Report the results in the final summary; open findings are fixed or named.

## Documentation

- Functional changes (status of stories, rules, decisions) are reflected in `docu/` in the same
  change.
