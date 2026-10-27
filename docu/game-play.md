# Game Play

Status: **Level 0 is implemented (MS 1)**. The full game with several levels and content follows in
MS 2 (see the [roadmap](product_backlog/roadmap.md)). Profiles, progress and statistics are not
part of Level 0.

This document is the single source for the game rules. The stories in the
[backlog](product_backlog/backlog.md) (TWA-5) refer here and do not repeat the rules.

## Overview

The app has a menu bar with two tabs, in this order:

| Tab | Content |
|-----|---------|
| Game | The game. It starts as soon as the tab is selected. |
| Toolübersicht | All tools as a list over the full width of the screen. |

The game plays like a card game: the tools are cards, the categories are piles. The player takes
one card at a time and sorts it onto the pile of its category.

## Levels

| Level | Purpose | Milestone | Status |
|-------|---------|-----------|--------|
| 0 | Knowledge check: how well does the player know each area? | MS 1 | implemented (TWA-5.1) |
| 1 and later | The real game: several levels, sets of tools, games per learning path | MS 2 | not planned in detail yet |

## Level 0 – Knowledge Check

**Goal:** find out how well the player knows each of the five areas. Level 0 is a dummy game: it
only checks, it does not teach and it saves nothing.

**Game flow**

1. Selecting the Game tab starts Level 0 with all tools in random order.
2. The player sorts the cards one by one onto the piles of their categories.
3. When every card is on its pile, the result is shown.

**Layout**

- A **hand** at the top shows the current card with its logo and name. It is the only card that
  can be moved.
- Below the hand there is one **pile** per category: `DEVOPS`, `BACKEND`, `FRONTEND`, `SECURITY`,
  `AI_DATA`. Each pile shows its name, how many cards lie on it and the names of the tools on it.
- The layout uses the full width of the screen.

**Controls**

- **Drag:** drag the card from the hand onto a pile.
- **Click:** click a pile. Both methods do the same, so the game works without a mouse.

**Rules**

- **Right pile:** the card stays on the pile, the pile flashes in the done colour (green), and the
  next card comes into the hand. The correct category is shown only once the card is placed.
- **Wrong pile:** the card stays in the hand, the pile flashes in the destructive colour (orange),
  the wrong-attempt counter goes up by one, and the message "Nicht ganz, versuch es nochmal." is
  shown.
- A card that was placed correctly is never moved again.

**Result**

The result shows, for each area, how many of its tools were sorted correctly **on the first try**,
for example "3 von 5 auf Anhieb richtig". It also shows the total number of wrong attempts.
"Nochmal spielen" starts a new round.

A card counts as known in its area only if it was sorted correctly on the first try. A card that
needed a wrong attempt does not count, even when it was sorted correctly in the end.

## Full Game (MS 2 – Outline)

These parts are planned for MS 2 and are not implemented yet.

| Game | Idea | Status |
|------|------|--------|
| Sort the cards | The full sorting game with several levels and sets of tools | planned |
| Clear the cards | A grid of tool cards; a hint names one tool, the player clicks its card | planned |

## Open Points

- **Progress:** whether a card counts as learned after repeated correct answers (Tech Tool
  Trainer rule). Not part of Level 0; decided when MS 2 is planned.
- **Sets:** whether the tools are split into sets of increasing difficulty. Not part of Level 0.
- **Hints and details:** whether a correct placement shows more about the tool (summary, hints,
  examples, documentation link). Not part of Level 0.
- **Tab state:** whether leaving and coming back to the Game tab should keep the round. In Level 0
  it starts a new round.
- **UI language:** the texts in the game are German, like the rest of the current UI. The
  translation of the UI is decided in TD-34 (MS 3).
