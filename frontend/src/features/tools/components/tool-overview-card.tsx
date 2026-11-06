import type { ReactNode } from "react";

import { QueryState } from "@/components/shared/query-state";
import { ToolIcon } from "@/features/tools/components/tool-icon";
import { useTool } from "@/features/tools/hooks/use-tool";
import { categoryLabel } from "@/features/tools/lib/labels";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h4 className="text-lg font-semibold">{title}</h4>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1 pl-6 text-base">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/* The overview card of one tool or language, like a Quartett card with what a learner should know:
   overview, use cases, key concepts, when to use it and when not, things worth knowing, an example,
   alternatives and the documentation link. The hints are only shown with showHints (detail view);
   the games do not show them, because they are the answers to the cards. */
export function ToolOverviewCard({
  toolKey,
  showHints = false,
}: {
  toolKey: string;
  showHints?: boolean;
}) {
  const tool = useTool(toolKey);
  const detail = tool.data;
  const content = detail?.content;

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
          className="flex flex-col gap-5 rounded-md border border-border bg-card p-6"
        >
          <header className="flex items-center gap-3">
            <ToolIcon icon={detail.icon} category={detail.category} />
            <div className="flex min-w-0 flex-col">
              <h3 className="break-words text-2xl font-semibold">
                {detail.name}
              </h3>
              <p className="text-base text-muted-foreground">
                {categoryLabel(detail.category)} · Level {detail.level}
              </p>
            </div>
          </header>

          <p className="text-lg font-semibold">{detail.summary}</p>

          {content && (
            <>
              <p className="text-base leading-relaxed">{content.overview}</p>

              <Section title="Wofür man es nutzt">
                <BulletList items={content.use_cases} />
              </Section>

              <Section title="Kernbegriffe">
                <dl className="flex flex-col gap-2 text-base">
                  {content.key_concepts.map((concept) => (
                    <div key={concept.term}>
                      <dt className="font-semibold">{concept.term}</dt>
                      <dd className="text-muted-foreground">
                        {concept.explanation}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Section>

              <div className="grid gap-4 sm:grid-cols-2">
                <Section title="Wann einsetzen">
                  <p className="text-base">{content.when_to_use}</p>
                </Section>
                <Section title="Wann besser nicht">
                  <p className="text-base">{content.when_not_to_use}</p>
                </Section>
              </div>

              <Section title="Gut zu wissen">
                <BulletList items={content.good_to_know} />
              </Section>
            </>
          )}

          {showHints && detail.hints.length > 0 && (
            <Section title="Hinweise">
              <BulletList items={detail.hints} />
            </Section>
          )}

          {detail.examples.length > 0 && (
            <Section title="Beispiel">
              {detail.examples.map((example) => (
                <pre
                  key={example}
                  className="overflow-x-auto rounded-md bg-muted p-3 text-base"
                >
                  <code>{example}</code>
                </pre>
              ))}
            </Section>
          )}

          {detail.alternatives.length > 0 && (
            <Section title="Alternativen">
              <p className="text-base">
                {detail.alternatives
                  .map((alternative) => alternative.name)
                  .join(", ")}
              </p>
            </Section>
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
