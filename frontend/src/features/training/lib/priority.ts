/* The importance score of a tool (rules in docu/game-play.md, section Priority). The scale is the
   same as in the backend (`training/model.py`). Every tool has a **default priority** (taken from its
   old level); the player's own score overrides it. A tool without an own score ("Standard") uses the
   default. */

export type Score = 0 | 1 | 2 | 3 | 4;

/* The own score of a tool or null when the player has not set one (the default applies). */
export type MaybeScore = Score | null;

/* From this score on a tool belongs to "Mein Tech-Stack". */
export const STACK_SCORE: Score = 3;

export const SCORES: readonly { score: Score; label: string }[] = [
  { score: 0, label: "Ausblenden" },
  { score: 1, label: "Niedrig" },
  { score: 2, label: "Normal" },
  { score: 3, label: "Hoch" },
  { score: 4, label: "Kern" },
];

/* The name of the state "no own score": the default priority of the tool applies. */
export const DEFAULT_LABEL = "Standard";

export function scoreLabel(score: number): string {
  return (
    SCORES.find((option) => option.score === score)?.label ?? DEFAULT_LABEL
  );
}

/* How much more often a card comes up in the games: a score of 0 is never drawn. */
const WEIGHTS: Record<Score, number> = { 0: 0, 1: 1, 2: 2, 3: 4, 4: 8 };

export function weightOf(score: Score): number {
  return WEIGHTS[score];
}

/* The tools that have a default priority: the part of a tool the scores need. */
export type PriorityTool = { key: string; default_priority: number };

/* The own scores a player has set, by tool key. A tool that is not listed uses its default. */
export type Scores = ReadonlyMap<string, number>;

/* The own score of a tool or null ("Standard"). */
export function scoreOf(scores: Scores, toolKey: string): MaybeScore {
  return (scores.get(toolKey) as Score | undefined) ?? null;
}

/* The score that counts for the games, the sorting and the statistics: the own score, otherwise
   the default priority of the tool. */
export function effectiveScore(scores: Scores, tool: PriorityTool): Score {
  return (scoreOf(scores, tool.key) ?? tool.default_priority) as Score;
}

/* A tool with the effective score 0 is hidden in the games. */
export function isHidden(scores: Scores, tool: PriorityTool): boolean {
  return effectiveScore(scores, tool) === 0;
}

/* A tool with the effective score "Hoch" or "Kern" belongs to "Mein Tech-Stack". */
export function inStack(scores: Scores, tool: PriorityTool): boolean {
  return effectiveScore(scores, tool) >= STACK_SCORE;
}
