import { useQuery } from "@tanstack/react-query";

import { fetchTool } from "@/features/tools/api/tools-api";

/* The detail of one tool, with its hints. Nothing is loaded while the key is undefined. */
export function useTool(key: string | undefined) {
  return useQuery({
    queryKey: ["tools", "detail", key],
    queryFn: () => fetchTool(key ?? ""),
    enabled: key !== undefined,
  });
}
