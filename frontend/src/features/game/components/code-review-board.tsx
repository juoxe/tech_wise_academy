import { useState } from "react";

import {
  CODE_TASKS,
  isTaskSolved,
} from "@/features/game/lib/code-review-tasks";
import { cn } from "@/lib/utils";

const BUTTON =
  "rounded-md border border-border px-4 py-2 text-base font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50";

const PRIMARY =
  "rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50";

/* The game Code beurteilen: a code example and several statements about it. The learner marks every
   statement that is right; any number can be right. The check shows the reason of each statement. */
export function CodeReviewBoard() {
  const [index, setIndex] = useState(0);
  const [marked, setMarked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(0);
  const [finished, setFinished] = useState(false);
  const task = CODE_TASKS[index];

  function toggle(statement: number) {
    if (checked) {
      return;
    }
    setMarked((current) =>
      current.includes(statement)
        ? current.filter((value) => value !== statement)
        : [...current, statement],
    );
  }

  function check() {
    if (task === undefined) {
      return;
    }
    if (isTaskSolved(task, marked)) {
      setSolved((count) => count + 1);
    }
    setChecked(true);
  }

  function next() {
    if (index + 1 >= CODE_TASKS.length) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setMarked([]);
    setChecked(false);
  }

  function restart() {
    setIndex(0);
    setMarked([]);
    setChecked(false);
    setSolved(0);
    setFinished(false);
  }

  if (finished || task === undefined) {
    return (
      <section
        aria-labelledby="code-summary"
        className="mx-auto flex w-full max-w-3xl flex-col gap-4"
      >
        <h2 id="code-summary" className="text-2xl font-semibold">
          Alle Beispiele durchgespielt
        </h2>
        <p className="text-lg">
          {solved} von {CODE_TASKS.length} Beispielen richtig beurteilt.
        </p>
        <div>
          <button type="button" onClick={restart} className={PRIMARY}>
            Nochmal spielen
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Code beurteilen"
      className="mx-auto flex w-full max-w-3xl flex-col gap-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-base">
        <span className="font-semibold">
          Beispiel {index + 1} von {CODE_TASKS.length} · {task.language}
        </span>
        <span className="text-muted-foreground">Richtig: {solved}</span>
      </div>

      <p className="text-lg">{task.question}</p>
      <p className="text-base text-muted-foreground">
        Mehrere Aussagen können richtig sein, auch keine oder alle.
      </p>

      <pre className="overflow-x-auto rounded-md border border-border bg-card p-4 font-mono text-base">
        <code>{task.code}</code>
      </pre>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-base font-semibold">Aussagen</legend>
        {task.statements.map((statement, position) => {
          const isMarked = marked.includes(position);
          const showResult = checked;
          return (
            <div
              key={statement.text}
              className={cn(
                "flex flex-col gap-2 rounded-md border border-border p-4",
                showResult && statement.correct && "bg-status-done/30",
                showResult &&
                  !statement.correct &&
                  isMarked &&
                  "bg-destructive/30",
              )}
            >
              <label className="flex cursor-pointer items-start gap-3 text-base">
                <input
                  type="checkbox"
                  checked={isMarked}
                  disabled={checked}
                  onChange={() => toggle(position)}
                  className="mt-1 size-5 accent-primary"
                />
                <span>{statement.text}</span>
              </label>
              {showResult && (
                <p className="text-base">
                  <span className="font-semibold">
                    {statement.correct ? "Richtig. " : "Falsch. "}
                  </span>
                  {statement.reason}
                </p>
              )}
            </div>
          );
        })}
      </fieldset>

      <div className="flex flex-wrap gap-2">
        {checked ? (
          <button type="button" onClick={next} className={PRIMARY}>
            {index + 1 < CODE_TASKS.length ? "Weiter" : "Zum Ergebnis"}
          </button>
        ) : (
          <button type="button" onClick={check} className={PRIMARY}>
            Prüfen
          </button>
        )}
        {!checked && (
          <button
            type="button"
            onClick={() => setMarked([])}
            disabled={marked.length === 0}
            className={BUTTON}
          >
            Auswahl leeren
          </button>
        )}
      </div>

      {checked && (
        <p role="status" className="text-base font-semibold">
          {isTaskSolved(task, marked)
            ? "Alle Aussagen richtig beurteilt."
            : "Nicht alle Aussagen richtig beurteilt. Siehe die Begründungen oben."}
        </p>
      )}
    </section>
  );
}
