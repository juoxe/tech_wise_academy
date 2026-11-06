import { deleteJson, getJson, postJson, putJson } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type ToolSummary = components["schemas"]["ToolSummaryOut"];

export type ToolDetail = components["schemas"]["ToolDetailOut"];

/* All editable data of a tool. The key is only sent when a tool is created. */
export type ToolBody = components["schemas"]["ToolBody"];

export function createTool(key: string, body: ToolBody): Promise<ToolDetail> {
  return postJson<ToolDetail>("/api/tools", { key, ...body });
}

export function updateTool(key: string, body: ToolBody): Promise<ToolDetail> {
  return putJson<ToolDetail>(`/api/tools/${key}`, body);
}

export function removeTool(key: string): Promise<void> {
  return deleteJson(`/api/tools/${key}`);
}

export function fetchTools(language: "de" = "de"): Promise<ToolSummary[]> {
  return getJson<ToolSummary[]>(`/api/tools?lang=${language}`);
}

export function fetchTool(key: string): Promise<ToolDetail> {
  return getJson<ToolDetail>(`/api/tools/${key}?lang=de`);
}
