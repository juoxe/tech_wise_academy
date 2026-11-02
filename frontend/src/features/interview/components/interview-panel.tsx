import { useState } from "react";

import {
  useCreateInterviewSet,
  useDeleteInterviewSet,
  useInterviewSet,
  useInterviewSets,
} from "@/features/interview/hooks/use-interview-sets";
import { ToolIcon, type ToolSummary } from "@/features/tools";
import { QueryState } from "@/components/shared/query-state";

const MIN_LENGTH = 50;
const SERVICE_DOWN_STATUS = 503;
const BUTTON =
  "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50";
const BUTTON_QUIET =
  "rounded-md border border-border px-3 py-1 text-base hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring";

function createErrorMessage(error: Error & { status?: number }): string {
  if (error.status === SERVICE_DOWN_STATUS) {
    return "Der lokale Embedding-Dienst ist nicht erreichbar. Läuft der Dienst ollama?";
  }
  return error.message;
}

/* The interview preparation: paste a job advertisement, get a card set, pick a saved set. The set
   that is shown is played in the games below (see docu/game-play.md). */
export function InterviewPanel({
  tools,
  selectedId,
  onSelect,
}: {
  tools: ToolSummary[];
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
}) {
  const [jobAd, setJobAd] = useState("");
  const sets = useInterviewSets();
  const selected = useInterviewSet(selectedId);
  const create = useCreateInterviewSet();
  const remove = useDeleteInterviewSet();
  const byKey = new Map(tools.map((tool) => [tool.key, tool]));

  function generate() {
    create.mutate(jobAd, {
      onSuccess: (created) => {
        setJobAd("");
        onSelect(created.id);
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-md border border-border p-6">
        <h2 className="text-2xl font-semibold">Interview-Vorbereitung</h2>
        <p className="text-base text-muted-foreground">
          Füge eine Stellenanzeige ein. Daraus entsteht ein Kartenset mit den
          Tools, die in der Anzeige stehen oder zu ihr passen. Der Text wird nur
          lokal verarbeitet.
        </p>
        <label htmlFor="job-ad" className="text-base font-semibold">
          Stellenanzeige
        </label>
        <textarea
          id="job-ad"
          rows={10}
          maxLength={20000}
          value={jobAd}
          onChange={(event) => setJobAd(event.target.value)}
          className="w-full rounded-md border border-input bg-background p-3 text-base focus-visible:outline-2 focus-visible:outline-ring"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={create.isPending || jobAd.trim().length < MIN_LENGTH}
            onClick={generate}
            className={BUTTON}
          >
            {create.isPending
              ? "Kartenset wird erzeugt …"
              : "Kartenset erzeugen"}
          </button>
          {create.isPending && (
            <span className="text-base text-muted-foreground">
              Beim ersten Mal kann das einige Minuten dauern.
            </span>
          )}
        </div>
        {create.error && (
          <p role="alert" className="text-base text-destructive">
            {createErrorMessage(create.error)}
          </p>
        )}
      </section>

      {(sets.data ?? []).length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">Deine Interview-Sets</h3>
          <ul className="flex flex-col gap-2">
            {(sets.data ?? []).map((set) => (
              <li
                key={set.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3"
              >
                <button
                  type="button"
                  aria-pressed={set.id === selectedId}
                  onClick={() => onSelect(set.id)}
                  className="flex min-w-0 flex-col text-left focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span
                    className={
                      set.id === selectedId
                        ? "text-base font-semibold text-status-done"
                        : "text-base font-semibold"
                    }
                  >
                    {set.title}
                  </span>
                  <span className="text-base text-muted-foreground">
                    {set.card_count} Karten ·{" "}
                    {new Date(set.created_at).toLocaleDateString("de-DE")}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`${set.title} löschen`}
                  onClick={() =>
                    remove.mutate(set.id, {
                      onSuccess: () => {
                        if (set.id === selectedId) {
                          onSelect(undefined);
                        }
                      },
                    })
                  }
                  className={BUTTON_QUIET}
                >
                  Löschen
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {selectedId !== undefined && (
        <QueryState
          isLoading={selected.isLoading}
          error={selected.error}
          isEmpty={selected.data?.cards.length === 0}
          emptyMessage="In dieser Anzeige wurde kein passendes Tool gefunden."
        >
          <section className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Karten dieses Sets</h3>
            <ul className="flex flex-col gap-2">
              {(selected.data?.cards ?? []).map((card) => {
                const tool = byKey.get(card.tool_key);
                return (
                  <li
                    key={card.tool_key}
                    className="flex items-start gap-3 rounded-md bg-muted p-3"
                  >
                    {tool && (
                      <ToolIcon icon={tool.icon} category={tool.category} />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-base font-semibold">
                          {tool?.name ?? card.tool_key}
                        </span>
                        <span className="text-base text-muted-foreground">
                          {card.mentioned ? "genannt" : "ähnlich"} ·{" "}
                          {Math.round(card.similarity * 100)} %
                        </span>
                      </div>
                      <p className="text-base break-words text-muted-foreground">
                        {card.evidence}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </QueryState>
      )}
    </div>
  );
}
