import { QueryState } from "@/components/shared/query-state";
import { areaLabel } from "@/features/game/lib/drop";
import { ToolIcon, useTool } from "@/features/tools";

/* The overview card of one tool, like a Quartett card with all of its details: area, level, summary,
   hints, example, alternatives and the documentation link. */
export function ToolOverviewCard({ toolKey }: { toolKey: string }) {
  const tool = useTool(toolKey);
  const detail = tool.data;

  return (
    <QueryState
      isLoading={tool.isLoading}
      error={tool.error}
      isEmpty={detail === undefined}
      emptyMessage="Zu diesem Werkzeug gibt es keine Details."
    >
      {detail && (
        <article
          aria-label={detail.name}
          className="flex flex-col gap-4 rounded-md border border-border bg-card p-6"
        >
          <header className="flex items-center gap-3">
            <ToolIcon icon={detail.icon} category={detail.category} />
            <div className="flex min-w-0 flex-col">
              <h3 className="break-words text-2xl font-semibold">
                {detail.name}
              </h3>
              <p className="text-base text-muted-foreground">
                {areaLabel(detail.category)} · Level {detail.level}
              </p>
            </div>
          </header>

          <p className="text-lg">{detail.summary}</p>

          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-semibold">Hinweise</h4>
            <ol className="flex list-decimal flex-col gap-1 pl-6 text-base">
              {detail.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ol>
          </div>

          {detail.examples.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-lg font-semibold">Beispiel</h4>
              {detail.examples.map((example) => (
                <pre
                  key={example}
                  className="overflow-x-auto rounded-md bg-muted p-3 text-sm"
                >
                  <code>{example}</code>
                </pre>
              ))}
            </div>
          )}

          {detail.alternatives.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-lg font-semibold">Alternativen</h4>
              <p className="text-base">
                {detail.alternatives
                  .map((alternative) => alternative.name)
                  .join(", ")}
              </p>
            </div>
          )}

          <a
            href={detail.documentation_url}
            target="_blank"
            rel="noreferrer"
            className="text-base font-semibold text-primary underline underline-offset-4"
          >
            Dokumentation öffnen
          </a>
        </article>
      )}
    </QueryState>
  );
}
