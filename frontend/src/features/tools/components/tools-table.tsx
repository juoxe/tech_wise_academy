import { DataTable, type Column } from "@/components/shared/data-table";
import { ToolIcon } from "@/features/tools/components/tool-icon";
import type { ToolSummary } from "@/features/tools/api/tools-api";
import { PrioritySelect } from "@/features/tools/components/priority-select";
import { categoryLabel } from "@/features/tools/lib/labels";
import { scoreOf, type Score, type Scores } from "@/features/training";

/* The columns of the Toolübersicht. Hints and examples are not part of the list and not shown here.
   The column Priorität holds the importance score of the player; it can be changed in the row. */
function columnsOf(
  scores: Scores,
  onScore: (key: string, score: Score) => void,
): readonly Column<ToolSummary>[] {
  return [
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
      header: "Priorität",
      cell: (tool) => (
        <PrioritySelect
          label={`Priorität von ${tool.name}`}
          value={scoreOf(scores, tool.key)}
          onChange={(score) => onScore(tool.key, score)}
        />
      ),
    },
    {
      header: "Sprache",
      cell: (tool) => tool.language,
    },
  ];
}

export function ToolsTable({
  tools,
  isLoading,
  error,
  selectedKey,
  onSelect,
  scores,
  onScore,
}: {
  tools: ToolSummary[];
  isLoading: boolean;
  error: Error | null;
  selectedKey?: string;
  onSelect: (key: string) => void;
  scores: Scores;
  onScore: (key: string, score: Score) => void;
}) {
  return (
    <DataTable
      columns={columnsOf(scores, onScore)}
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
