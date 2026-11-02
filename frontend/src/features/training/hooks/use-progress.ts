import { useQuery } from "@tanstack/react-query";

import {
  fetchProgress,
  type TrainingGame,
} from "@/features/training/api/training-api";
import { getProfileId } from "@/features/training/lib/profile";

/* The progress is read per player and game; it is refetched when a round is started again. */
export function useProgress(game: TrainingGame) {
  return useQuery({
    queryKey: ["training", "progress", game, getProfileId()],
    queryFn: () => fetchProgress(game),
  });
}
