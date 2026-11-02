import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  resetProgress,
  type TrainingGame,
} from "@/features/training/api/training-api";

/* Deletes the saved progress of one game. Afterwards the progress of every game is read again, so
   the Game tab shows 0 % without a reload. */
export function useResetProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (game: TrainingGame) => resetProgress(game),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["training", "progress"] }),
  });
}
