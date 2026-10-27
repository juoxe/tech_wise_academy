# ADR-0004: Local Environment

- **Status:** accepted (J, 2026-10-25)
- **Date:** 2026-10-25
- **Open decisions:** TD-35 in [open-decisions.md](open-decisions.md)
- **Stories:** [TWA-4.5](../product_backlog/backlog.md#twa-45--local-environment-with-one-command)
- **Depends on:** [ADR-0002](0002-backend-stack.md) (PostgreSQL runs in a container locally)

## Context

The local environment must start the database, the migration, the backend and the frontend with one
command (TWA-4.5). The database runs in a container (ADR-0002); the compose file that describes the
services cannot be written before the container runtime is chosen. The user works on Windows 10
Home, which has no Hyper-V; container runtimes there run inside WSL 2.

## Options

1. **Docker (Docker Desktop or Docker Engine) with Docker Compose** – the setup of the Tech Tool
   Trainer (`compose.yaml`).
2. **Podman with compose** – daemonless, rootless, a Docker-compatible command line.
3. **Native installation without containers** – PostgreSQL and the services installed on the
   machine directly.

## Decision

Rating from `+++` (very good) over `o` (neutral) to `–––` (very poor), at most three signs.

### Decision Matrix – Container Runtime and Compose

| Criterion | Docker + Compose | Podman + compose | Native installation |
|-----------|:----------------:|:----------------:|:-------------------:|
| One command starts everything (TWA-4.5) | +++ | ++ | – |
| Reproducible for others with the same file | +++ | ++ | ––– |
| Runs on Windows 10 Home (WSL 2) | ++ | + | +++ |
| Matches the Tech Tool Trainer | +++ | – | – |
| Licence for private and commercial use | o (Desktop is free for small companies only) | +++ | +++ |
| Known to agents and documentation | +++ | ++ | o |
| Effort to set up | ++ | + | +++ |

**Reasoning:** A reproducible single command is the point of TWA-4.5, which only the container
options deliver. Docker with Compose is the most common combination, works on Windows 10 Home through
WSL 2, and is the setup J already uses for the Tech Tool Trainer. Podman would be the choice if the
Docker Desktop licence became a problem. Native installation was ruled out because every developer
would have to install and configure PostgreSQL by hand.

### Outcome

| Topic | Choice | Status | Decided by / on |
|-------|--------|--------|-----------------|
| Container runtime and compose (TD-35) | Docker with Docker Compose | accepted | J, 2026-10-25 |

## Consequences

- If accepted: a `compose.yaml` in the repository describes the database, the migration, the
  backend and the frontend; a `.env.example` holds the local values.
- Docker Desktop does not start automatically on Windows; the start command in the rules says so.
- The Docker Desktop licence depends on the use. If that changes, Podman with compose can replace
  Docker without changing the compose file in most cases.
