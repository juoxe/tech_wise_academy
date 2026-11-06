import { useQuery } from "@tanstack/react-query";

import { fetchResults } from "@/features/training/api/training-api";
import { getProfileId } from "@/features/training/lib/profile";

/* The stored rounds of the games without saved progress, summed up per game and difficulty. */
export function useResults() {
  return useQuery({
    queryKey: ["training", "results", getProfileId()],
    queryFn: fetchResults,
  });
}
