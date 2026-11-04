import { useState } from "react";

import { ToolOverviewCard } from "@/features/tools/components/tool-overview-card";
import { ToolsTable } from "@/features/tools/components/tools-table";
import { useTools } from "@/features/tools/hooks/use-tools";

const CLOSE_BUTTON =
  "rounded-md border border-border px-4 py-2 text-base font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary";

/* The Toolübersicht: all tools in a table. A click on a row opens the detail view of the tool above
   the table; "Schließen" returns to the plain overview. */
export function DataSetsTab() {
  const { data, isLoading, error } = useTools();
  const [selectedKey, setSelectedKey] = useState<string>();

  return (
    <div className="flex flex-col gap-6">
      {selectedKey !== undefined && (
        <section
          aria-label="Details des Werkzeugs"
          className="flex flex-col gap-3"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedKey(undefined)}
              className={CLOSE_BUTTON}
            >
              Schließen
            </button>
          </div>
          <ToolOverviewCard toolKey={selectedKey} showHints />
        </section>
      )}
      <ToolsTable
        tools={data ?? []}
        isLoading={isLoading}
        error={error}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
      />
    </div>
  );
}
