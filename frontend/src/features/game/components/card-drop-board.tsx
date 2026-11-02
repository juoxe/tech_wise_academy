import { useEffect, useRef, useState } from "react";

import {
  CATEGORIES,
  ROWS,
  areaLabel,
  areaOf,
  areaProgress,
  createDrop,
  type SavedStreak,
  fall,
  isFinished,
  moveBy,
  placeAt,
  tick,
  type Area,
  type Drop,
} from "@/features/game/lib/drop";
import { ToolOverviewCard } from "@/features/game/components/tool-overview-card";
import { useRecordAnswer } from "@/features/training";
import { ToolIcon, type ToolSummary } from "@/features/tools";
import { cn } from "@/lib/utils";

const FALL_MS = 500;
const FLASH_MS = 600;

const CONTROL =
  "rounded-md border border-border bg-card px-4 py-2 text-lg font-semibold hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary";

const REVIEW_BUTTON =
  "rounded-md border border-border px-4 py-2 text-base font-semibold hover:bg-muted disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary";

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/* The falling card; it moves down the board and lands on the floor of its area. The name is shown
   in full and may wrap onto several lines. */
function FallingCard({ tool, row }: { tool: ToolSummary; row: number }) {
  return (
    <div
      className="absolute inset-x-1 flex min-h-14 items-center gap-2 rounded-md border border-border bg-primary px-3 py-2 text-base text-primary-foreground shadow-sm"
      style={{
        top: `calc(${(row / (ROWS - 1)) * 100}% - ${(row / (ROWS - 1)) * 3.5}rem)`,
      }}
    >
      <ToolIcon icon={tool.icon} category={tool.category} />
      <span className="min-w-0 break-words leading-snug">{tool.name}</span>
    </div>
  );
}

/* Level 0: cards fall one after another. The player moves each card above an area and drops it
   onto the area's floor (see docu/game-play.md). */
export function CardDropBoard({
  tools,
  saved,
  areas = CATEGORIES,
  onPlayAgain,
}: {
  tools: ToolSummary[];
  saved: SavedStreak[];
  areas?: readonly Area[];
  onPlayAgain: () => void;
}) {
  const [drop, setDrop] = useState<Drop>(() => createDrop(tools, saved, areas));
  const recordAnswer = useRecordAnswer();
  const fallingKey = drop.falling?.tool.key ?? null;
  const finished = isFinished(drop);
  const outcome = drop.lastOutcome;
  const sectionRef = useRef<HTMLElement>(null);
  const columns = {
    gridTemplateColumns: `repeat(${drop.areas.length}, minmax(0, 1fr))`,
  };

  /* The board takes the focus, so arrow keys and space go to the game and not to the tab list. */
  useEffect(() => {
    sectionRef.current?.focus();
  }, []);

  /* Every landing is stored for the player. A failed request must not stop the game. */
  useEffect(() => {
    if (outcome === null) {
      return;
    }
    recordAnswer("level0", outcome.tool.key, outcome.correct).catch(
      () => undefined,
    );
  }, [outcome, recordAnswer]);

  /* The time limit runs from the start of the round and ends it when it reaches zero. */
  useEffect(() => {
    if (finished) {
      return;
    }
    const timer = window.setInterval(() => setDrop(tick), 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  /* The timer restarts only for a new card, so moving a card does not slow its fall. */
  useEffect(() => {
    if (fallingKey === null) {
      return;
    }
    const timer = window.setInterval(() => setDrop(fall), FALL_MS);
    return () => window.clearInterval(timer);
  }, [fallingKey]);

  /* The floor flash after a placement is short-lived. */
  useEffect(() => {
    if (outcome === null) {
      return;
    }
    const timer = window.setTimeout(
      () => setDrop((current) => ({ ...current, lastOutcome: null })),
      FLASH_MS,
    );
    return () => window.clearTimeout(timer);
  }, [outcome]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setDrop((current) => moveBy(current, -1));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setDrop((current) => moveBy(current, 1));
      } else if (event.key === "ArrowDown" || event.key === " ") {
        event.preventDefault();
        setDrop((current) => placeAt(current, current.falling?.column ?? 0));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (finished) {
    return <Summary drop={drop} onPlayAgain={onPlayAgain} />;
  }

  const remaining =
    drop.fresh.length + drop.open.length + (drop.falling ? 1 : 0);
  const progress = areaProgress(drop);

  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      aria-label="Level 0: Wissens-Check"
      className="mx-auto flex w-full max-w-5xl flex-col gap-4 outline-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg text-muted-foreground">
          Karten übrig: {remaining}
        </p>
        <p
          className={cn(
            "text-lg tabular-nums",
            drop.secondsLeft <= 10
              ? "font-semibold text-destructive"
              : "text-muted-foreground",
          )}
        >
          Zeit: {formatTime(drop.secondsLeft)}
        </p>
      </div>

      <div
        className="flex flex-col overflow-hidden rounded-lg border border-border bg-card"
        style={{ height: "70vh" }}
      >
        <div className="relative grid flex-1" style={columns}>
          {drop.areas.map((category, column) => (
            <div
              key={category}
              className="relative border-x border-dashed border-border/50"
            >
              {drop.falling?.column === column && (
                <FallingCard tool={drop.falling.tool} row={drop.falling.row} />
              )}
            </div>
          ))}
        </div>

        <div className="grid h-36 gap-2 p-2" style={columns}>
          {drop.areas.map((category, column) => {
            const area = progress[column];
            const flash = outcome?.column === column;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setDrop((current) => placeAt(current, column))}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-md bg-muted p-2 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary",
                  flash && outcome.correct && "bg-status-done/30",
                  flash && !outcome.correct && "bg-destructive/30",
                )}
              >
                <span className="break-words text-center text-lg font-semibold">
                  {areaLabel(category)}
                </span>
                <span className="text-base text-muted-foreground">
                  {area?.learned ?? 0} von {area?.total ?? 0} gelernt
                </span>
                {flash && (
                  <span className="text-base font-semibold">
                    {outcome.correct ? "richtig" : "falsch"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          className={CONTROL}
          aria-label="Nach links"
          onClick={() => setDrop((current) => moveBy(current, -1))}
        >
          ←
        </button>
        <button
          type="button"
          className={CONTROL}
          onClick={() =>
            setDrop((current) => placeAt(current, current.falling?.column ?? 0))
          }
        >
          Ablegen
        </button>
        <button
          type="button"
          className={CONTROL}
          aria-label="Nach rechts"
          onClick={() => setDrop((current) => moveBy(current, 1))}
        >
          →
        </button>
      </div>
    </section>
  );
}

/* The summary: a vertical dashboard with the progress of each area, then the cards with mistakes. */
function Summary({
  drop,
  onPlayAgain,
}: {
  drop: Drop;
  onPlayAgain: () => void;
}) {
  const progress = areaProgress(drop);
  const allLearned = drop.learned.length === drop.cards.length;
  const latest = new Map(drop.mistakes.map((entry) => [entry.tool.key, entry]));
  const mistakes = [...latest.values()].filter(
    (entry) => !drop.learned.includes(entry.tool.key),
  );
  const open = drop.cards.filter((tool) => !drop.learned.includes(tool.key));
  const [review, setReview] = useState<number | null>(null);
  const reviewed = review === null ? undefined : mistakes[review];

  return (
    <section
      aria-labelledby="round-summary"
      className="mx-auto flex w-full max-w-5xl flex-col gap-6"
    >
      <h2 id="round-summary" className="text-2xl font-semibold">
        {allLearned ? "Gemastert!" : "Zeit abgelaufen"}
      </h2>
      <p className="text-lg">
        {drop.learned.length} von {drop.cards.length} Karten gelernt.
      </p>
      <div>
        <button
          type="button"
          onClick={onPlayAgain}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary"
        >
          Nochmal spielen
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {progress.map((area) => {
          const learnedPercent = area.total
            ? (area.learned / area.total) * 100
            : 0;
          return (
            <div key={area.category} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-lg font-semibold">
                  {areaLabel(area.category)}
                </span>
                <span className="text-base text-muted-foreground">
                  {area.learned} gelernt · {area.open} offen ·{" "}
                  {area.withMistake} mit Fehler
                </span>
              </div>
              <div className="flex h-5 w-full overflow-hidden rounded-md bg-muted">
                <div
                  className="h-full bg-status-done"
                  style={{ width: `${learnedPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {reviewed && review !== null && (
        <section
          aria-label="Falsche Karte durchklicken"
          className="flex flex-col gap-4"
        >
          <p className="text-base text-muted-foreground">
            Falsche Karte {review + 1} von {mistakes.length} · eingeordnet in{" "}
            {areaLabel(
              drop.areas[reviewed.column] ?? areaOf(reviewed.tool, drop.areas),
            )}
          </p>
          <ToolOverviewCard toolKey={reviewed.tool.key} />
          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              disabled={review === 0}
              onClick={() => setReview(review - 1)}
              className={REVIEW_BUTTON}
            >
              Zurück
            </button>
            <button
              type="button"
              onClick={() => setReview(null)}
              className={REVIEW_BUTTON}
            >
              Schließen
            </button>
            <button
              type="button"
              disabled={review === mistakes.length - 1}
              onClick={() => setReview(review + 1)}
              className={REVIEW_BUTTON}
            >
              Weiter
            </button>
          </div>
        </section>
      )}

      {mistakes.length > 0 && review === null && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-semibold">Falsch eingeordnet</h3>
            <button
              type="button"
              onClick={() => setReview(0)}
              className={REVIEW_BUTTON}
            >
              Falsche Karten durchklicken
            </button>
          </div>
          <ul className="flex flex-col gap-3">
            {mistakes.map((entry, index) => (
              <li key={entry.tool.key}>
                <button
                  type="button"
                  onClick={() => setReview(index)}
                  className="flex w-full flex-col gap-1 rounded-md border border-border bg-card px-4 py-3 text-left hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span className="font-semibold">{entry.tool.name}</span>
                  <span className="text-muted-foreground">
                    Eingeordnet in{" "}
                    {areaLabel(
                      drop.areas[entry.column] ??
                        areaOf(entry.tool, drop.areas),
                    )}
                    , richtig ist {areaLabel(areaOf(entry.tool, drop.areas))}.
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!allLearned && open.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Noch offen</h3>
          <ul className="flex flex-col gap-3">
            {open.map((tool) => (
              <li
                key={tool.key}
                className="rounded-md border border-border bg-card px-4 py-3"
              >
                <p className="font-semibold">{tool.name}</p>
                <p className="text-muted-foreground">
                  Richtig ist {areaLabel(areaOf(tool, drop.areas))}.
                </p>
                <p>{tool.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
