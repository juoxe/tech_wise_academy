import { useState } from "react";

import type { Difficulty } from "@/features/game/lib/difficulty";
import {
  isSolved,
  sqlTasksOf,
  taskAt,
  tilesOf,
  type SqlTask,
} from "@/features/game/lib/sql-tasks";
import { shuffle } from "@/features/game/lib/shuffle";
import { cn } from "@/lib/utils";

const TILE =
  "rounded-md border border-border bg-card px-3 py-2 font-mono text-base hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50";

const BUTTON =
  "rounded-md border border-border px-4 py-2 text-base font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50";

/* One task on the board: the tiles in a mixed order, the indexes of the tiles that are still
   available and the indexes of the tiles in the answer, in the order the player clicked them. */
type Round = {
  tiles: string[];
  available: number[];
  answer: number[];
  result: boolean | null;
};

function newRound(task: SqlTask): Round {
  const tiles = shuffle(tilesOf(task));
  return {
    tiles,
    available: tiles.map((_, index) => index),
    answer: [],
    result: null,
  };
}

/* The game SQL-Bausteine: the player builds a PostgreSQL query from tiles by clicking them in the
   order of the query. Tiles that the solution does not use stay in the pool. The difficulty chooses
   the tasks. */
export function SqlTileBoard({ difficulty }: { difficulty: Difficulty }) {
  const tasks = sqlTasksOf(difficulty);
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(0);
  const [finished, setFinished] = useState(false);
  const [round, setRound] = useState<Round>(() => newRound(taskAt(tasks, 0)));
  const task = taskAt(tasks, index);

  function pick(tile: number) {
    setRound((current) => ({
      ...current,
      available: current.available.filter((value) => value !== tile),
      answer: [...current.answer, tile],
    }));
  }

  function remove(tile: number) {
    setRound((current) => ({
      ...current,
      available: [...current.available, tile].sort((a, b) => a - b),
      answer: current.answer.filter((value) => value !== tile),
    }));
  }

  function check() {
    const correct = isSolved(
      task,
      round.answer.flatMap((tile) => round.tiles[tile] ?? []),
    );
    if (correct) {
      setSolved((count) => count + 1);
    }
    setRound((current) => ({ ...current, result: correct }));
  }

  function clear() {
    setRound((current) => ({
      ...current,
      available: current.tiles.map((_, tile) => tile),
      answer: [],
      result: null,
    }));
  }

  function next() {
    const following = index + 1;
    if (following >= tasks.length) {
      setFinished(true);
      return;
    }
    setIndex(following);
    setRound(newRound(taskAt(tasks, following)));
  }

  function restart() {
    setIndex(0);
    setSolved(0);
    setFinished(false);
    setRound(newRound(taskAt(tasks, 0)));
  }

  if (finished) {
    return (
      <section
        aria-labelledby="sql-summary"
        className="mx-auto flex w-full max-w-3xl flex-col gap-4"
      >
        <h2 id="sql-summary" className="text-2xl font-semibold">
          Alle Aufgaben durchgespielt
        </h2>
        <p className="text-lg">
          {solved} von {tasks.length} Abfragen richtig.
        </p>
        <div>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            Nochmal spielen
          </button>
        </div>
      </section>
    );
  }

  const answered = round.result !== null;

  return (
    <section
      aria-label="SQL-Bausteine"
      className="mx-auto flex w-full max-w-3xl flex-col gap-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-base">
        <span className="font-semibold">
          Aufgabe {index + 1} von {tasks.length}
        </span>
        <span className="text-muted-foreground">Richtig: {solved}</span>
      </div>

      <p className="text-lg">{task.goal}</p>

      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold">Deine Abfrage</h3>
        <div
          aria-label="Deine Abfrage"
          className="flex min-h-16 flex-wrap items-center gap-2 rounded-md border border-dashed border-border p-3"
        >
          {round.answer.length === 0 ? (
            <span className="text-base text-muted-foreground">
              Klicke die Bausteine in der Reihenfolge der Abfrage an.
            </span>
          ) : (
            round.answer.map((tile, position) => (
              <button
                key={tile}
                type="button"
                disabled={answered}
                onClick={() => remove(tile)}
                aria-label={`${round.tiles[tile]} entfernen`}
                className={TILE}
              >
                {round.tiles[tile]}
                <span className="sr-only"> (Position {position + 1})</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold">Bausteine</h3>
        <div className="flex min-h-16 flex-wrap gap-2">
          {round.available.map((tile) => (
            <button
              key={tile}
              type="button"
              disabled={answered}
              onClick={() => pick(tile)}
              className={TILE}
            >
              {round.tiles[tile]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {answered ? (
          <button
            type="button"
            onClick={next}
            className="rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            {index + 1 < tasks.length ? "Weiter" : "Zum Ergebnis"}
          </button>
        ) : (
          <button
            type="button"
            onClick={check}
            disabled={round.answer.length === 0}
            className="rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
          >
            Prüfen
          </button>
        )}
        <button
          type="button"
          onClick={clear}
          disabled={round.answer.length === 0 && !answered}
          className={BUTTON}
        >
          Zurücksetzen
        </button>
      </div>

      {round.result !== null && (
        <div
          role="status"
          className={cn(
            "flex flex-col gap-2 rounded-md border border-border p-4 text-base",
            round.result ? "bg-status-done/30" : "bg-destructive/30",
          )}
        >
          {round.result ? (
            <p className="font-semibold">Richtig! Die Abfrage stimmt.</p>
          ) : (
            <>
              <p className="font-semibold">
                Nicht ganz. So sieht die Abfrage aus:
              </p>
              <code className="font-mono break-words">
                {task.solution.join(" ")}
              </code>
            </>
          )}
        </div>
      )}
    </section>
  );
}
