import { useState } from "react";

import { ToolForm } from "@/features/tools/components/tool-form";
import { ToolOverviewCard } from "@/features/tools/components/tool-overview-card";
import {
  PriorityToolbar,
  type PriorityFilter,
} from "@/features/tools/components/priority-toolbar";
import { ToolsTable } from "@/features/tools/components/tools-table";
import { useDeleteTool } from "@/features/tools/hooks/use-tool-mutations";
import { useTool } from "@/features/tools/hooks/use-tool";
import { useTools } from "@/features/tools/hooks/use-tools";
import {
  effectiveScore,
  scoreOf,
  usePriorities,
  useResetPriorities,
  useSetPriorities,
} from "@/features/training";

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
  const { scores } = usePriorities();
  const setPriorities = useSetPriorities();
  const resetPriorities = useResetPriorities();
  const [filter, setFilter] = useState<PriorityFilter>({
    score: "all",
    category: "all",
    sortBy: "name",
  });
  const tools = data ?? [];
  /* The tools that are shown: filtered by area and score, sorted by name or by score (highest first). */
  const shown = tools
    .filter(
      (tool) =>
        (filter.category === "all" || tool.category === filter.category) &&
        (filter.score === "all" ||
          (filter.score === "unset"
            ? scoreOf(scores, tool.key) === null
            : effectiveScore(scores, tool) === filter.score)),
    )
    .sort(
      filter.sortBy === "score"
        ? (a, b) =>
            effectiveScore(scores, b) - effectiveScore(scores, a) ||
            a.name.localeCompare(b.name, "de")
        : () => 0,
    );

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
          <ToolOverviewCard toolKey={view.key} showHints showPriority />
        </section>
      )}
      <PriorityToolbar
        filter={filter}
        onFilter={setFilter}
        shownCount={shown.length}
        busy={setPriorities.isPending || resetPriorities.isPending}
        onSetShown={(score) =>
          setPriorities.mutate({
            toolKeys: shown.map((tool) => tool.key),
            score,
          })
        }
        onReset={() => resetPriorities.mutate()}
      />
      <ToolsTable
        tools={shown}
        scores={scores}
        onScore={(key, score) =>
          setPriorities.mutate({ toolKeys: [key], score })
        }
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
