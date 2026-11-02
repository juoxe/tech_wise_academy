# Game Play

Status: **two games are implemented**: the knowledge check Wissens-Check (Level 0, a falling-card game)
and Karten abräumen. Both are played in three levels (Kennen, Intermediate, Expert). The full game
with sorting and content follows in MS 2 (see the [roadmap](product_backlog/roadmap.md)). Login
(Keycloak) and statistics are not part of these games yet.

This document is the single source for the game rules.

## Overview

The app has a menu bar with two tabs, in this order:

| Tab | Content |
|-----|---------|
| Game | The choice of the game ("Welches Game willst du spielen?"), then the game. |
| Toolübersicht | All tools as a list over the full width of the screen. |

## Sets

The Game tab offers three sets of cards. The player picks the set above the choice of the game; both
games can be played with every set.

| Set | Cards | Sorted by | Levels |
|-----|-------|-----------|--------|
| Tools | all tools except the programming languages | the five areas | 1 to 3 (see Levels) |
| Programmiersprachen | 23 common programming languages | the five paradigms: objektorientiert, funktional, prozedural, deklarativ, multiparadigma | none; all languages are one level |
| Eigene Sets | the cards of a set the player made; so far the interview preparation: a job advertisement is pasted into the Game tab and gives a set of the matching tools | the five areas; a set with languages gets a sixth area "Sprachen" | none; the set is one level |

Each tool or language belongs to exactly one set. The languages are not part of the three levels of
the tools. They have no unlocking: the set is always open, and its progress bar counts the learned
languages. In the Wissens-Check the paradigms take the place of the areas on the floor; in Karten
abräumen the hints name the language.

## Levels

| Level | Purpose | Milestone | Status |
|-------|---------|-----------|--------|
| 0 | Knowledge check: how well does the player know each area? | MS 1 | implemented |
| 1 and later | The real game: sorting, games per learning path | MS 2 | not planned in detail yet |

The Game tab first asks which game to play, with a green start button per game. Each game shows its
current level and its progress as a bar in percent (learned tools of the level). Both games have
three **difficulty levels**; the level is set automatically (see Unlocking) and is not chosen by the
player. Each tool belongs to exactly one of them:

| Level | Name | Tools | Meaning |
|-------|------|------:|---------|
| 1 | Kennen | 94 | The tools everybody should know |
| 2 | Intermediate | 97 | Less known tools for the next step |
| 3 | Expert | 93 | Specialised tools |

The level of a tool comes from the sets of the Tech Tool Trainer: set 1 is level 1, set 2 is level 2,
set 3 is level 3. A tool that is in several learning paths gets the lowest set number.

**Unlocking and choice of level:** level 1 is always open. Level 2 opens when every tool of level 1 is
learned, level 3 when every tool of level 2 is learned. The game plays the first open level whose tools
are not all learned yet; the player does not choose a level. Above the board a progress bar shows how
many tools of the level are learned ("x von y gelernt"). The progress is the one saved for the player
(see Saving).

## Level 0 – Knowledge Check

**Goal:** find out how well the player knows the tools of each of the five areas. Level 0 only
checks; it does not teach. The player chooses one of the three difficulty levels in the Game tab.

**Round**

- A round uses **all tools of the chosen level that are not learned yet**. No card is removed from the round during play.
- The round lasts **90 seconds**. The player plays as many cards as possible in that time.
- A card is **learned** when it is placed correctly **twice in a row**. A learned card leaves the
  round.
- A card that is not learned yet stays in the round. It is played again.
- The round is finished when every card is learned, or when the time is up.

**Which card comes up**

- At first each card comes up **at most once per round**, in random order.
- When every card has come up at least once, the cards that are not learned yet come up again,
  **at random**.

**Board**

- The board is narrow and tall. Falling cards come from the top, and the five **areas** are the
  floor at the bottom, each one a surface with its name and its progress ("x von y gelernt").
- A **falling card** shows the name and the logo of the tool, not its area. It falls by itself, one
  row about every half second.
- The board shows how many cards are still to be played and the time.

**Controls**

- **Left / right arrow:** move the falling card one area to the left or right.
- **Down arrow or Space:** drop the card onto the floor of its area at once.
- **Click on an area:** place the falling card on this area at once.
- **Buttons ←, Ablegen and →:** the same actions, for mouse and touch.
- Without any input the card lands on the floor of the area it is above.

**Rules**

- The area where the card lands is the answer.
- **Correct:** the area flashes green. The first correct placement of a card is not yet learning; the
  card must be placed correctly once more, in a row, to be learned.
- **Wrong:** the area flashes orange with "falsch". The card stays in the round, is not learned, and
  its streak starts again from zero. It is played again later.

**Result**

When the round is finished, the summary shows:

1. **Title:** "Gemastert!" when every card is learned, or "Zeit abgelaufen" when the time ran out first.
2. **Total:** how many of the cards are learned.
3. **Dashboard:** one row per area, vertically, with a bar that shows the learned share, and the
   numbers "gelernt · offen · mit Fehler".
4. **Falsch eingeordnet:** every card that was placed wrongly and is not learned yet, with its name,
   the area it landed in and the area it belongs to. When the round ends, the **review of the wrong
   cards opens at once**: each wrong card is shown as its overview card (see Übersichtskarte);
   "Zurück" and "Weiter" go through them one by one, "Schließen" cancels the review at any time and
   leads to the summary. In the summary a click on a card, or the button "Falsche Karten
   durchklicken", opens the review again.
5. **Noch offen:** when the round is not mastered, the cards still open, with their area and
   description.

"Nochmal spielen" starts a new round with the tools that are not learned yet. The saved progress is read again first.

**Saving**

- Every landing is stored for the player: the number of correct and wrong answers per tool, the
  current row of correct answers, and whether the tool is learned.
- The player is identified by an anonymous profile ID that the browser keeps. This is a stopgap until
  the login with Keycloak (TD-17) is built. Progress is lost if the browser data is cleared.
- After a reload the round starts again with the tools that are **not learned yet**. The saved row of
  correct answers is kept, so a card that was placed correctly once needs one more correct answer.
  The timer starts again at 90 seconds. Learned tools are not placed again.
- When every tool of the chosen level is learned, the Game tab shows "Alle Tools dieses Levels sind gelernt".
- A new round starts with the level that is open now. Progress is not lost: each answer is saved at once.
- "Anderes Spiel wählen" returns to the choice of the game. The round in progress is discarded; the
  answers already given are saved.
- The list of wrong placements is only known within the current visit; after a reload the summary
  shows the counts that are saved, not the individual placements.

## Karten abräumen

**Goal:** learn the tools of the chosen level by naming them from their hints. The game takes its
rules from the Tech Tool Trainer ("Karten abräumen", Level 2 there).

**Round**

- The field shows up to **20 cards** (5 rows × 4) with the logo and name of the tool, in random order.
  The cards are the tools of the chosen level that are not learned yet.
- Above the field the question "Welches Werkzeug ist gemeint?" shows the hints of the **asked card**.
  A random open card of the field is asked; each card is asked once per round. The position of a card
  in the field gives no hint about the order of the questions.
- The hints of a card are **ambiguous on purpose**: one hint can fit several tools, and only
  together do they point to one. The **order of the hints is random** for every card in every round, so
  that the player learns all hints and not just the first one.
- The first hint is shown at first. The player can ask for more:
  - **Nächster Hinweis:** shows one more hint of the asked card. It is not a mistake, but the card
    can no longer be learned on the first try. The button is off when all hints are shown.
  - **Weiß ich nicht:** a mistake on the asked card without clicking a card; one more hint is shown.
- **Correct:** the card is removed and leaves a gap; the next card is asked.
- **Wrong:** "Nicht ganz, versuch es nochmal." The click is a mistake on the asked card and shows one
  more hint.
- The round is finished when every card of the field is removed. A card with at least one mistake
  in the round is a wrong card; when the round ends, the **review of the wrong cards opens at once**,
  as in the Wissens-Check, and can be cancelled with "Schließen". The end screen offers "Nächste
  Runde" and, with wrong cards, "Falsche Karten durchklicken". "Nächste Runde" starts a new field
  with the tools that are still not learned.

**Learned**

- A card is **learned** after **2 correct answers in a row**, each on the first try in its round. The
  Wissens-Check, the same rule as there.
- A correct click counts as a first try only with no mistake and no extra hint. A mistake or an extra
  hint resets the row to 0. A correct click after that removes the card, but it is not stored as a
  correct answer.
- "Weiß ich nicht" is stored as a wrong answer.
- Learned cards do not come up again in this game.
- The progress is kept **per game**: a tool learned in the Wissens-Check is not learned in Karten
  abräumen.

**Levels and saving**

- The three levels, the automatic choice of the level and the progress bar are the same as for the
  Wissens-Check, with the progress of this game. Each answer is saved for the player as described under
  Saving.

## Übersichtskarte

The overview card shows one tool in the style of a Quartett card, with more details:

- Name, logo, area (Bereich) and level
- Summary (one sentence) and overview (three to five sentences)
- "Wofür man es nutzt": three or four use cases
- "Kernbegriffe": three to five key terms with a short explanation
- "Wann einsetzen" and "Wann besser nicht"
- "Gut zu wissen": two or three things worth knowing
- The example, if the tool has one
- The alternatives, if the tool has any
- A link to the documentation

The hints of the games are **not** shown on the card: they stay in the data for Karten abräumen,
but a learner should read real knowledge here ([TWA-12](product_backlog/backlog.md#epic-twa-12--learning-content-in-depth)).

The overview card is shown for the wrong cards of the Wissens-Check summary (see Result, point 4).

## Full Game (MS 2 – Outline)

These parts are planned for MS 2 and are not implemented yet.

| Game | Idea | Status |
|------|------|--------|
| Sort the cards | The full sorting game with several levels and sets of tools | planned |

## Open Points

- **Time:** the 90 seconds are a first value and are to be tested.
- **Speed:** the fall time of about half a second per row is a first value.
- **Progress across rounds:** whether learned cards are kept between rounds (Tech Tool Trainer rule).
  Learned cards are kept per tool, so each level keeps its own progress.
- **Level names in the game:** the game names "Level 0" (this knowledge check) and its difficulty
  levels 1 to 3 both use the word level. Whether the difficulty levels get other names is open.
- **Tab state:** whether leaving and coming back to the Game tab should keep the round. In Level 0
  it starts a new round.
- **UI language:** the texts in the game are German, like the rest of the current UI. The
  translation of the UI is decided in TD-34 (MS 3).
