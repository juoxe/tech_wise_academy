import { useState } from "react";

import { PrioritySelect } from "@/features/tools/components/priority-select";
import { categoryLabel } from "@/features/tools/lib/labels";
import type { ToolSummary } from "@/features/tools/api/tools-api";
import {
  DEFAULT_LABEL,
  SCORES,
  type MaybeScore,
  type Score,
} from "@/features/training";

type Category = ToolSummary["category"];

export type PriorityFilter = {
  score: "all" | "unset" | Score;
  category: "all" | Category;
  sortBy: "name" | "score";
};

const CATEGORIES: Category[] = [
  "DEVOPS",
  "BACKEND",
  "FRONTEND",
  "SECURITY",
  "AI_DATA",
  "DEV_ENV",
  "LANGUAGE",
];

const FIELD =
  "rounded-md border border-border bg-background px-2 py-1 text-base focus-visible:outline-2 focus-visible:outline-primary";
const BUTTON =
  "rounded-md border border-border px-4 py-2 text-base font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50";
const DANGER =
  "rounded-md border border-destructive px-4 py-2 text-base font-semibold text-destructive hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50";

/* Filter, sort and set the importance scores of many tools at once: filter by area (or by score),
   then give all shown tools the same score. This sets up a tech stack quickly. */
export function PriorityToolbar({
  filter,
  onFilter,
  shownCount,
  busy,
  onSetShown,
  onReset,
}: {
  filter: PriorityFilter;
  onFilter: (filter: PriorityFilter) => void;
  shownCount: number;
  busy: boolean;
  onSetShown: (score: MaybeScore) => void;
  onReset: () => void;
}) {
  const [bulk, setBulk] = useState<MaybeScore>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <section
      aria-label="Prioritäten"
      className="flex flex-col gap-3 rounded-md border border-border p-4"
    >
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-base">
          Bereich
          <select
            value={filter.category}
            onChange={(event) =>
              onFilter({
                ...filter,
                category: event.target.value as PriorityFilter["category"],
              })
            }
            className={FIELD}
          >
            <option value="all">Alle</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {categoryLabel(category)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-base">
          Priorität
          <select
            value={filter.score}
            onChange={(event) =>
              onFilter({
                ...filter,
                score:
                  event.target.value === "all" || event.target.value === "unset"
                    ? event.target.value
                    : (Number(event.target.value) as Score),
              })
            }
            className={FIELD}
          >
            <option value="all">Alle</option>
            <option value="unset">{DEFAULT_LABEL} (nicht geändert)</option>
            {SCORES.map((option) => (
              <option key={option.score} value={option.score}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-base">
          Sortieren nach
          <select
            value={filter.sortBy}
            onChange={(event) =>
              onFilter({
                ...filter,
                sortBy: event.target.value as PriorityFilter["sortBy"],
              })
            }
            className={FIELD}
          >
            <option value="name">Name</option>
            <option value="score">Priorität</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-base">
          {shownCount} angezeigte Tools setzen auf
        </span>
        <PrioritySelect
          label="Priorität für alle angezeigten Tools"
          value={bulk}
          onChange={setBulk}
        />
        <button
          type="button"
          disabled={busy || shownCount === 0}
          onClick={() => onSetShown(bulk)}
          className={BUTTON}
        >
          Setzen
        </button>
      </div>
      {confirmReset ? (
        <div
          role="alertdialog"
          aria-label="Auf Standard zurücksetzen"
          className="flex flex-col gap-3 rounded-md border border-destructive p-4"
        >
          <p className="text-base">
            Alle eigenen Prioritäten wirklich auf „{DEFAULT_LABEL}“
            zurücksetzen? Das lässt sich nicht rückgängig machen.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onReset();
                setConfirmReset(false);
              }}
              className={DANGER}
            >
              Ja, zurücksetzen
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className={BUTTON}
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className={BUTTON}
          >
            Auf Standard zurücksetzen
          </button>
        </div>
      )}
    </section>
  );
}
