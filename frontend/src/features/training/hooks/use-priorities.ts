import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchPriorities,
  resetPriorities,
  setPriorities,
} from "@/features/training/api/training-api";
import { getProfileId } from "@/features/training/lib/profile";
import type { Scores } from "@/features/training/lib/priority";

const QUERY_KEY = ["training", "priorities"] as const;

/* The importance scores of the player as a map (tool key → score). A tool without an entry has no
   score, see `scoreOf`. */
export function usePriorities() {
  const query = useQuery({
    queryKey: [...QUERY_KEY, getProfileId()],
    queryFn: fetchPriorities,
  });
  const scores: Scores = useMemo(
    () => new Map((query.data ?? []).map((e) => [e.tool_key, e.score])),
    [query.data],
  );
  return { scores, isLoading: query.isLoading, error: query.error };
}

/* Gives several tools the same score; afterwards the scores are read again. */
export function useSetPriorities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      toolKeys,
      score,
    }: {
      toolKeys: string[];
      score: number | null;
    }) => setPriorities(toolKeys, score),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

/* Sets all tools back to "not set". */
export function useResetPriorities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetPriorities,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
