import { getJson } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type ToolSummary = components["schemas"]["ToolSummaryOut"];

export type ToolDetail = components["schemas"]["ToolDetailOut"];

export function fetchTools(language: "de" = "de"): Promise<ToolSummary[]> {
  return getJson<ToolSummary[]>(`/api/tools?lang=${language}`);
}

export function fetchTool(key: string): Promise<ToolDetail> {
  return getJson<ToolDetail>(`/api/tools/${key}?lang=de`);
}
