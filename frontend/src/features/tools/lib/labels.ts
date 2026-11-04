import type { ToolSummary } from "@/features/tools/api/tools-api";

type Category = ToolSummary["category"];

const LABELS: Record<Category, string> = {
  DEVOPS: "DevOps",
  BACKEND: "Backend",
  FRONTEND: "Frontend",
  SECURITY: "Security",
  AI_DATA: "KI & Daten",
  OBJECT_ORIENTED: "Objektorientiert",
  FUNCTIONAL: "Funktional",
  PROCEDURAL: "Prozedural",
  DECLARATIVE: "Deklarativ",
  MULTI_PARADIGM: "Multiparadigma",
};

/* The readable name of a category or paradigm; the raw code such as OBJECT_ORIENTED is never shown. */
export function categoryLabel(category: Category): string {
  return LABELS[category];
}
