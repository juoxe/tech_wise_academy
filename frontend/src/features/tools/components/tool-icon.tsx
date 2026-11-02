import {
  Boxes,
  Brain,
  Container,
  FileText,
  LayoutDashboard,
  ListOrdered,
  Server,
  ShieldCheck,
  Shapes,
  Sigma,
} from "lucide-react";
import type { ComponentType } from "react";

import { LOGOS } from "@/features/tools/lib/logos";
import type { ToolSummary } from "@/features/tools/api/tools-api";

type Category = ToolSummary["category"];

const CATEGORY_ICONS: Readonly<
  Record<Category, ComponentType<{ className?: string }>>
> = {
  DEVOPS: Container,
  BACKEND: Server,
  FRONTEND: LayoutDashboard,
  SECURITY: ShieldCheck,
  AI_DATA: Brain,
  OBJECT_ORIENTED: Boxes,
  FUNCTIONAL: Sigma,
  PROCEDURAL: ListOrdered,
  DECLARATIVE: FileText,
  MULTI_PARADIGM: Shapes,
};

/* Logo of the tool if it has one, otherwise the icon of its category (ADR-0005). */
export function ToolIcon({
  icon,
  category,
}: {
  icon: string | null;
  category: Category;
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
  const CategoryIcon = CATEGORY_ICONS[category];
  return (
    <CategoryIcon
      aria-hidden="true"
      className="size-6 shrink-0 text-muted-foreground"
    />
  );
}
