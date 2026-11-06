import {
  weightedIndex,
  weightedShuffle,
  weightFor,
  type Weights,
} from "@/features/game/lib/weighted";
import { categoryLabel, type ToolSummary } from "@/features/tools";

export type Category = ToolSummary["category"];

export const CATEGORIES: readonly Category[] = [
  "DEVOPS",
  "BACKEND",
  "FRONTEND",
  "SECURITY",
  "AI_DATA",
];

/* The areas of the second set, the programming languages: they are sorted by paradigm. */
export const PARADIGMS: readonly Category[] = [
  "OBJECT_ORIENTED",
  "FUNCTIONAL",
  "PROCEDURAL",
  "DECLARATIVE",
  "MULTI_PARADIGM",
];

/* An area of the floor. In a mixed set, such as an interview set, the languages share one area. */
export type Area = Category | "LANGUAGE";

export const MIXED_AREAS: readonly Area[] = [...CATEGORIES, "LANGUAGE"];

/* The name shown for an area: the category or paradigm name, or "Sprachen" for the languages of a mixed set. */
export function areaLabel(area: Area): string {
  return area === "LANGUAGE" ? "Sprachen" : categoryLabel(area);
}

/* The area a card belongs to on this floor. */
export function areaOf(tool: ToolSummary, areas: readonly Area[]): Area {
  return areas.includes(tool.category) ? tool.category : "LANGUAGE";
}

export const TIME_LIMIT_SECONDS = 90;
/* Number of rows of the falling area; the floor is the last row. */
export const ROWS = 24;
const START_COLUMN = 2;
/* A card is learned after this many correct placements in a row. */
const CORRECT_IN_A_ROW = 2;

export type Falling = {
  tool: ToolSummary;
  column: number;
  row: number;
};

export type Outcome = {
  tool: ToolSummary;
  column: number;
  correct: boolean;
};

/* One round of Level 0. No card is ever removed: a card is either learned (placed correctly
   CORRECT_IN_A_ROW times in a row) or open. Each card comes up at most once per round, at random,
   until every card has come up; after that the open cards come up again at random.
   The round ends when every card is learned or the time is up. */
export type Drop = {
  areas: readonly Area[];
  cards: ToolSummary[];
  fresh: ToolSummary[];
  open: ToolSummary[];
  falling: Falling | null;
  streak: Record<string, number>;
  learned: string[];
  mistakes: Outcome[];
  lastOutcome: Outcome | null;
  secondsLeft: number;
  timeUp: boolean;
  /* How much more often a card comes up (importance score); a card without a weight counts as 1. */
  weights: Weights;
};

export type AreaProgress = {
  category: Area;
  total: number;
  learned: number;
  open: number;
  withMistake: number;
};

/* Takes the next card: first each fresh card once, then a random open card. */
function next(drop: Drop): Drop {
  if (drop.fresh.length > 0) {
    const [card, ...rest] = drop.fresh;
    return {
      ...drop,
      fresh: rest,
      falling: card ? { tool: card, column: START_COLUMN, row: 0 } : null,
    };
  }
  if (drop.open.length === 0) {
    return { ...drop, falling: null };
  }
  const index = weightedIndex(drop.open, (tool) =>
    weightFor(drop.weights, tool.key),
  );
  const card = drop.open[index];
  if (!card) {
    return { ...drop, falling: null };
  }
  return {
    ...drop,
    open: drop.open.filter((_, position) => position !== index),
    falling: { tool: card, column: START_COLUMN, row: 0 },
  };
}

/* The saved progress of one tool: the row of correct answers and whether it is learned. */
export type SavedStreak = {
  toolKey: string;
  streak: number;
  learned: boolean;
};

/* A round starts with the tools that are not learned yet, each once, at random. Their saved row of
   correct answers is kept, so a learned tool is never placed again. */
export function createDrop(
  tools: readonly ToolSummary[],
  saved: readonly SavedStreak[] = [],
  areas: readonly Area[] = CATEGORIES,
  weights: Weights = {},
): Drop {
  const learned = saved
    .filter((entry) => entry.learned)
    .map((entry) => entry.toolKey);
  const streak = Object.fromEntries(
    saved.map((entry) => [entry.toolKey, entry.streak]),
  );
  const unlearned = tools.filter((tool) => !learned.includes(tool.key));
  return next({
    areas,
    cards: [...tools],
    fresh: weightedShuffle(unlearned, (tool) => weightFor(weights, tool.key)),
    weights,
    open: [],
    falling: null,
    streak,
    learned,
    mistakes: [],
    lastOutcome: null,
    secondsLeft: TIME_LIMIT_SECONDS,
    timeUp: false,
  });
}

/* The falling card lands in its column and is checked against that area's category. */
export function land(drop: Drop): Drop {
  if (!drop.falling) {
    return drop;
  }
  const { tool, column } = drop.falling;
  const correct = drop.areas[column] === areaOf(tool, drop.areas);
  const outcome = { tool, column, correct };
  const base = { ...drop, falling: null, lastOutcome: outcome };

  if (!correct) {
    return next({
      ...base,
      streak: { ...drop.streak, [tool.key]: 0 },
      open: [...drop.open, tool],
      mistakes: [...drop.mistakes, outcome],
    });
  }
  const count = (drop.streak[tool.key] ?? 0) + 1;
  if (count >= CORRECT_IN_A_ROW) {
    return next({
      ...base,
      streak: { ...drop.streak, [tool.key]: count },
      learned: [...drop.learned, tool.key],
    });
  }
  return next({
    ...base,
    streak: { ...drop.streak, [tool.key]: count },
    open: [...drop.open, tool],
  });
}

/* One step down. The card lands on the floor. */
export function fall(drop: Drop): Drop {
  if (!drop.falling) {
    return drop;
  }
  if (drop.falling.row >= ROWS - 1) {
    return land(drop);
  }
  return { ...drop, falling: { ...drop.falling, row: drop.falling.row + 1 } };
}

export function moveBy(drop: Drop, step: number): Drop {
  if (!drop.falling) {
    return drop;
  }
  const column = Math.min(
    drop.areas.length - 1,
    Math.max(0, drop.falling.column + step),
  );
  return { ...drop, falling: { ...drop.falling, column } };
}

/* Places the falling card on the area in this column, at once. */
export function placeAt(drop: Drop, column: number): Drop {
  return land(moveBy(drop, column - (drop.falling?.column ?? 0)));
}

/* One second of the time limit. When the time is up, the round ends with the cards still open. */
export function tick(drop: Drop): Drop {
  const secondsLeft = drop.secondsLeft - 1;
  if (secondsLeft > 0) {
    return { ...drop, secondsLeft };
  }
  return {
    ...drop,
    secondsLeft: 0,
    timeUp: true,
    falling: null,
    fresh: [],
    open: [],
  };
}

export function isFinished(drop: Drop): boolean {
  return (
    drop.falling === null && drop.fresh.length === 0 && drop.open.length === 0
  );
}

/* Per area: how many cards are learned, still open, and how many had a wrong placement. */
export function areaProgress(drop: Drop): AreaProgress[] {
  return drop.areas.map((category) => {
    const inArea = drop.cards.filter(
      (tool) => areaOf(tool, drop.areas) === category,
    );
    const learned = inArea.filter((tool) =>
      drop.learned.includes(tool.key),
    ).length;
    const withMistake = inArea.filter(
      (tool) =>
        !drop.learned.includes(tool.key) &&
        drop.mistakes.some((entry) => entry.tool.key === tool.key),
    ).length;
    return {
      category,
      total: inArea.length,
      learned,
      open: inArea.length - learned,
      withMistake,
    };
  });
}
