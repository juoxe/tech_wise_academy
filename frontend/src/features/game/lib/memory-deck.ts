/* The deck of the game Memory: for each tool or language one card with its name and one card with its
   description. Two cards match when they belong to the same tool or language. */
export type MemoryCard = {
  id: number;
  toolKey: string;
  kind: "name" | "summary";
  text: string;
};

import { shuffle } from "@/features/game/lib/shuffle";
import type { Difficulty } from "@/features/game/lib/difficulty";

/* A round always has 10 pairs, so 20 cards. The difficulty chooses the content, not the number. */
export const PAIRS_PER_ROUND = 10;

/* The difficulty chooses the tools by their default priority: Kennen takes the tools with "Hoch",
   Intermediate "Normal" and Expert "Niedrig" (the old levels). */
export const DEFAULT_PRIORITY_BY_DIFFICULTY: Record<Difficulty, number> = {
  1: 3,
  2: 2,
  3: 1,
};

export type MemoryEntry = {
  key: string;
  name: string;
  summary: string;
  default_priority?: number;
};

/* Builds a round: up to the given number of entries with a summary, each gives two cards. The entries
   whose default priority fits the difficulty come first; if the set holds too few of them, the round
   is filled with the other entries of the set. */
export function buildDeck(
  entries: readonly MemoryEntry[],
  pairs: number,
  difficulty: Difficulty = 1,
  random = Math.random,
): MemoryCard[] {
  const usable = entries.filter((entry) => entry.summary.trim() !== "");
  const wanted = DEFAULT_PRIORITY_BY_DIFFICULTY[difficulty];
  const fitting = usable.filter((entry) => entry.default_priority === wanted);
  const others = usable.filter((entry) => entry.default_priority !== wanted);
  const chosen = [
    ...shuffle(fitting, random),
    ...shuffle(others, random),
  ].slice(0, pairs);
  const cards = chosen.flatMap((entry) => [
    { toolKey: entry.key, kind: "name" as const, text: entry.name },
    { toolKey: entry.key, kind: "summary" as const, text: entry.summary },
  ]);
  return shuffle(cards, random).map((card, id) => ({ ...card, id }));
}

/* Two flipped cards form a pair when they belong to the same tool and show different sides. */
export function isPair(first: MemoryCard, second: MemoryCard): boolean {
  return first.toolKey === second.toolKey && first.kind !== second.kind;
}
