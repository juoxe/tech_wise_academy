import { useEffect, useState } from "react";

import {
  askedTool,
  giveUp,
  guess,
  hintsShownFor,
  isRoundDone,
  revealHint,
  shownHints,
  startRound,
  type Answer,
  type Clearing,
} from "@/features/game/lib/clearing";
import { useRecordAnswer } from "@/features/training";
import { ToolIcon, useTool, type ToolSummary } from "@/features/tools";

const FLASH_MS = 600;

/* The field of "Karten abräumen": one round of up to 20 cards. The hint of the asked card is shown
   above the field; a click on the right card clears it. */
export function ClearingBoard({
  tools,
  onNextRound,
}: {
  tools: ToolSummary[];
  onNextRound: () => void;
}) {
  const [clearing, setClearing] = useState<Clearing>(() => startRound(tools));
  const asked = askedTool(clearing);
  const hint = useTool(asked?.key);
  const done = isRoundDone(clearing);
  const outcome = clearing.lastOutcome;
  const recordAnswer = useRecordAnswer();

  useEffect(() => {
    if (outcome === null) {
      return;
    }
    const timer = window.setTimeout(
      () => setClearing((current) => ({ ...current, lastOutcome: null })),
      FLASH_MS,
    );
    return () => window.clearTimeout(timer);
  }, [outcome]);

  function apply(result: { clearing: Clearing; answer: Answer | null }) {
    setClearing(result.clearing);
    if (result.answer) {
      recordAnswer(
        "clearing",
        result.answer.toolKey,
        result.answer.correct,
      ).catch(() => undefined);
    }
  }

  function click(key: string) {
    apply(guess(clearing, key));
  }

  function dontKnow() {
    apply(giveUp(clearing));
  }

  function showHint() {
    setClearing(revealHint(clearing));
  }

  if (done) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Runde geschafft</h2>
        <p className="text-lg text-muted-foreground">
          Alle Karten im Feld sind abgeräumt.
        </p>
        <div>
          <button
            type="button"
            onClick={onNextRound}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            Nächste Runde
          </button>
        </div>
      </section>
    );
  }

  const allHints = hint.data?.hints ?? [];
  const shown = asked ? hintsShownFor(clearing, asked.key) : 0;
  const hints = shownHints(allHints, shown);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-base text-muted-foreground">
        <span>
          Karten übrig: {clearing.field.length - clearing.cleared.length}
        </span>
      </div>
      <div className="rounded-md border border-border p-4">
        <p className="text-lg font-semibold">Welches Werkzeug ist gemeint?</p>
        {hint.isLoading ? (
          <p className="text-base text-muted-foreground">
            Hinweis wird geladen …
          </p>
        ) : (
          <ol className="mt-2 list-decimal space-y-1 pl-6 text-base">
            {hints.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ol>
        )}
        <p
          aria-live="polite"
          className="mt-3 min-h-6 text-base font-semibold text-destructive"
        >
          {outcome && !outcome.correct ? "Nicht ganz, versuch es nochmal." : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={showHint}
            disabled={shown >= allHints.length}
            className="rounded-md border border-border px-4 py-2 text-base font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          >
            Nächster Hinweis
          </button>
          <button
            type="button"
            onClick={dontKnow}
            className="rounded-md border border-border px-4 py-2 text-base font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            Weiß ich nicht
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {clearing.field.map((tool) => {
          if (clearing.cleared.includes(tool.key)) {
            return <div key={tool.key} aria-hidden="true" />;
          }
          const flash =
            outcome?.key === tool.key
              ? outcome.correct
                ? "bg-status-done text-background"
                : "bg-destructive text-background"
              : "hover:bg-muted";
          return (
            <button
              key={tool.key}
              type="button"
              onClick={() => click(tool.key)}
              className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-md border border-border p-2 text-center text-base break-words ${flash}`}
            >
              <ToolIcon icon={tool.icon} category={tool.category} />
              <span>{tool.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
