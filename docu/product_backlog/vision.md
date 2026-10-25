# Tech Wise Academy – Vision

**Status:** approved by J (2026-10-25, [TWA-1](backlog.md#epic-twa-1--vision--goals)). Based on
the Tech Tool Trainer, translated and revised.

The order in which the product grows is described in the [roadmap](roadmap.md).

## Goal

<!-- TWA-1.3 -->

Tech Wise Academy is a learning trainer for IT knowledge: a web application with which developers
train their tools and technologies in a playful way. Short learning packs in different game formats
make IT knowledge testable and show where the gaps are.

> The topics of the learning packs, the game formats and the technology of the product itself are
> deliberately not named here. The technology is decided in
> [TWA-3](backlog.md#epic-twa-3--mandatory-decisions-before-the-first-code).

## Vision Statement

<!-- TWA-1.1 -->

Techwise Academy
Turn knowledge into mastery.
Technical skills aren't built by reading documentation alone. They're built by experimenting, solving challenges, making mistakes, and trying again.

Techwise Academy transforms technical learning into small, playful, hands-on experiences that make knowledge stick and turn curiosity into real-world skills.

## Problem

<!-- TWA-1.2 -->

- Tool knowledge (commands, libraries, language features, typical mistakes) is spread across many
  documentations and does not stick without practice.
- Code reviews require a trained eye for typical mistakes, which is hard to train deliberately.
- There is no quick way to check one's own knowledge per technology.
- Preparing for a technical interview means refreshing broad knowledge in a short time and finding
  out where the gaps are.

## Target Audience

<!-- TWA-1.2 -->

The main target audience are **developers**, in particular **people preparing for technical
interviews**.

| Target audience | Need |
|-----------------|------|
| Developers preparing for interviews (primary) | Refresh broad knowledge quickly, see their gaps, practise in short units |
| Developers in general | Short exercises on individual topics with immediate feedback, refresh knowledge, get to know new tools |

## Roles

There are two roles. Sign-in is decided later (authentication is not part of MS 1).

| Role | Description |
|------|-------------|
| USER | Chooses learning packs and plays the games |
| ADMIN | Administers the application and maintains the learning packs |

### Permissions per Role

| Permission | USER | ADMIN |
|------------|:----:|:-----:|
| Read learning packs and play | ✓ | ✓ |
| Add and edit learning packs | open | ✓ |

> Open: whether users may also add or edit learning packs, or only admins, is decided later.

## Non-Goals

<!-- TWA-1.4 -->

- No complete course or certification system.
- No execution of user code on the server (code is only displayed and assessed).

## Success Criteria

<!-- TWA-1.5 -->

Success is measured per milestone of the [roadmap](roadmap.md):

| Milestone | Success criterion |
|-----------|-------------------|
| MS 1 | The project skeleton is runnable and the planning (vision, roadmap, backlog) is in place. |
| MS 2 | A playable MVP exists. |
| MS 3 | The game is polished and fun to play. |
| MS 4 | The product is live. |
