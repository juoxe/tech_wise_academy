import type { ToolSummary } from "@/features/tools";

/* Cards in one field: 5 rows of 4, as in the Tech Tool Trainer. */
export const FIELD_SIZE = 20;

/* The last click of a round. The key is the card that was clicked, or the asked card for "Weiß ich
   nicht", and null when the player asked for a hint. */
export type Outcome = {
  key: string | null;
  correct: boolean;
};

/* One round of "Karten abräumen". Each card of the field is asked once, in random order. The asked
   card is chosen at random among the open cards, so the position in the field gives no hint. A
   correct click clears the card. A wrong click or "Weiß ich nicht" is a mistake on the asked card,
   and so is any answer after a hint was revealed. "Nächster Hinweis" shows one more hint without a
   mistake. */
export type Clearing = {
  field: ToolSummary[];
  cleared: string[];
  asked: string;
  mistakes: Record<string, number>;
  hintsShown: Record<string, number>;
  /* A random number per card; it fixes the order of its hints for this round. */
  hintSeeds: Record<string, number>;
  lastOutcome: Outcome | null;
};

/* The answer to store for a player: null when the click does not count. */
export type Answer = {
  toolKey: string;
  correct: boolean;
};

function shuffle<T>(items: readonly T[]): T[] {
  return items
    .map((item) => ({ item, order: Math.random() }))
    .sort((a, b) => a.order - b.order)
    .map(({ item }) => item);
}

/* A random card of the field that is not cleared yet; empty when every card is cleared. */
function pickAsked(
  field: readonly ToolSummary[],
  cleared: readonly string[],
): string {
  const open = field.filter((tool) => !cleared.includes(tool.key));
  const index = Math.floor(Math.random() * open.length);
  return open[index]?.key ?? "";
}

/* A round starts with a random selection of the tools that are not learned yet. */
export function startRound(tools: readonly ToolSummary[]): Clearing {
  const field = shuffle(tools).slice(0, FIELD_SIZE);
  return {
    field,
    cleared: [],
    asked: pickAsked(field, []),
    mistakes: {},
    hintsShown: {},
    hintSeeds: Object.fromEntries(
      field.map((tool) => [tool.key, Math.random()]),
    ),
    lastOutcome: null,
  };
}

/* The hints of a card in the order of this round. A hint may fit several tools on purpose; the order
   is random in every round, so that the player learns all hints and not just the first one. */
export function orderedHints(hints: readonly string[], seed: number): string[] {
  let state = Math.floor(seed * 2 ** 32) >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 2 ** 32;
  };
  const order = [...hints];
  for (let index = order.length - 1; index > 0; index -= 1) {
    const other = Math.floor(next() * (index + 1));
    [order[index], order[other]] = [
      order[other] as string,
      order[index] as string,
    ];
  }
  return order;
}

/* The cards with a mistake in this round: a wrong click or "Weiß ich nicht". */
export function wrongTools(clearing: Clearing): ToolSummary[] {
  return clearing.field.filter(
    (tool) => (clearing.mistakes[tool.key] ?? 0) > 0,
  );
}

/* The card that is asked now, or undefined when the round is done. */
export function askedTool(clearing: Clearing): ToolSummary | undefined {
  return clearing.field.find(
    (tool) =>
      tool.key === clearing.asked && !clearing.cleared.includes(tool.key),
  );
}

export function isRoundDone(clearing: Clearing): boolean {
  return (
    askedTool(clearing) === undefined &&
    clearing.cleared.length === clearing.field.length
  );
}

/* The number of hints shown for the asked card; the first hint is shown from the start. */
export function hintsShownFor(clearing: Clearing, key: string): number {
  return clearing.hintsShown[key] ?? 1;
}

/* Only a card that is answered on the first try counts as a correct answer: no mistake and no hint
   beyond the first one. Such a card is cleared, and the answer is stored; otherwise the card is
   cleared without a stored answer. */
export function guess(
  clearing: Clearing,
  key: string,
): { clearing: Clearing; answer: Answer | null } {
  const asked = askedTool(clearing);
  if (asked === undefined || clearing.cleared.includes(key)) {
    return { clearing, answer: null };
  }
  if (key === asked.key) {
    const cleared = [...clearing.cleared, key];
    const firstTry =
      (clearing.mistakes[asked.key] ?? 0) === 0 &&
      hintsShownFor(clearing, asked.key) === 1;
    return {
      clearing: {
        ...clearing,
        cleared,
        asked: pickAsked(clearing.field, cleared),
        lastOutcome: { key, correct: true },
      },
      answer: firstTry ? { toolKey: key, correct: true } : null,
    };
  }
  return miss(clearing, asked, key);
}

/* "Weiß ich nicht": a mistake on the asked card without clicking a wrong card. */
export function giveUp(clearing: Clearing): {
  clearing: Clearing;
  answer: Answer | null;
} {
  const asked = askedTool(clearing);
  if (asked === undefined) {
    return { clearing, answer: null };
  }
  return miss(clearing, asked, asked.key);
}

/* "Nächster Hinweis": one more hint for the asked card. It is not a mistake, but the card can no
   longer be answered on the first try. */
export function revealHint(clearing: Clearing): Clearing {
  const asked = askedTool(clearing);
  if (asked === undefined) {
    return clearing;
  }
  return {
    ...clearing,
    hintsShown: {
      ...clearing.hintsShown,
      [asked.key]: hintsShownFor(clearing, asked.key) + 1,
    },
    lastOutcome: null,
  };
}

/* A wrong answer on the asked card: a mistake and one more hint. */
function miss(
  clearing: Clearing,
  asked: ToolSummary,
  key: string | null,
): { clearing: Clearing; answer: Answer } {
  return {
    clearing: {
      ...clearing,
      mistakes: {
        ...clearing.mistakes,
        [asked.key]: (clearing.mistakes[asked.key] ?? 0) + 1,
      },
      hintsShown: {
        ...clearing.hintsShown,
        [asked.key]: hintsShownFor(clearing, asked.key) + 1,
      },
      lastOutcome: { key, correct: false },
    },
    answer: { toolKey: asked.key, correct: false },
  };
}

/* The hints shown for the asked card: the first ones up to the number that is shown. */
export function shownHints(hints: readonly string[], shown: number): string[] {
  return hints.slice(0, Math.min(hints.length, shown));
}
