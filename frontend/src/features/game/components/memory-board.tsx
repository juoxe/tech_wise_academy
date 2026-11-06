import { useEffect, useState } from "react";

import type { Difficulty } from "@/features/game/lib/difficulty";
import {
  PAIRS_PER_ROUND,
  buildDeck,
  isPair,
  type MemoryCard,
  type MemoryEntry,
} from "@/features/game/lib/memory-deck";
import { useRecordResult } from "@/features/training";
import { cn } from "@/lib/utils";

const PRIMARY =
  "rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary";

/* The game Memory: a name card and a description card per tool or language, 10 pairs (20 cards) per
   round. The player turns two cards per move; a pair stays face up. Two cards that do not match stay
   open until the player covers them by clicking one of them. The round ends when every pair is
   found. The difficulty chooses the content (see memory-deck.ts), not the number of pairs. */
export function MemoryBoard({
  entries,
  difficulty,
}: {
  entries: MemoryEntry[];
  difficulty: Difficulty;
}) {
  const [deck, setDeck] = useState<MemoryCard[]>(() =>
    buildDeck(entries, PAIRS_PER_ROUND, difficulty),
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [wrongPairs, setWrongPairs] = useState(0);
  const pairCount = deck.length / 2;
  const finished = deck.length > 0 && matched.length === pairCount;
  const recordResult = useRecordResult();

  /* A finished round is stored once: the pairs found and the moves needed. */
  useEffect(() => {
    if (finished) {
      void recordResult("memory", difficulty, pairCount, moves);
    }
    // Only the end of a round matters; the other values do not change after it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  /* Two open cards that do not match: the player has to cover them before the next move. */
  const mismatch = flipped.length === 2;

  function cardOf(id: number | undefined): MemoryCard | undefined {
    return deck.find((card) => card.id === id);
  }

  function flip(card: MemoryCard) {
    if (matched.includes(card.toolKey)) {
      return;
    }
    if (flipped.length === 2) {
      // Clicking one of the two open cards covers both again; other cards cannot be turned yet.
      if (flipped.includes(card.id)) {
        setFlipped([]);
      }
      return;
    }
    if (flipped.includes(card.id)) {
      return;
    }
    if (flipped.length === 0) {
      setFlipped([card.id]);
      return;
    }
    setMoves((count) => count + 1);
    const first = cardOf(flipped[0]);
    if (first && isPair(first, card)) {
      setMatched((current) => [...current, card.toolKey]);
      setFlipped([]);
      return;
    }
    setWrongPairs((count) => count + 1);
    setFlipped([flipped[0] as number, card.id]);
  }

  function restart() {
    setDeck(buildDeck(entries, PAIRS_PER_ROUND, difficulty));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setWrongPairs(0);
  }

  if (deck.length === 0) {
    return (
      <p className="text-lg text-muted-foreground">
        Für dieses Set gibt es noch keine Karten mit Beschreibung.
      </p>
    );
  }

  if (finished) {
    return (
      <section
        aria-labelledby="memory-summary"
        className="mx-auto flex w-full max-w-3xl flex-col gap-4"
      >
        <h2 id="memory-summary" className="text-2xl font-semibold">
          Alle Paare gefunden
        </h2>
        <p className="text-lg">
          Züge: {moves} · Falsche Paare: {wrongPairs}
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
      aria-label="Memory"
      className="mx-auto flex w-full max-w-5xl flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-base">
        <span className="text-muted-foreground">
          Gefundene Paare: {matched.length} von {pairCount}
        </span>
        <span className="text-muted-foreground">
          Züge: {moves} · Falsche Paare: {wrongPairs}
        </span>
      </div>
      <p className="text-base text-muted-foreground">
        {mismatch
          ? "Das passt nicht. Klicke eine der beiden offenen Karten, um sie wieder zuzudecken."
          : "Finde zu jedem Namen die passende Beschreibung."}
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {deck.map((card) => {
          const isFaceUp =
            flipped.includes(card.id) || matched.includes(card.toolKey);
          const isMatched = matched.includes(card.toolKey);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(card)}
              aria-label={
                isFaceUp
                  ? mismatch && flipped.includes(card.id)
                    ? `${card.text} (Karte zudecken)`
                    : undefined
                  : `Verdeckte Karte ${card.id + 1}`
              }
              className={cn(
                "flex min-h-28 items-center justify-center rounded-md border border-border p-3 text-center text-base focus-visible:outline-2 focus-visible:outline-primary",
                !isFaceUp &&
                  "bg-primary text-primary-foreground hover:opacity-90",
                isFaceUp && card.kind === "name" && "bg-card font-semibold",
                isFaceUp && card.kind === "summary" && "bg-card",
                isMatched && "bg-status-done/30",
              )}
            >
              {isFaceUp ? (
                <span className="break-words">{card.text}</span>
              ) : (
                <span aria-hidden="true" className="text-2xl font-semibold">
                  ?
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
