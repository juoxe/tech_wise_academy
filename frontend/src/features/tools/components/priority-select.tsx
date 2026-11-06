import { SCORES, type Score } from "@/features/training";

const FIELD =
  "rounded-md border border-border bg-background px-2 py-1 text-base focus-visible:outline-2 focus-visible:outline-primary";

/* The choice of the importance score: Ausblenden, Niedrig, Normal, Hoch or Kern. */
export function PrioritySelect({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (score: Score) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      // A click on the choice must not open the detail view of the row.
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onChange={(event) => onChange(Number(event.target.value) as Score)}
      className={FIELD}
    >
      {SCORES.map((option) => (
        <option key={option.score} value={option.score}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
