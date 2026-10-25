# Architecture Profiles

Reference for the backend structure proposed in
[ADR-0001](../adr/0001-architecture-concept.md) (TD-32, story
[TWA-3.4](../product_backlog/backlog.md#twa-34--architecture-concept)). The default is the
**Layered profile**. The **DDD / Hexagonal profile** is an option for a single module whose rules
become complex; switching is recorded in its own ADR.

The profiles are described independent of the language. The layer names below are the concept; how
they map to packages and which tool checks them follows from the backend stack
([ADR-0002](../adr/0002-backend-stack.md)).

## Layered Profile (default)

| Layer | Responsibility | May depend on |
|-------|----------------|---------------|
| `api` | HTTP: routes, request and response models, error mapping | `service` |
| `service` | Business rules and use cases | `repository`, `model` |
| `repository` | Database access; hides the database from the service | `model` |
| `model` | Plain data classes shared by the layers | – |

- Dependencies point only downwards: `api → service → repository → model`.
- Business rules live in the service layer and are tested with a fake repository, without HTTP and
  database.
- The backend has one package per bounded context (module); each module has these layers and owns
  its tables. Modules call each other only through a small public interface and reference each
  other by plain IDs.

## DDD / Hexagonal Profile (option for a module with complex rules)

| Layer | Responsibility | May depend on |
|-------|----------------|---------------|
| `api` | HTTP | `application` |
| `application` | Use cases, ports (interfaces), DTOs | `domain` |
| `domain` | Aggregates, value objects, rules – free of framework and database | – |
| `infrastructure` | Implements the ports (database, external services) | `application`, `domain` |

- Dependencies point inwards: `api → application → domain`; `infrastructure` implements the ports.
- Rules live in the aggregate; database models never leave `infrastructure`.

## When to Switch a Module from Layered to DDD

Switch signals – one is a hint, several are a reason:

- Services contain long `if`/`switch`/`match` chains over states.
- The same rule is duplicated in several services or routes.
- Tests for rules need many mocks for repository and database although only logic is checked.
- A central object has a life cycle with status transitions and invariants across several objects.

A switch is recorded as an ADR and planned as its own undertaking.

## Rules for Agents

- Before every change, read the structure of the module in the `CLAUDE.md` and follow it.
- No silent mixing: no `domain` layer in a Layered module, no framework or database imports in
  `domain` in a DDD module.
- The architecture tests are never weakened to get a build green.
