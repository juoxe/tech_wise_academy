import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  recordResult,
  type RoundGame,
} from "@/features/training/api/training-api";

/* Stores the result of a finished round. Once it is stored, the results are read again, so the
   Statistik tab shows the new round without a reload. A failed save does not stop the game. */
export function useRecordResult() {
  const queryClient = useQueryClient();
  return useCallback(
    (game: RoundGame, difficulty: number, solved: number, total: number) =>
      recordResult(game, difficulty, solved, total)
        .then(() =>
          queryClient.invalidateQueries({ queryKey: ["training", "results"] }),
        )
        .catch(() => undefined),
    [queryClient],
  );
}
