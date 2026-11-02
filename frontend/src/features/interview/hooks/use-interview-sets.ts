import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createInterviewSet,
  deleteInterviewSet,
  fetchInterviewSet,
  fetchInterviewSets,
} from "@/features/interview/api/interview-api";

const interviewSetsKey = ["interview-sets"] as const;

export function useInterviewSets() {
  return useQuery({
    queryKey: interviewSetsKey,
    queryFn: fetchInterviewSets,
  });
}

/* One set with its cards. Nothing is loaded while the id is undefined. */
export function useInterviewSet(id: string | undefined) {
  return useQuery({
    queryKey: [...interviewSetsKey, id],
    queryFn: () => fetchInterviewSet(id ?? ""),
    enabled: id !== undefined,
  });
}

export function useCreateInterviewSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInterviewSet,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: interviewSetsKey }),
  });
}

export function useDeleteInterviewSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInterviewSet,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: interviewSetsKey }),
  });
}
