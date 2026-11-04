/* The deck of the game Memory: for each tool or language one card with its name and one card with its
   description. Two cards match when they belong to the same tool or language. */
export type MemoryCard = {
  id: number;
  toolKey: string;
  kind: "name" | "summary";
  text: string;
};

import { shuffle } from "@/features/game/lib/shuffle";

export const PAIRS_PER_ROUND = 6;

/* Builds a round: up to six entries with a summary are drawn at random, each gives two cards. */
export function buildDeck(
  entries: readonly { key: string; name: string; summary: string }[],
  random = Math.random,
): MemoryCard[] {
  const usable = entries.filter((entry) => entry.summary.trim() !== "");
  const chosen = shuffle(usable, random).slice(0, PAIRS_PER_ROUND);
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
