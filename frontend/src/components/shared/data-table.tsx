import type { KeyboardEvent, ReactNode } from "react";

import { QueryState } from "@/components/shared/query-state";
import { cn } from "@/lib/utils";

export type Column<Row> = {
  header: string;
  cell: (row: Row) => ReactNode;
  className?: string;
};

type DataTableProps<Row> = {
  columns: readonly Column<Row>[];
  rows: readonly Row[];
  getRowKey: (row: Row) => string;
  /* Makes the rows clickable and keyboard-operable (Enter or Space). */
  onRowClick?: (row: Row) => void;
  selectedKey?: string;
  isLoading: boolean;
  error: Error | null;
  emptyMessage: string;
};

/* A generic overview table (ADR-0001, TWA-9.1): columns and rows are configuration, the page decides
   what a row click does. Loading, error and empty states come from QueryState. */
export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  selectedKey,
  isLoading,
  error,
  emptyMessage,
}: DataTableProps<Row>) {
  return (
    <QueryState
      isLoading={isLoading}
      error={error}
      isEmpty={rows.length === 0}
      emptyMessage={emptyMessage}
    >
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-left text-base">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className={cn("px-4 py-2 font-medium", column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const key = getRowKey(row);
              const selected = key === selectedKey;
              return (
                <tr
                  key={key}
                  data-selected={selected || undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick && (() => onRowClick(row))}
                  onKeyDown={
                    onRowClick &&
                    ((event: KeyboardEvent<HTMLTableRowElement>) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    })
                  }
                  className={cn(
                    onRowClick &&
                      "cursor-pointer hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary",
                    selected && "bg-accent",
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className={cn("px-4 py-2", column.className)}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </QueryState>
  );
}
