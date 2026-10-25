# ADR-0003: Frontend Stack

- **Status:** accepted (J, 2026-10-25)
- **Date:** 2026-10-25
- **Open decisions:** TD-22, TD-24, TD-25, TD-31, TD-01 (frontend part) in
  [open-decisions.md](open-decisions.md)
- **Stories:** [TWA-3.3](../product_backlog/backlog.md#twa-33--frontend-stack),
  [TWA-3.5](../product_backlog/backlog.md#twa-35--formatter-and-linting) (frontend part)
- **Based on:** Tech Tool Trainer ADR-0003 to ADR-0005 and ADR-0008, Agentic Ticket System ADR-0001
  to ADR-0003 (both use the same frontend stack)
- **Depends on:** [ADR-0001](0001-architecture-concept.md) (architecture concept, incl. frontend
  architecture)
- **Related:** the testing strategy is developed in MS 3 (see the [roadmap](../product_backlog/roadmap.md))

## Context

Tech Wise Academy is a web application with interactive games (e.g. dragging cards), so it needs a
user interface on top of the backend services. Guiding principles are API-first (every function is
first available as a REST API) and simple operations. The stack must support the frontend
architecture of [ADR-0001](0001-architecture-concept.md#requirements-for-the-stacks). Like the
backend, it is evaluated language-neutrally: existing frontend code is not a criterion, only the
experience with a stack counts.

## Options

1. **Approach and framework:** no frontend · server-side rendering in a service (templates + HTMX)
   · SPA with React + TypeScript · SPA with Angular · SPA with Vue or Svelte.
2. **Build and tooling:** Vite + npm + ESLint + Prettier · Next.js + npm + ESLint + Prettier ·
   Vite + pnpm + Biome. TypeScript strict in every option.
3. **UI components and styling:** Tailwind CSS + shadcn/ui (components copied into the project,
   based on Radix) · component library (MUI, Mantine) · own components with CSS Modules.
4. **Design:** own design tokens following the shadcn theme scheme, light and dark · ready-made
   shadcn theme · theme of a component library.

## Decision

Rating from `+++` (very good) over `o` (neutral) to `–––` (very poor), at most three signs.

### Decision Matrix – Approach and Framework

| Criterion | No frontend | SSR (templates + HTMX) | React + TS | Angular | Vue / Svelte |
|-----------|:-----------:|:----------------------:|:----------:|:-------:|:------------:|
| Interactive games (drag & drop, animations) | ––– | –– | +++ | ++ | ++ |
| Fits API-first and several services | o | –– | +++ | ++ | ++ |
| Ecosystem and agent support | – | o | +++ | + | + |
| Supports the frontend architecture of ADR-0001 | ––– | –– | +++ | +++ | ++ |
| Experience with the stack | o | + | +++ | – | – |
| Only one tech stack | +++ | ++ | –– | –– | –– |
| Learning curve | +++ | ++ | o | –– | + |

**Reasoning:** Interactive games, the ecosystem and the experience from two projects decide for React
with TypeScript; the second tech stack next to the backend is accepted.

### Decision Matrix – Build and Tooling

| Criterion | Vite + npm + ESLint + Prettier | Next.js + npm + ESLint + Prettier | Vite + pnpm + Biome |
|-----------|:------------------------------:|:---------------------------------:|:-------------------:|
| Fits a pure SPA in front of REST services | +++ | – | +++ |
| Little configuration | ++ | o | ++ |
| Lint rule coverage (e.g. React hooks) | +++ | +++ | + |
| Speed of lint and format | o | o | +++ |
| Experience with the tools | +++ | – | o |

**Reasoning:** Vite with ESLint and Prettier matches the SPA and is familiar. Next.js
brings its own server runtime that is not needed. If lint runtime becomes a problem, Biome or
oxlint can replace ESLint later. API types are generated from the OpenAPI description of the
backend ([ADR-0002](0002-backend-stack.md), TD-19).

### Decision Matrix – UI Components and Styling

| Criterion | Tailwind + shadcn/ui | Component library (MUI, Mantine) | Own components (CSS Modules) |
|-----------|:--------------------:|:--------------------------------:|:----------------------------:|
| Own look, easy to adapt | +++ | – | +++ |
| Accessible behaviour out of the box (dialogs, focus) | ++ | +++ | –– |
| Small dependency, safe upgrades | ++ | –– | +++ |
| Effort for new components | + | +++ | –– |
| Agent familiarity, own experience | +++ | o | – |

**Reasoning:** shadcn/ui gives accessible Radix behaviour while the code stays in the project and
adaptable; it is familiar from two projects.

### Decision Matrix – Design

| Criterion | Own tokens (shadcn scheme), light/dark | Ready-made shadcn theme | Theme of a component library |
|-----------|:--------------------------------------:|:-----------------------:|:----------------------------:|
| Own brand and colours (e.g. per learning path) | +++ | + | o |
| Effort | + | +++ | o |
| Brand change in one place | +++ | +++ | + |
| Fits Tailwind + shadcn/ui | +++ | +++ | –– |

**Reasoning:** Own tokens cost little extra effort and allow colours per learning path. The colour
concept with roles such as primary and secondary is developed in MS 3 and applied by an agent in
the workflow.

### Outcome

| Topic | Choice | Status | Decided by / on |
|-------|--------|--------|-----------------|
| Approach and framework (TD-22) | SPA with React + TypeScript in `frontend/` | accepted | J, 2026-10-25 |
| Build and tooling (TD-24, TD-01 frontend) | Vite, npm, TypeScript strict, ESLint, Prettier | accepted | J, 2026-10-25 |
| UI components and styling (TD-25) | Tailwind CSS + shadcn/ui, icons `lucide-react` | accepted | J, 2026-10-25 |
| Design (TD-31) | Own design tokens following the shadcn scheme with roles (primary, secondary, …), light and dark; the colour concept is developed in MS 3 | accepted | J, 2026-10-25 |

All four topics were accepted by J on 2026-10-25. For the design, J decided on own tokens with a
colour concept (primary, secondary and further roles); font size, layout and the concrete colours
are part of that concept in MS 3.

## Consequences

- New module `frontend/` with its own `CLAUDE.md`, `Dockerfile` and entry in the compose file; npm
  scripts `dev`, `build`, `typecheck`, `lint`, `format:check`; a `test` script follows with the
  testing strategy (MS 3).
- The root `CLAUDE.md` gets these commands; checking agents need TypeScript rules.
- In local development, API calls go through a proxy of the dev server (no CORS). Delivery in
  production is decided with the target platform (TD-09).
- Colours only as tokens in `globals.css`; components use roles (`bg-primary`, `text-status-done`),
  no fixed colour values. A contrast check (WCAG AA) is still open.
- The colour concept (roles such as primary, secondary, accent, destructive, muted and status
  colours) is developed in MS 3 and applied by an agent in the workflow; until then the default
  tokens of the shadcn generator are used.
- Lesson from the Tech Tool Trainer: the shadcn generator once replaced the import `@/lib/utils`
  with an npm package `cn` – check imports after `shadcn add`.
