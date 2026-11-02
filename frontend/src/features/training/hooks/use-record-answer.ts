import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  recordAnswer,
  type TrainingGame,
} from "@/features/training/api/training-api";

/* Stores one answer. Once it is stored, the saved progress of every game is read again, so the Game
   tab shows the new state without a reload. */
export function useRecordAnswer() {
  const queryClient = useQueryClient();
  return useCallback(
    (game: TrainingGame, toolKey: string, correct: boolean) =>
      recordAnswer(game, toolKey, correct).then(() =>
        queryClient.invalidateQueries({ queryKey: ["training", "progress"] }),
      ),
    [queryClient],
  );
}
