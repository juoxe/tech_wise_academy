/* The importance score a player gives to a tool (rules in docu/game-play.md, section Priority).
   The scale and the default are the same as in the backend (`training/model.py`). */

export type Score = 0 | 1 | 2 | 3 | 4;

export const DEFAULT_SCORE: Score = 2;

/* From this score on a tool belongs to "Mein Tech-Stack". */
export const STACK_SCORE: Score = 3;

export const SCORES: readonly { score: Score; label: string }[] = [
  { score: 0, label: "Ausblenden" },
  { score: 1, label: "Niedrig" },
  { score: 2, label: "Normal" },
  { score: 3, label: "Hoch" },
  { score: 4, label: "Kern" },
];

export function scoreLabel(score: number): string {
  return SCORES.find((option) => option.score === score)?.label ?? "Normal";
}

/* How much more often a card comes up in the games: a score of 0 is never drawn. */
const WEIGHTS: Record<Score, number> = { 0: 0, 1: 1, 2: 2, 3: 4, 4: 8 };

export function weightOf(score: number): number {
  return WEIGHTS[score as Score] ?? WEIGHTS[DEFAULT_SCORE];
}

/* The scores of a player by tool key; a tool that is not listed has the default score. */
export type Scores = ReadonlyMap<string, number>;

export function scoreOf(scores: Scores, toolKey: string): number {
  return scores.get(toolKey) ?? DEFAULT_SCORE;
}
