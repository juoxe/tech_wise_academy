import type { ToolSummary } from "@/features/tools";
import {
  DEFAULT_SCORE,
  SCORES,
  STACK_SCORE,
  scoreOf,
  type ProgressEntry,
  type RoundGame,
  type RoundResult,
  type Score,
  type Scores,
} from "@/features/training";

/* The five areas of the tools. Every other category is a programming language (sorted by paradigm). */
export const AREAS = [
  "DEVOPS",
  "BACKEND",
  "FRONTEND",
  "SECURITY",
  "AI_DATA",
] as const satisfies readonly ToolSummary["category"][];

/* How many tools of a group are learned. */
export type Share = {
  learned: number;
  total: number;
  percent: number;
};

/* The numbers of one game: the learned tools of all tools and the answers given so far. */
export type GameSummary = Share & {
  correct: number;
  wrong: number;
  /* Percent of the right answers; null while no answer was given. */
  accuracy: number | null;
};

/* A tool with wrong answers, for the list of the tools to repeat. */
export type ToolToRepeat = {
  tool: ToolSummary;
  wrong: number;
  correct: number;
};

/* The games without saved learning progress: SQL-Bausteine, Code beurteilen and Memory. */
export const ROUND_GAMES: { game: RoundGame; name: string }[] = [
  { game: "sql", name: "SQL-Bausteine" },
  { game: "code", name: "Code beurteilen" },
  { game: "memory", name: "Memory" },
];

/* One stored round in words. Memory stores the pairs found and the moves needed; the other games the
   tasks solved of all tasks. */
export function describeResult(
  game: RoundGame,
  result: Pick<RoundResult, "solved" | "total">,
): string {
  return game === "memory"
    ? `${result.solved} Paare in ${result.total} Zügen`
    : `${result.solved} von ${result.total} richtig`;
}

export function isLanguage(tool: ToolSummary): boolean {
  return !(AREAS as readonly string[]).includes(tool.category);
}

function percentOf(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

/* The learned tools of a group; entries of tools outside the group are ignored. */
export function shareOf(
  tools: readonly ToolSummary[],
  entries: readonly ProgressEntry[],
): Share {
  const learnedKeys = new Set(
    entries.filter((entry) => entry.learned).map((entry) => entry.tool_key),
  );
  const learned = tools.filter((tool) => learnedKeys.has(tool.key)).length;
  return {
    learned,
    total: tools.length,
    percent: percentOf(learned, tools.length),
  };
}

/* All tools of the game and all answers given so far. */
export function summarize(
  tools: readonly ToolSummary[],
  entries: readonly ProgressEntry[],
): GameSummary {
  /* Answers of a deleted tool are kept in the database but no longer counted. */
  const keys = new Set(tools.map((tool) => tool.key));
  const live = entries.filter((entry) => keys.has(entry.tool_key));
  const correct = live.reduce((sum, entry) => sum + entry.correct_total, 0);
  const wrong = live.reduce((sum, entry) => sum + entry.wrong_total, 0);
  return {
    ...shareOf(tools, entries),
    correct,
    wrong,
    accuracy:
      correct + wrong === 0 ? null : percentOf(correct, correct + wrong),
  };
}

/* The progress of the tools per level; the programming languages have no level and are left out. */
export function byLevel(
  tools: readonly ToolSummary[],
  entries: readonly ProgressEntry[],
  levels: readonly number[],
): { level: number; share: Share }[] {
  return levels.map((level) => ({
    level,
    share: shareOf(
      tools.filter((tool) => !isLanguage(tool) && tool.level === level),
      entries,
    ),
  }));
}

/* The progress of the tools per area. */
export function byArea(
  tools: readonly ToolSummary[],
  entries: readonly ProgressEntry[],
): { area: (typeof AREAS)[number]; share: Share }[] {
  return AREAS.map((area) => ({
    area,
    share: shareOf(
      tools.filter((tool) => tool.category === area),
      entries,
    ),
  }));
}

/* "Mein Tech-Stack": the learned tools among the tools with a high importance score. */
export function stackShare(
  tools: readonly ToolSummary[],
  entries: readonly ProgressEntry[],
  scores: Scores,
): Share {
  return shareOf(
    tools.filter((tool) => scoreOf(scores, tool.key) >= STACK_SCORE),
    entries,
  );
}

/* The progress per importance score. Empty as long as every tool has the default score, so that the
   statistics look as before until the player sets a score. Scores without a tool are left out. */
export function byScore(
  tools: readonly ToolSummary[],
  entries: readonly ProgressEntry[],
  scores: Scores,
): { score: Score; label: string; share: Share }[] {
  if (tools.every((tool) => scoreOf(scores, tool.key) === DEFAULT_SCORE)) {
    return [];
  }
  return [...SCORES]
    .reverse()
    .map(({ score, label }) => ({
      score,
      label,
      share: shareOf(
        tools.filter((tool) => scoreOf(scores, tool.key) === score),
        entries,
      ),
    }))
    .filter(({ share }) => share.total > 0);
}

/* The tools with the most wrong answers: highest first, then the higher importance score, then by
   name. Tools without a wrong answer and hidden tools (score 0) are left out. */
export function toolsToRepeat(
  tools: readonly ToolSummary[],
  entries: readonly ProgressEntry[],
  limit = 10,
  scores: Scores = new Map(),
): ToolToRepeat[] {
  const byKey = new Map(tools.map((tool) => [tool.key, tool]));
  return entries
    .flatMap((entry) => {
      const tool = byKey.get(entry.tool_key);
      return tool !== undefined &&
        entry.wrong_total > 0 &&
        scoreOf(scores, tool.key) > 0
        ? [{ tool, wrong: entry.wrong_total, correct: entry.correct_total }]
        : [];
    })
    .sort(
      (a, b) =>
        b.wrong - a.wrong ||
        scoreOf(scores, b.tool.key) - scoreOf(scores, a.tool.key) ||
        a.tool.name.localeCompare(b.tool.name, "de"),
    )
    .slice(0, limit);
}
