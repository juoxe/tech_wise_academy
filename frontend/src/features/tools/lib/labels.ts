import type { ToolSummary } from "@/features/tools/api/tools-api";

type Category = ToolSummary["category"];

/* The paradigm of a programming language: a feature of the language, not an area of its own. */
export type Paradigm = NonNullable<ToolSummary["paradigm"]>;

const LABELS: Record<Category, string> = {
  DEVOPS: "DevOps",
  BACKEND: "Backend",
  FRONTEND: "Frontend",
  SECURITY: "Security",
  AI_DATA: "KI & Daten",
  LANGUAGE: "Programmiersprachen",
};

const PARADIGM_LABELS: Record<Paradigm, string> = {
  OBJECT_ORIENTED: "Objektorientiert",
  FUNCTIONAL: "Funktional",
  PROCEDURAL: "Prozedural",
  DECLARATIVE: "Deklarativ",
  MULTI_PARADIGM: "Multiparadigma",
};

/* The readable name of a category (area); the raw code such as AI_DATA is never shown. */
export function categoryLabel(category: Category): string {
  return LABELS[category];
}

/* The readable name of a paradigm; the raw code such as OBJECT_ORIENTED is never shown. */
export function paradigmLabel(paradigm: Paradigm): string {
  return PARADIGM_LABELS[paradigm];
}

/* The area of a tool with its paradigm if it is a language, for example "Programmiersprachen ·
   Objektorientiert". */
export function areaWithParadigm(tool: {
  category: Category;
  paradigm?: Paradigm | null;
}): string {
  return tool.paradigm
    ? `${categoryLabel(tool.category)} · ${paradigmLabel(tool.paradigm)}`
    : categoryLabel(tool.category);
}
