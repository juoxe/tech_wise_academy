# ADR-0001: Architecture Concept

- **Status:** accepted (J, 2026-10-25)
- **Date:** 2026-10-25
- **Open decisions:** TD-32, TD-21, TD-30, TD-20 in [open-decisions.md](open-decisions.md)
- **Stories:** [TWA-3.4](../product_backlog/backlog.md#twa-34--architecture-concept),
  [TWA-3.6](../product_backlog/backlog.md#twa-36--api-versioning)
- **Followed by:** [ADR-0002](0002-backend-stack.md) (backend stack),
  [ADR-0003](0003-frontend-stack.md) (frontend stack)
- **Based on:** Tech Tool Trainer ADR-0001, ADR-0002 and ADR-0007; Agentic Ticket System
  (`ticket-service` layers, frontend architecture ADR-0011)

## Context

The architecture is decided **first and independent of any language or framework**. The stacks
in ADR-0002 and ADR-0003 must then support the architecture chosen here, not the other way round.
Existing code is not a reason for any option, because the games are redesigned with a proper plan.

**Size of the product:** a web application with a handful of areas (learning packs and cards,
game rounds, learning progress, later users and admin). The business rules are modest – for
example counting correct answers, unlocking levels and showing progress. The architecture should
fit this size: as simple as possible, with automatic checks, and room to grow if the rules become
more complex. The earlier proposal of two architecture profiles and one service per context came
from the Tech Tool Trainer and is re-evaluated here against this size.

Before the first code is written, it must be clear how code is structured inside the backend,
inside the frontend and between parts of the system, and how these rules are checked
automatically. Without this, every part grows its own structure, and agents cannot follow fixed
rules. Which bounded contexts exist is cut in TWA-4.1; this ADR fixes the concepts they follow.

## Options

**Backend structure** (details in [architecture profiles](../architecture/architecture-profiles.md))

- **Layered everywhere:** `api → service → repository`. Business rules live in the service layer;
  repositories hide the database. Simple, familiar, easy for agents to follow.
- **Two profiles, chosen per module:** Layered for simple parts, DDD / Hexagonal (`api →
  application → domain`, infrastructure implements ports) for parts with rich domain logic.
- **DDD / Hexagonal everywhere:** one structure with aggregates, value objects and ports.

**Service cut and communication**

- **One backend with modules:** one deployable application, one module (package) per bounded
  context, one database. Modules call each other only through a small public interface – no
  network between them.
- **One service per bounded context, synchronous REST:** separate deployables and databases that
  call each other over HTTP.
- **Services with events:** separate services that communicate through domain events (message
  broker or transactional outbox).

**Checking the backend rules**

- **Automatic architecture tests in the test command:** layer and module rules as contracts that
  fail the build (the tool depends on the language from ADR-0002).
- **Hand-written tests** that inspect imports.
- **Documentation and code review only.**

**Frontend architecture**

- **Feature modules:** one folder per feature with its routes, data access, components and pure
  functions; server data in a query cache; no global store.
- **Global store with folders by type** (`components/`, `hooks/`, `services/`).
- **Flat structure** with data fetching in components.

**API versioning**

- **No version, compatible changes only:** a breaking change gets a new path version when it is
  really needed.
- **Version in the path from the start** (`/api/v1/...`).
- **Version in a header or media type.**

## Decision

Rating from `+++` (very good) over `o` (neutral) to `–––` (very poor), at most three signs.

### Decision Matrix – Backend Structure

| Criterion | Layered everywhere | Two profiles per module | DDD / Hexagonal everywhere |
|-----------|:------------------:|:-----------------------:|:--------------------------:|
| Fits the size of the product (modest rules) | +++ | + | –– |
| Little complexity and few concepts to learn | +++ | o | –– |
| One structure that agents can follow reliably | +++ | + | ++ |
| Business rules testable without database (service with a fake repository) | ++ | ++ | +++ |
| Can grow if rules become complex | + | ++ | +++ |

**Reasoning:** The rules of the product are modest, so DDD would add concepts (aggregates, value
objects, ports) without a matching benefit. A service layer with fake repositories already keeps
the rules testable without a database. If a part develops complex rules, it can switch to DDD
later: the switch signals are listed in the architecture profiles and a switch is recorded in its
own ADR.

### Decision Matrix – Service Cut and Communication

| Criterion | One backend with modules | Services with REST | Services with events |
|-----------|:------------------------:|:------------------:|:--------------------:|
| Simple build, local start and deployment | +++ | – | ––– |
| Transactions across contexts | +++ | – | – |
| Clear boundaries between contexts | + (checked by architecture tests) | +++ | +++ |
| Effort for tests and debugging | +++ | – | –– |
| Independent deployment and scaling (not needed for the planned features) | – | ++ | ++ |
| Can be split into services later | ++ | n/a | n/a |

**Reasoning:** The product is small and has one team, so independent deployment and scaling are
not needed. One backend with modules gives clear boundaries at a fraction of the effort; the
architecture tests keep the modules separate so that a later split stays possible. Modules own
their tables and reference each other by plain IDs. Events would be introduced with their own ADR
if a feature needs them.

### Decision Matrix – Checking the Backend Rules

| Criterion | Automatic architecture tests | Hand-written import tests | Review only |
|-----------|:----------------------------:|:-------------------------:|:-----------:|
| Rules break the build automatically | +++ | ++ | ––– |
| Readable rules | +++ | o | o |
| Effort to set up | ++ | – | +++ |
| Agents get immediate feedback | +++ | ++ | ––– |

**Reasoning:** Automatic checks are the point of having a structure; a dedicated tool expresses
layers and module boundaries as readable contracts. The concrete tool follows from the language in
ADR-0002.

### Decision Matrix – Frontend Architecture

| Criterion | Feature modules + query cache | Global store + folders by type | Flat, fetching in components |
|-----------|:-----------------------------:|:------------------------------:|:----------------------------:|
| Clear module boundaries, checkable by lint | +++ | o | ––– |
| Consistent loading, error and empty states | +++ | + | –– |
| Little complexity | + | –– | +++ |
| Each game separate and testable | +++ | o | –– |

**Reasoning:** Feature modules keep each game separate and testable; a query cache handles caching,
loading and error states instead of hand-written code in every component.

### Decision Matrix – API Versioning

| Criterion | No version, compatible changes | `/api/v1/...` from the start | Header / media type |
|-----------|:------------------------------:|:----------------------------:|:-------------------:|
| Simplicity | +++ | ++ | – |
| Fits a single own frontend with generated types | +++ | + | o |
| Prepared for external clients | – | +++ | ++ |
| Visible in URLs, proxies and logs | o | +++ | –– |

**Reasoning:** The only API client is the own frontend, whose types are generated from the API
description, so breaking changes are found at build time. If external clients appear, a path
version can be introduced then.

### Outcome

| Topic | Choice | Status | Decided by / on |
|-------|--------|--------|-----------------|
| Backend structure (TD-32) | Layered everywhere (`api → service → repository`); DDD per module only by ADR | accepted | J, 2026-10-25 |
| Service cut and communication (TD-21) | One backend with modules, one database; modules call each other through a public interface | accepted | J, 2026-10-25 |
| Checking the backend rules (TD-32) | Automatic architecture tests for layers and module boundaries in the test command | accepted | J, 2026-10-25 |
| Frontend architecture (TD-30) | Feature modules with a query cache, no global store | accepted | J, 2026-10-25 |
| API versioning (TD-20) | No version, compatible changes; path version only when needed | accepted | J, 2026-10-25 |

All five topics were accepted by J on 2026-10-25 as recommended.

## Requirements for the Stacks

ADR-0002 and ADR-0003 must choose stacks that support:

- a service layer whose business rules can be tested with fake repositories, without HTTP and
  database;
- automatic checks of layer and module rules that run with the tests;
- an API description generated from the code, so the frontend can generate its types;
- in the frontend: routing with lazy-loaded feature pages, a query cache for server data,
  schema-based form validation and lint rules for module boundaries.

## Frontend Module Structure and Rules

```text
frontend/src/
├── app/                      assembly: app, providers, router, error and 404 page
├── layouts/                  header, navigation, theme switch, page outlet
├── components/
│   ├── ui/                   generic UI building blocks
│   └── shared/               functionally neutral: loading/error/empty state
├── features/<name>/          public entry (routes), api/, hooks/, components/, pages/,
│                             schemas/, types/, lib/ (pure functions)
├── lib/                      infrastructure: HTTP client, generated API types, query client
├── styles/                   design tokens (light/dark)
└── test/                     test setup
```

- Features are imported only via their public entry; no cycles (`app → layouts/features →
  components/lib`); `components/ui` contains no functional logic.
- No API calls in presentation components; server data only via query hooks.
- Strict typing, no untyped escape hatches; API calls only relative (`/api/...`).

## Consequences

- The backend is one application with one package per bounded context (module); each module has
  the layers `api`, `service` and `repository` and owns its tables. Modules reference each other
  by plain IDs and call each other only through their public interface.
- The architecture tests fail the build when a layer or module rule is broken; they are never
  weakened to get a build green.
- A module with complex rules can switch to DDD with its own ADR (switch signals in the
  [architecture profiles](../architecture/architecture-profiles.md)).
- Splitting a module into its own service stays possible and would be a new decision.
- API paths stay `/api/<resource>`; the API documentation template states the versioning rule.
