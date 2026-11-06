import {
  deleteJson,
  getJson,
  postJson,
  postNoContent,
  putNoContent,
} from "@/lib/api/client";
import { getProfileId } from "@/features/training/lib/profile";

export type TrainingGame = "level0" | "clearing";

/** The games without saved learning progress; each finished round is stored as one result. */
export type RoundGame = "sql" | "code" | "memory";

/** One stored round: `solved` of `total` (Memory: the pairs found of the moves needed). */
export type RoundResult = {
  solved: number;
  total: number;
  played_at: string;
};

/** The rounds, the best and the latest result of the player in one game and difficulty. */
export type ResultSummary = {
  game: RoundGame;
  difficulty: number;
  rounds: number;
  best: RoundResult;
  last: RoundResult;
};

/** Stores the result of a finished round of SQL-Bausteine, Code beurteilen or Memory. */
export function recordResult(
  game: RoundGame,
  difficulty: number,
  solved: number,
  total: number,
): Promise<void> {
  return postNoContent(
    "/api/training/results",
    { game, difficulty, solved, total },
    { "X-Profile-Id": getProfileId() },
  );
}

/** The result summaries of the current player. */
export function fetchResults(): Promise<ResultSummary[]> {
  return getJson("/api/training/results", {
    "X-Profile-Id": getProfileId(),
  });
}

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

/** Deletes the saved progress of the current player in one game (all sets). */
export function resetProgress(game: TrainingGame): Promise<void> {
  return deleteJson(`/api/training/progress?game=${game}`, {
    "X-Profile-Id": getProfileId(),
  });
}

/** A tool the player has given an importance score (field names as in the API). */
export type PriorityEntry = {
  tool_key: string;
  score: number;
};

/** The scores the current player has set; a tool that is not listed has no score. */
export function fetchPriorities(): Promise<PriorityEntry[]> {
  return getJson("/api/training/priorities", {
    "X-Profile-Id": getProfileId(),
  });
}

/** Gives all the tools the same score; `null` removes their scores (not set). */
export function setPriorities(
  toolKeys: string[],
  score: number | null,
): Promise<void> {
  return putNoContent(
    "/api/training/priorities",
    { tool_keys: toolKeys, score },
    { "X-Profile-Id": getProfileId() },
  );
}

/** Sets every tool of the current player back to "not set". */
export function resetPriorities(): Promise<void> {
  return deleteJson("/api/training/priorities", {
    "X-Profile-Id": getProfileId(),
  });
}
