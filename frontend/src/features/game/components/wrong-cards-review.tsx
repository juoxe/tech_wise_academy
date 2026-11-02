import { ToolOverviewCard } from "@/features/game/components/tool-overview-card";
import type { ToolSummary } from "@/features/tools";

const REVIEW_BUTTON =
  "rounded-md border border-border px-4 py-2 text-base font-semibold hover:bg-muted disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary";

/* One wrong card of a round and a short note on what went wrong. */
export type WrongCard = {
  tool: ToolSummary;
  note: string;
};

/* The review at the end of a round: the wrong cards one by one as overview cards. The player pages
   through them with "Zurück" and "Weiter" or cancels at any time with "Schließen". */
export function WrongCardsReview({
  cards,
  index,
  onIndexChange,
  onClose,
}: {
  cards: WrongCard[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const card = cards[index];
  if (card === undefined) {
    return null;
  }
  return (
    <section
      aria-label="Falsche Karten durchklicken"
      className="mx-auto flex w-full max-w-5xl flex-col gap-4"
    >
      <p className="text-base text-muted-foreground">
        Falsche Karte {index + 1} von {cards.length} · {card.note}
      </p>
      <ToolOverviewCard toolKey={card.tool.key} />
      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onIndexChange(index - 1)}
          className={REVIEW_BUTTON}
        >
          Zurück
        </button>
        <button type="button" onClick={onClose} className={REVIEW_BUTTON}>
          Schließen
        </button>
        <button
          type="button"
          disabled={index === cards.length - 1}
          onClick={() => onIndexChange(index + 1)}
          className={REVIEW_BUTTON}
        >
          Weiter
        </button>
      </div>
    </section>
  );
}
