import {
  Boxes,
  Brain,
  Code,
  Container,
  FileText,
  LayoutDashboard,
  ListOrdered,
  Server,
  ShieldCheck,
  Shapes,
  Sigma,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";

import { LOGOS } from "@/features/tools/lib/logos";
import type { ToolSummary } from "@/features/tools/api/tools-api";
import type { Paradigm } from "@/features/tools/lib/labels";

type Category = ToolSummary["category"];

const CATEGORY_ICONS: Readonly<
  Record<Category, ComponentType<{ className?: string }>>
> = {
  DEVOPS: Container,
  BACKEND: Server,
  FRONTEND: LayoutDashboard,
  SECURITY: ShieldCheck,
  AI_DATA: Brain,
  DEV_ENV: Wrench,
  LANGUAGE: Code,
};

/* A language without a logo shows the icon of its paradigm. */
const PARADIGM_ICONS: Readonly<
  Record<Paradigm, ComponentType<{ className?: string }>>
> = {
  OBJECT_ORIENTED: Boxes,
  FUNCTIONAL: Sigma,
  PROCEDURAL: ListOrdered,
  DECLARATIVE: FileText,
  MULTI_PARADIGM: Shapes,
};

/* Logo of the tool if it has one, otherwise the icon of its paradigm (a language) or its category
   (ADR-0005). */
export function ToolIcon({
  icon,
  category,
  paradigm,
}: {
  icon: string | null;
  category: Category;
  paradigm?: Paradigm | null;
}) {
  const logo = icon ? LOGOS[icon] : undefined;
  if (logo) {
    return (
      <svg
        role="img"
        aria-label={logo.title}
        viewBox="0 0 24 24"
        className="size-6 shrink-0 fill-current text-foreground"
      >
        <path d={logo.path} />
      </svg>
    );
  }
  const CategoryIcon = paradigm
    ? PARADIGM_ICONS[paradigm]
    : CATEGORY_ICONS[category];
  return (
    <CategoryIcon
      aria-hidden="true"
      className="size-6 shrink-0 text-muted-foreground"
    />
  );
}
