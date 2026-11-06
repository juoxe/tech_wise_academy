import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createTool,
  removeTool,
  updateTool,
  type ToolBody,
} from "@/features/tools/api/tools-api";

/* Every change of a tool reloads all tool data (list and details), so the overview, the games and
   the statistics show the new state at once. */
function useRefreshTools() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["tools"] });
}

/* Creates a tool (`key` is new) or replaces the data of an existing one. */
export function useSaveTool() {
  const refresh = useRefreshTools();
  return useMutation({
    mutationFn: ({
      key,
      body,
      isNew,
    }: {
      key: string;
      body: ToolBody;
      isNew: boolean;
    }) => (isNew ? createTool(key, body) : updateTool(key, body)),
    onSuccess: refresh,
  });
}

/* Deletes a tool; the backend only marks it as deleted (soft delete). */
export function useDeleteTool() {
  const refresh = useRefreshTools();
  return useMutation({
    mutationFn: (key: string) => removeTool(key),
    onSuccess: refresh,
  });
}
