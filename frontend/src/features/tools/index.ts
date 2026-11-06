// Public interface of the feature `tools` (ADR-0001): other code imports only from here.
export { DataSetsTab } from "@/features/tools/pages/data-sets-tab";
export { ToolIcon } from "@/features/tools/components/tool-icon";
export { ToolOverviewCard } from "@/features/tools/components/tool-overview-card";
export type { ToolDetail, ToolSummary } from "@/features/tools/api/tools-api";
export { useTool } from "@/features/tools/hooks/use-tool";
export { useTools } from "@/features/tools/hooks/use-tools";
export {
  areaWithParadigm,
  categoryLabel,
  paradigmLabel,
  type Paradigm,
} from "@/features/tools/lib/labels";
