import { getJson } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type ToolSummary = components["schemas"]["ToolSummaryOut"];

export function fetchTools(language: "de" = "de"): Promise<ToolSummary[]> {
  return getJson<ToolSummary[]>(`/api/tools?lang=${language}`);
}
