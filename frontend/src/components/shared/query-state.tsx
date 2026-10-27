import type { ReactNode } from "react";

/* Loading, error and empty states of a list, in one place (ADR-0001, rule 9). */
export function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyMessage,
  children,
}: {
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
}) {
  if (isLoading) {
    return (
      <p className="text-base text-muted-foreground">
        Die Begriffe werden geladen …
      </p>
    );
  }
  if (error) {
    return (
      <p role="alert" className="text-base text-destructive">
        {error.message}
      </p>
    );
  }
  if (isEmpty) {
    return <p className="text-base text-muted-foreground">{emptyMessage}</p>;
  }
  return <>{children}</>;
}
