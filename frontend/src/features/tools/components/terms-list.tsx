import { ToolIcon } from "@/features/tools/components/tool-icon";
import type { ToolSummary } from "@/features/tools/api/tools-api";

const COLUMNS = [
  "Icon",
  "Schlüssel",
  "Name",
  "Kategorie",
  "Kurzbeschreibung",
  "Sprache",
] as const;

/* The terms of the Data-Sets tab as a table with all fields of the list endpoint.
   Hints and examples are not part of the list and not shown here. */
export function TermsList({ terms }: { terms: ToolSummary[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-left text-base">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className="px-4 py-2 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {terms.map((term) => (
            <tr key={term.key}>
              <td className="px-4 py-2">
                <ToolIcon icon={term.icon} category={term.category} />
              </td>
              <td className="px-4 py-2 font-mono">{term.key}</td>
              <td className="px-4 py-2 font-medium">{term.name}</td>
              <td className="px-4 py-2">{term.category}</td>
              <td className="px-4 py-2">{term.summary}</td>
              <td className="px-4 py-2">{term.language}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
