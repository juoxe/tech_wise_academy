# ADR-0005: Tool Icons

- **Status:** accepted (J, 2026-10-25)
- **Date:** 2026-10-25
- **Open decisions:** TD-33 in [open-decisions.md](open-decisions.md)
- **Stories:** [TWA-4.4](../product_backlog/backlog.md#twa-44--frontend-skeleton-with-data-sets-tab)
- **Based on:** Tech Tool Trainer ADR-0012 (Simple Icons, accepted there on 2026-10-21)

## Context

The Data-Sets tab shows each term with its icon. A tool has an optional `icon` (data model); when
it is empty, the icon of its category is shown. The icons are shipped with the frontend, so they
must be available locally and be usable under their licences.

## Options

| Option | Advantages | Disadvantages |
|--------|------------|---------------|
| **Simple Icons** with category icon as fallback | Over 3000 brands as single-brand SVG imports; the collection is CC0; the Tech Tool Trainer already uses it | Single logos carry their own licences and trademarks; some brands are missing |
| devicon | MIT licence, many developer tools | Fewer brands; classes instead of single imports |
| Category icons only | No licence questions, no extra dependency | No recognition of the individual tool |

## Decision

Rating from `+++` (very good) over `o` (neutral) to `–––` (very poor), at most three signs.

| Criterion | Simple Icons + category fallback | devicon | Category icons only |
|-----------|:-------------------------------:|:-------:|:--------------------:|
| Recognition of individual tools | +++ | ++ | – |
| Licence clarity | ++ | +++ | +++ |
| Effort and dependencies | ++ | + | +++ |
| Known from the Tech Tool Trainer | +++ | – | – |

**Reasoning:** Simple Icons gives the best recognition with little effort, and the fallback covers
the tools without a logo. Logos with licences that exclude commercial use are not used; the
category icon is shown instead.

### Outcome

| Topic | Choice | Status | Decided by / on |
|-------|--------|--------|-----------------|
| Tool icons (TD-33) | Simple Icons, single imports; category icon (lucide) as fallback | accepted | J, 2026-10-25 |

## Consequences

- Dependency `simple-icons` in the frontend; only the logos in use are imported.
- The field `icon` holds the Simple Icons slug (e.g. `docker`); the frontend maps slugs to imports.
- Before a new logo is used, its licence and the brand guidelines are checked and noted.
