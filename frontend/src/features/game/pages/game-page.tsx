import { useState } from "react";

import { CardSortBoard } from "@/features/game/components/card-sort-board";
import { useTools } from "@/features/tools/hooks/use-tools";
import { QueryState } from "@/components/shared/query-state";

/* The Game tab: starts Level 1 with all tools as soon as the tab is shown. */
export function GamePage() {
  const { data, isLoading, error } = useTools();
  const [roundNumber, setRoundNumber] = useState(0);
  const tools = data ?? [];

  return (
    <QueryState
      isLoading={isLoading}
      error={error}
      isEmpty={tools.length === 0}
      emptyMessage="Es sind noch keine Begriffe vorhanden."
    >
      <CardSortBoard
        key={roundNumber}
        tools={tools}
        onPlayAgain={() => setRoundNumber((n) => n + 1)}
      />
    </QueryState>
  );
}
