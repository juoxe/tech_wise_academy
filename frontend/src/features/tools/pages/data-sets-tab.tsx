import { TermsList } from "@/features/tools/components/terms-list";
import { useTools } from "@/features/tools/hooks/use-tools";
import { QueryState } from "@/components/shared/query-state";

export function DataSetsTab() {
  const { data, isLoading, error } = useTools();
  const terms = data ?? [];

  return (
    <QueryState
      isLoading={isLoading}
      error={error}
      isEmpty={terms.length === 0}
      emptyMessage="Es sind noch keine Begriffe vorhanden."
    >
      <TermsList terms={terms} />
    </QueryState>
  );
}
