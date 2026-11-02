import { getJson, postJson } from "@/lib/api/client";
import { getProfileId } from "@/features/training/lib/profile";

export type TrainingGame = "level0" | "clearing";

/** The saved progress of one tool for the current player (field names as in the API). */
export type ProgressEntry = {
  tool_key: string;
  correct_in_a_row: number;
  learned: boolean;
  correct_total: number;
  wrong_total: number;
};

/** Stores one answer of a player for one tool; the backend keeps the counts and the learned state. */
export function recordAnswer(
  game: TrainingGame,
  toolKey: string,
  correct: boolean,
): Promise<unknown> {
  return postJson(
    "/api/training/answers",
    { game, tool_key: toolKey, correct },
    { "X-Profile-Id": getProfileId() },
  );
}

/** The saved progress of the current player in one game. */
export function fetchProgress(game: TrainingGame): Promise<ProgressEntry[]> {
  return getJson(`/api/training/progress?game=${game}`, {
    "X-Profile-Id": getProfileId(),
  });
}
