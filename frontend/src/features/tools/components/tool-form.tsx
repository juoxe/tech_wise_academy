import { useState, type FormEvent } from "react";

import type {
  ToolBody,
  ToolDetail,
  ToolSummary,
} from "@/features/tools/api/tools-api";
import { useSaveTool } from "@/features/tools/hooks/use-tool-mutations";
import { categoryLabel } from "@/features/tools/lib/labels";

type Category = ToolSummary["category"];

const CATEGORIES: Category[] = [
  "DEVOPS",
  "BACKEND",
  "FRONTEND",
  "SECURITY",
  "AI_DATA",
  "OBJECT_ORIENTED",
  "FUNCTIONAL",
  "PROCEDURAL",
  "DECLARATIVE",
  "MULTI_PARADIGM",
];

const LEVELS = [
  { value: 1, label: "Kennen" },
  { value: 2, label: "Intermediate" },
  { value: 3, label: "Expert" },
];

/* The code examples are separated by a line that holds only three dashes. */
const EXAMPLE_SEPARATOR = /\r?\n---\r?\n/;

const FIELD =
  "rounded-md border border-border bg-background px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-primary";
const BUTTON =
  "rounded-md border border-border px-4 py-2 text-base font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50";
const PRIMARY =
  "rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50";

function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

/* The form to create a tool (no `tool`) or to edit one. The learning content (overview, use cases,
   key concepts) is not edited here; it is sent back unchanged so that saving does not erase it. */
export function ToolForm({
  tool,
  allTools,
  onDone,
}: {
  tool?: ToolDetail;
  allTools: ToolSummary[];
  onDone: (key: string | undefined) => void;
}) {
  const isNew = tool === undefined;
  const save = useSaveTool();
  const [key, setKey] = useState(tool?.key ?? "");
  const [name, setName] = useState(tool?.name ?? "");
  const [category, setCategory] = useState<Category>(
    tool?.category ?? "DEVOPS",
  );
  const [level, setLevel] = useState(tool?.level ?? 1);
  const [documentationUrl, setDocumentationUrl] = useState(
    tool?.documentation_url ?? "",
  );
  const [icon, setIcon] = useState(tool?.icon ?? "");
  const [summary, setSummary] = useState(tool?.summary ?? "");
  const [hints, setHints] = useState((tool?.hints ?? []).join("\n"));
  const [examples, setExamples] = useState(
    (tool?.examples ?? []).join("\n---\n"),
  );
  const [alternatives, setAlternatives] = useState<string[]>(
    (tool?.alternatives ?? []).map((alternative) => alternative.key),
  );
  const [pickedAlternative, setPickedAlternative] = useState("");

  const nameOf = (toolKey: string) =>
    allTools.find((candidate) => candidate.key === toolKey)?.name ?? toolKey;
  const candidates = allTools.filter(
    (candidate) =>
      candidate.key !== key && !alternatives.includes(candidate.key),
  );

  function addAlternative() {
    const match = allTools.find(
      (candidate) =>
        candidate.name.toLowerCase() === pickedAlternative.trim().toLowerCase(),
    );
    if (match !== undefined && !alternatives.includes(match.key)) {
      setAlternatives([...alternatives, match.key]);
      setPickedAlternative("");
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const body: ToolBody = {
      name,
      category,
      level,
      documentation_url: documentationUrl,
      icon: icon.trim() === "" ? null : icon.trim(),
      summary,
      hints: lines(hints),
      examples: examples
        .split(EXAMPLE_SEPARATOR)
        .map((example) => example.trim())
        .filter((example) => example !== ""),
      alternatives,
      content: tool?.content ?? null,
    };
    save.mutate(
      { key: tool?.key ?? key, body, isNew },
      { onSuccess: (saved) => onDone(saved.key) },
    );
  }

  return (
    <form
      onSubmit={submit}
      aria-label={isNew ? "Neues Tool anlegen" : "Tool bearbeiten"}
      className="flex flex-col gap-4 rounded-md border border-border p-4"
    >
      <h2 className="text-xl font-semibold">
        {isNew ? "Neues Tool anlegen" : `${tool.name} bearbeiten`}
      </h2>
      {isNew && (
        <label className="flex flex-col gap-1 text-base">
          Key (z. B. „github-actions“)
          <input
            required
            value={key}
            onChange={(event) => setKey(event.target.value)}
            className={FIELD}
          />
        </label>
      )}
      <label className="flex flex-col gap-1 text-base">
        Name
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={FIELD}
        />
      </label>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-base">
          Bereich
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className={FIELD}
          >
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {categoryLabel(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-base">
          Level
          <select
            value={level}
            onChange={(event) => setLevel(Number(event.target.value))}
            className={FIELD}
          >
            {LEVELS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-base">
          Icon (optional)
          <input
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
            className={FIELD}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-base">
        Link zur Dokumentation
        <input
          required
          type="url"
          value={documentationUrl}
          onChange={(event) => setDocumentationUrl(event.target.value)}
          className={FIELD}
        />
      </label>
      <label className="flex flex-col gap-1 text-base">
        Zusammenfassung (ein Satz)
        <textarea
          required
          rows={2}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          className={FIELD}
        />
      </label>
      <label className="flex flex-col gap-1 text-base">
        Hinweise (einer pro Zeile; sie dürfen den Namen des Tools nicht nennen)
        <textarea
          rows={4}
          value={hints}
          onChange={(event) => setHints(event.target.value)}
          className={FIELD}
        />
      </label>
      <label className="flex flex-col gap-1 text-base">
        Beispiele (getrennt durch eine Zeile mit „---“)
        <textarea
          rows={4}
          value={examples}
          onChange={(event) => setExamples(event.target.value)}
          className={`${FIELD} font-mono`}
        />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-base">Alternativen</legend>
        <ul className="flex flex-wrap gap-2">
          {alternatives.map((alternative) => (
            <li
              key={alternative}
              className="flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-base"
            >
              {nameOf(alternative)}
              <button
                type="button"
                aria-label={`${nameOf(alternative)} entfernen`}
                onClick={() =>
                  setAlternatives(alternatives.filter((k) => k !== alternative))
                }
                className="font-semibold focus-visible:outline-2 focus-visible:outline-primary"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <input
            list="tool-alternatives"
            aria-label="Alternative hinzufügen"
            placeholder="Name des Tools"
            value={pickedAlternative}
            onChange={(event) => setPickedAlternative(event.target.value)}
            className={FIELD}
          />
          <datalist id="tool-alternatives">
            {candidates.map((candidate) => (
              <option key={candidate.key} value={candidate.name} />
            ))}
          </datalist>
          <button type="button" onClick={addAlternative} className={BUTTON}>
            Hinzufügen
          </button>
        </div>
      </fieldset>
      {save.error && (
        <p role="alert" className="text-base text-destructive">
          {save.error.message}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={save.isPending} className={PRIMARY}>
          Speichern
        </button>
        <button
          type="button"
          onClick={() => onDone(tool?.key)}
          className={BUTTON}
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
