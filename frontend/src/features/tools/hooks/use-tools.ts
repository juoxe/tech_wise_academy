import { useQuery } from "@tanstack/react-query";

import { fetchTools } from "@/features/tools/api/tools-api";

export const toolsQueryKey = ["tools", "de"] as const;

export function useTools() {
  return useQuery({
    queryKey: toolsQueryKey,
    queryFn: () => fetchTools("de"),
  });
}
