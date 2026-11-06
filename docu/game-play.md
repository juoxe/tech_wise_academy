# Game Play

Status: **five games are implemented**: the knowledge check Wissens-Check (Level 0, a falling-card game)
and Karten abräumen, both played in three levels (Kennen, Intermediate, Expert) that are set automatically;
and the games SQL-Bausteine (PostgreSQL queries from tiles), Code beurteilen (multiple choice on code) and
Memory (pairs of names and descriptions), each played in three difficulty levels (Kennen, Intermediate,
Expert) that the player chooses. The full game with sorting and content follows in MS 2 (see the [roadmap](product_backlog/roadmap.md)). Login
(Keycloak) is not part of these games yet. The tab Statistik shows the saved progress of the two knowledge games and the stored rounds of the other three.

This document is the single source for the game rules.

## Overview

The app has a menu bar with three tabs, in this order:

| Tab | Content |
|-----|---------|
| Game | The choice of the game ("Welches Game willst du spielen?"), then the game. |
| Statistik | The saved progress of the two knowledge games and the results of the other three games (see Statistik). |
| Toolübersicht | All tools as a list over the full width of the screen. A click on a row opens the detail view with "Bearbeiten", "Löschen" and "Schließen"; "Neues Tool" opens the form to create a tool (see Tools maintain). |

## Sets

The Game tab offers three sets of cards. The player picks the set above the choice of the game. The
two knowledge games Wissens-Check and Karten abräumen and the game Memory use the cards of the chosen
set. SQL-Bausteine and Code beurteilen do not use a set.

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

The Game tab first asks which game to play, with a green start button per game. The two knowledge
games show their current level and its progress as a bar in percent (learned tools of the level).
Both have three **difficulty levels**; the level is set automatically (see Unlocking) and is not chosen by the
player. Each tool belongs to exactly one of them:

| Level | Name | Tools | Meaning |
|-------|------|------:|---------|
| 1 | Kennen | 94 | The tools everybody should know |
| 2 | Intermediate | 97 | Less known tools for the next step |
| 3 | Expert | 93 | Specialised tools |

The three games SQL-Bausteine, Code beurteilen and Memory have the same names for their difficulty
levels, but the player chooses the level before the game starts (see the section of each game). Their
levels do not unlock anything and save no learning progress; the result of each finished round is stored (see Statistik).

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
- **Zurücksetzen:** every game in the choice of the game has the button "Fortschritt zurücksetzen". After
  a confirmation that names the game, the saved progress of the player in **this game** is deleted in all
  sets and levels (answers, rows of correct answers and learned cards). The other game and other players
  keep their progress; the bars show 0 % afterwards.
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

## SQL-Bausteine

**Goal:** learn to write PostgreSQL queries by putting their parts in the right order.

- The Game tab offers SQL-Bausteine as a third game. It is independent of the set and has no unlocking
  and no saved learning progress. After the last task the result of the round is stored (see Statistik).
- **Difficulty:** the player chooses Kennen, Intermediate or Expert above the games (group
  "Schwierigkeit"). Kennen has six tasks (SELECT with WHERE, IS NULL, COUNT, DISTINCT and LENGTH on one table),
  Intermediate six tasks (ILIKE, GROUP BY with HAVING, BETWEEN, IN, LIMIT), Expert five tasks (LEFT JOIN,
  SUM with HAVING, window functions RANK and a running SUM).
- A task names the wanted result and the tables with their columns, in German.
- The tiles are single words or fragments, such as `SELECT`, `FROM`, `ORDER BY` or `IS NULL`. They
  are shown in a mixed order. Some tiles are **distractors**: the query does not use them.
- The player clicks the tiles in the order of the query. A click on a tile in the answer removes it
  again. "Zurücksetzen" puts all tiles back.
- "Prüfen" compares the answer with the query of the task, tile by tile. Right: "Richtig!". Wrong:
  the correct query is shown.
- A distractor in the answer makes the answer wrong. "Weiter" goes to the next task; after the last
  task the result is shown ("x von y Abfragen richtig").
- The tasks are static content in `frontend/src/features/game/lib/sql-tasks.ts`.

## Code beurteilen

**Goal:** learn to spot weaknesses in code by judging statements about a short example.

- The Game tab offers Code beurteilen as a fourth game. It is independent of the set and has no
  unlocking and no saved learning progress. After the last example the result of the round is stored (see
  Statistik).
- **Difficulty:** the player chooses Kennen, Intermediate or Expert above the games. Kennen has five
  examples (for instance SELECT *, innerHTML, eval on input, a secret in the code, CORS with *),
  Intermediate six (SQL injection, hard-coded password, unclosed file, debug mode on a server, table name
  in SQL, error text sent to the client), Expert five (open redirect, weak hash, missing authorisation,
  random reset codes, timing attack on a comparison).
- A task shows a short code example in Python, SQL or TypeScript and a German question.
- Under the example there are several statements. **Any number of them can be right**: none, one,
  several or all. The player marks every statement that is right.
- "Prüfen" shows for each statement whether it is right or wrong, with a reason. A task counts as
  solved only when exactly the right statements are marked.
- "Weiter" goes to the next example; after the last one the result is shown ("x von y Beispielen
  richtig beurteilt").
- The examples are static content in `frontend/src/features/game/lib/code-review-tasks.ts`.

## Memory

**Goal:** connect each tool or programming language with its description.

- The Game tab offers Memory as a fifth game. It has no unlocking and no saved learning progress. When the last pair is found, the result of the round is
  stored: the pairs found and the moves needed (see Statistik).
- **Difficulty:** the player chooses Kennen, Intermediate or Expert above the games. The difficulty sets
  the number of pairs of a round: Kennen 4, Intermediate 6, Expert 8 pairs (8, 12 or 16 cards).
- The cards come from the set chosen above the choice of the game: Tools (all tools except the
  languages), Programmiersprachen or Eigene Sets. A round uses that many entries of the set that have
  a description, drawn at random; if the set has fewer, the round is smaller.
- Each entry gives two cards: one with the **name** and one with the **description** (summary).
- The player turns two cards per move. A pair matches when both cards belong to the same entry and
  show different sides. A matching pair stays face up; other cards turn back after about one second.
- The round ends when all pairs are found. The result shows the moves and the wrong pairs.
- The code is in `frontend/src/features/game/components/memory-board.tsx` and
  `frontend/src/features/game/lib/memory-deck.ts`.

## Statistik

**Goal:** show the learner where they stand: how many tools are learned, how the answers went and
which tools need repeating.

- The tab "Statistik" has one section per knowledge game: Wissens-Check and Karten abräumen, and a section
  "Weitere Spiele" for SQL-Bausteine, Code beurteilen and Memory.
- Everything is computed in the frontend from the saved progress of the player and the tool list. It
  counts all tools of the app (the tools and the programming languages), independent of the set that is
  chosen in the Game tab.
- **Gelernte Werkzeuge:** learned tools of all tools, with the share in percent and a bar.
- **Antworten:** right and wrong answers of the game and the share of right answers; the share is
  left out while no answer was given.
- **Nach Level:** the learned tools of the levels Kennen, Intermediate and Expert, each with a bar.
  The programming languages have no level and are not counted here.
- **Nach Bereich:** the learned tools per area (DevOps, Backend, Frontend, Security, KI & Daten) and
  one row for the programming languages.
- **Zum Wiederholen:** the tools with the most wrong answers, at most ten, highest first, then by
  name; each with its area and the wrong and right answers. Tools without a wrong answer are not
  listed; without any wrong answer a short text is shown.
- Before anything is played the tab shows "Noch keine Daten. Spiele zuerst eine Runde im Game-Tab."
- The statistics belong to the profile of the browser (see Saving) and become per user with the login.
- **Weitere Spiele:** SQL-Bausteine, Code beurteilen and Memory save no learning progress. Every round that is
  played to the end is stored as one result of the player: the game, the difficulty, the tasks solved of
  all tasks (Memory: the pairs found and the moves needed) and the time. For each game and difficulty the
  tab shows the number of rounds, the latest and the best round. The best round has the highest share of
  solved in total; of equal ones the later wins. A round that is left before the end is not stored. A
  failed save does not stop the game.
- The results are stored by the backend (`POST` and `GET /api/training/results`, table `round_results`).
- The code is in `frontend/src/features/statistics/`.

## Tools maintain

**Goal:** the tools can be changed in the app, without a migration. J decided on 2026-11-06: until
the login (TD-17) everyone may do it; the database is the source of truth.

- **Neues Tool:** the button above the table opens a form: key, name, area, level, icon, link to the
  documentation, summary, hints (one per line), examples (separated by a line with `---`) and
  alternatives (chosen by the name of an existing tool).
- **Bearbeiten:** the detail view of a tool offers "Bearbeiten" with the same form. The key cannot be
  changed. The learning content of the card (overview, use cases, key concepts) is not edited in the
  form; it is kept as it is.
- **Rules:** a hint must not contain the name of its tool; the key is new; alternatives exist. A broken
  rule is shown above the buttons of the form and nothing is saved.
- **Löschen:** after a confirmation the tool is marked as deleted. It disappears from the overview, the
  games, the statistics and the interview sets. Saved progress is kept in the database but no longer
  counted; the key of a deleted tool stays taken.
- Alternatives count from both sides: if Docker is added as an alternative of a new tool, Docker shows
  the new tool as its alternative.
- The rules of the data are in the [API documentation](api/learning-content-api.md).

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
