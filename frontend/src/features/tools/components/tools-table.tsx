import { DataTable, type Column } from "@/components/shared/data-table";
import { ToolIcon } from "@/features/tools/components/tool-icon";
import type { ToolSummary } from "@/features/tools/api/tools-api";
import { categoryLabel } from "@/features/tools/lib/labels";

/* The columns of the Toolübersicht. Hints and examples are not part of the list and not shown here. */
const COLUMNS: readonly Column<ToolSummary>[] = [
  {
    header: "Icon",
    cell: (tool) => <ToolIcon icon={tool.icon} category={tool.category} />,
  },
  {
    header: "Schlüssel",
    cell: (tool) => tool.key,
    className: "font-mono",
  },
  {
    header: "Name",
    cell: (tool) => tool.name,
    className: "font-medium",
  },
  {
    header: "Kategorie",
    cell: (tool) => categoryLabel(tool.category),
  },
  {
    header: "Kurzbeschreibung",
    cell: (tool) => tool.summary,
  },
  {
    header: "Sprache",
    cell: (tool) => tool.language,
  },
];

export function ToolsTable({
  tools,
  isLoading,
  error,
  selectedKey,
  onSelect,
}: {
  tools: ToolSummary[];
  isLoading: boolean;
  error: Error | null;
  selectedKey?: string;
  onSelect: (key: string) => void;
}) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={tools}
      getRowKey={(tool) => tool.key}
      onRowClick={(tool) => onSelect(tool.key)}
      selectedKey={selectedKey}
      isLoading={isLoading}
      error={error}
      emptyMessage="Es sind noch keine Begriffe vorhanden."
    />
  );
}
