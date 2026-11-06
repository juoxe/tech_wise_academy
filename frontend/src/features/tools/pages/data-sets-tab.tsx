import { useState } from "react";

import { ToolForm } from "@/features/tools/components/tool-form";
import { ToolOverviewCard } from "@/features/tools/components/tool-overview-card";
import { ToolsTable } from "@/features/tools/components/tools-table";
import { useDeleteTool } from "@/features/tools/hooks/use-tool-mutations";
import { useTool } from "@/features/tools/hooks/use-tool";
import { useTools } from "@/features/tools/hooks/use-tools";

const BUTTON =
  "rounded-md border border-border px-4 py-2 text-base font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50";
const PRIMARY =
  "rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary";
const DANGER =
  "rounded-md border border-destructive px-4 py-2 text-base font-semibold text-destructive hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50";

/* What the area above the table shows: nothing, the detail view of a tool, or a form. */
type View =
  | { kind: "none" }
  | { kind: "detail"; key: string; confirmDelete: boolean }
  | { kind: "create" }
  | { kind: "edit"; key: string };

/* The Toolübersicht: all tools in a table. A click on a row opens the detail view above the table,
   where the tool can be edited or deleted; "Neues Tool" opens the form to create one. */
export function DataSetsTab() {
  const { data, isLoading, error } = useTools();
  const [view, setView] = useState<View>({ kind: "none" });
  const deleteTool = useDeleteTool();
  const editedKey = view.kind === "edit" ? view.key : undefined;
  const edited = useTool(editedKey);
  const selectedKey =
    view.kind === "detail" || view.kind === "edit" ? view.key : undefined;
  const tools = data ?? [];

  function close() {
    deleteTool.reset();
    setView({ kind: "none" });
  }

  return (
    <div className="flex flex-col gap-6">
      {view.kind === "none" && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setView({ kind: "create" })}
            className={PRIMARY}
          >
            Neues Tool
          </button>
        </div>
      )}
      {view.kind === "create" && (
        <ToolForm
          allTools={tools}
          onDone={(key) =>
            setView(
              key === undefined
                ? { kind: "none" }
                : { kind: "detail", key, confirmDelete: false },
            )
          }
        />
      )}
      {view.kind === "edit" && edited.data && (
        <ToolForm
          key={edited.data.key}
          tool={edited.data}
          allTools={tools}
          onDone={(key) =>
            setView(
              key === undefined
                ? { kind: "none" }
                : { kind: "detail", key, confirmDelete: false },
            )
          }
        />
      )}
      {view.kind === "detail" && (
        <section
          aria-label="Details des Werkzeugs"
          className="flex flex-col gap-3"
        >
          {view.confirmDelete ? (
            <div
              role="alertdialog"
              aria-label="Tool löschen"
              className="flex flex-col gap-3 rounded-md border border-destructive p-4"
            >
              <p className="text-base">
                Dieses Tool wirklich löschen? Es verschwindet aus der Übersicht
                und den Spielen. Gespeicherter Fortschritt bleibt erhalten.
              </p>
              {deleteTool.error && (
                <p role="alert" className="text-base text-destructive">
                  Das Löschen hat nicht geklappt.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={deleteTool.isPending}
                  onClick={() =>
                    deleteTool.mutate(view.key, { onSuccess: close })
                  }
                  className={DANGER}
                >
                  Ja, löschen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteTool.reset();
                    setView({ ...view, confirmDelete: false });
                  }}
                  className={BUTTON}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setView({ kind: "edit", key: view.key })}
                className={BUTTON}
              >
                Bearbeiten
              </button>
              <button
                type="button"
                onClick={() => setView({ ...view, confirmDelete: true })}
                className={DANGER}
              >
                Löschen
              </button>
              <button type="button" onClick={close} className={BUTTON}>
                Schließen
              </button>
            </div>
          )}
          <ToolOverviewCard toolKey={view.key} showHints />
        </section>
      )}
      <ToolsTable
        tools={tools}
        isLoading={isLoading}
        error={error}
        selectedKey={selectedKey}
        onSelect={(key) =>
          setView({ kind: "detail", key, confirmDelete: false })
        }
      />
    </div>
  );
}
