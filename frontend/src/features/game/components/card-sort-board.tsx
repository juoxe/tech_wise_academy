import { useEffect, useState } from "react";

import {
  areaResults,
  CATEGORIES,
  createRound,
  placeCard,
  type Category,
  type Round,
} from "@/features/game/lib/round";
import { ToolIcon, type ToolSummary } from "@/features/tools";
import { cn } from "@/lib/utils";

const FLASH_MS = 600;

const BUTTON =
  "inline-flex items-center rounded-md bg-primary px-4 py-2 text-base font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary";

/* Level 0: the cards are sorted one by one onto the piles of their categories; the summary shows
   per area how many tools were sorted correctly on the first try (see docu/game-play.md). */
export function CardSortBoard({
  tools,
  onPlayAgain,
}: {
  tools: ToolSummary[];
  onPlayAgain: () => void;
}) {
  const [round, setRound] = useState<Round>(() => createRound(tools));
  const [flash, setFlash] = useState<{
    category: Category;
    correct: boolean;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const current = round.hand[0];

  useEffect(() => {
    if (flash === null) {
      return;
    }
    const timer = window.setTimeout(() => setFlash(null), FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [flash]);

  function handlePlace(category: Category) {
    const result = placeCard(round, category);
    setRound(result.round);
    setFlash({ category, correct: result.correct });
    setMessage(result.correct ? null : "Nicht ganz, versuch es nochmal.");
  }

  function flashClass(category: Category) {
    if (flash?.category !== category) {
      return undefined;
    }
    return flash.correct
      ? "border-status-done bg-status-done/15"
      : "border-destructive bg-destructive/10";
  }

  if (!current) {
    return (
      <section
        aria-labelledby="round-summary"
        className="flex flex-col items-center gap-4 py-12 text-center"
      >
        <h2 id="round-summary" className="text-2xl font-semibold">
          Auswertung: Wissens-Check
        </h2>
        <p className="text-muted-foreground">
          Falsche Versuche: {round.wrongAttempts}
        </p>
        <ul className="flex w-full max-w-xl flex-col gap-3">
          {areaResults(tools, round).map((area) => (
            <li
              key={area.category}
              className="flex items-center justify-between gap-4 rounded-md border border-border bg-card px-4 py-3"
            >
              <span className="text-lg font-semibold">{area.category}</span>
              <span>
                {area.firstTry} von {area.total} auf Anhieb richtig
              </span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onPlayAgain} className={BUTTON}>
          Nochmal spielen
        </button>
      </section>
    );
  }

  return (
    <section
      aria-label="Level 0: Wissens-Check"
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col items-center gap-3">
        <p className="text-lg text-muted-foreground">
          Karten übrig: {round.hand.length} · Falsche Versuche:{" "}
          {round.wrongAttempts}
        </p>
        <div
          draggable
          onDragStart={(event) =>
            event.dataTransfer.setData("text/plain", current.key)
          }
          className="flex cursor-grab items-center gap-3 rounded-lg border border-border bg-card px-6 py-4 shadow-sm"
        >
          <ToolIcon icon={current.icon} category={current.category} />
          <span className="text-2xl font-semibold">{current.name}</span>
        </div>
        <p role="status" className="min-h-7 text-lg text-destructive">
          {message}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => handlePlace(category)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handlePlace(category);
            }}
            className={cn(
              "flex min-h-40 flex-col gap-2 rounded-lg border-2 border-dashed border-border bg-card p-4 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary",
              flashClass(category),
            )}
          >
            <span className="text-lg font-semibold">{category}</span>
            <span className="text-base text-muted-foreground">
              {round.piles[category].length} Karten
            </span>
            {round.piles[category].map((tool) => (
              <span key={tool.key} className="block text-base">
                {tool.name}
              </span>
            ))}
          </button>
        ))}
      </div>
    </section>
  );
}
