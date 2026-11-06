import { useEffect, useState } from "react";

import type { Difficulty } from "@/features/game/lib/difficulty";
import {
  PAIRS_BY_DIFFICULTY,
  buildDeck,
  isPair,
  type MemoryCard,
} from "@/features/game/lib/memory-deck";
import { useRecordResult } from "@/features/training";
import { cn } from "@/lib/utils";

/* Cards that do not match turn back after this time. */
const TURN_BACK_MS = 900;

const PRIMARY =
  "rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary";

type Entry = { key: string; name: string; summary: string };

/* The game Memory: a name card and a description card per tool or language. The player turns two
   cards per move; a pair stays face up. The round ends when every pair is found. The difficulty sets
   the number of pairs. */
export function MemoryBoard({
  entries,
  difficulty,
}: {
  entries: Entry[];
  difficulty: Difficulty;
}) {
  const pairs = PAIRS_BY_DIFFICULTY[difficulty];
  const [deck, setDeck] = useState<MemoryCard[]>(() =>
    buildDeck(entries, pairs),
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

  /* Two flipped cards are compared after a short time: a pair stays, otherwise both turn back. */
  useEffect(() => {
    if (flipped.length < 2) {
      return;
    }
    const timer = window.setTimeout(() => {
      const first = deck.find((card) => card.id === flipped[0]);
      const second = deck.find((card) => card.id === flipped[1]);
      if (first && second && isPair(first, second)) {
        setMatched((current) => [...current, first.toolKey]);
      } else {
        setWrongPairs((count) => count + 1);
      }
      setFlipped([]);
    }, TURN_BACK_MS);
    return () => window.clearTimeout(timer);
  }, [flipped, deck]);

  function flip(card: MemoryCard) {
    if (
      flipped.length === 2 ||
      flipped.includes(card.id) ||
      matched.includes(card.toolKey)
    ) {
      return;
    }
    setFlipped((current) => [...current, card.id]);
    if (flipped.length === 1) {
      setMoves((count) => count + 1);
    }
  }

  function restart() {
    setDeck(buildDeck(entries, pairs));
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
        Finde zu jedem Namen die passende Beschreibung.
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
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
                isFaceUp ? undefined : `Verdeckte Karte ${card.id + 1}`
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
