import type { ToolSummary } from "@/features/tools";

export type Category = ToolSummary["category"];

export const CATEGORIES: readonly Category[] = [
  "DEVOPS",
  "BACKEND",
  "FRONTEND",
  "SECURITY",
  "AI_DATA",
];

/* One round of Level 0: the hand holds the cards still to sort, the first one is the current card. */
export type Round = {
  hand: ToolSummary[];
  piles: Record<Category, ToolSummary[]>;
  wrongAttempts: number;
  /* Keys of the cards that were placed wrongly at least once. */
  missedKeys: string[];
};

export type PlaceResult = {
  round: Round;
  correct: boolean;
};

export type AreaResult = {
  category: Category;
  total: number;
  firstTry: number;
};

function emptyPiles(): Record<Category, ToolSummary[]> {
  return { DEVOPS: [], BACKEND: [], FRONTEND: [], SECURITY: [], AI_DATA: [] };
}

function shuffle<T>(items: readonly T[]): T[] {
  return items
    .map((item) => ({ item, order: Math.random() }))
    .sort((a, b) => a.order - b.order)
    .map(({ item }) => item);
}

export function createRound(tools: readonly ToolSummary[]): Round {
  return {
    hand: shuffle(tools),
    piles: emptyPiles(),
    wrongAttempts: 0,
    missedKeys: [],
  };
}

/* Places the current card on a pile. A wrong pile keeps the card in the hand and counts an attempt. */
export function placeCard(round: Round, category: Category): PlaceResult {
  const [card, ...rest] = round.hand;
  if (!card) {
    return { round, correct: false };
  }
  if (card.category !== category) {
    return {
      round: {
        ...round,
        wrongAttempts: round.wrongAttempts + 1,
        missedKeys: round.missedKeys.includes(card.key)
          ? round.missedKeys
          : [...round.missedKeys, card.key],
      },
      correct: false,
    };
  }
  return {
    round: {
      ...round,
      hand: rest,
      piles: { ...round.piles, [category]: [...round.piles[category], card] },
    },
    correct: true,
  };
}

/* Per area: how many of its tools were sorted correctly on the first try. */
export function areaResults(
  tools: readonly ToolSummary[],
  round: Round,
): AreaResult[] {
  return CATEGORIES.map((category) => {
    const inArea = tools.filter((tool) => tool.category === category);
    const missed = inArea.filter((tool) => round.missedKeys.includes(tool.key));
    return {
      category,
      total: inArea.length,
      firstTry: inArea.length - missed.length,
    };
  }).filter((area) => area.total > 0);
}
