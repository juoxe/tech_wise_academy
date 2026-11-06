import {
  DEFAULT_LABEL,
  SCORES,
  scoreLabel,
  type MaybeScore,
  type Score,
} from "@/features/training";

const FIELD =
  "rounded-md border border-border bg-background px-2 py-1 text-base focus-visible:outline-2 focus-visible:outline-primary";

/* The choice of the importance score: Standard, Ausblenden, Niedrig, Normal, Hoch or Kern.
   "Standard" is no own score (null): the default priority of the tool applies. With `defaultScore`
   the choice shows which one, for example "Standard (Hoch)". */
export function PrioritySelect({
  value,
  onChange,
  label,
  defaultScore,
}: {
  value: MaybeScore;
  onChange: (score: MaybeScore) => void;
  label: string;
  defaultScore?: number;
}) {
  return (
    <select
      aria-label={label}
      value={value === null ? "" : value}
      // A click on the choice must not open the detail view of the row.
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onChange={(event) =>
        onChange(
          event.target.value === ""
            ? null
            : (Number(event.target.value) as Score),
        )
      }
      className={FIELD}
    >
      <option value="">
        {defaultScore === undefined
          ? DEFAULT_LABEL
          : `${DEFAULT_LABEL} (${scoreLabel(defaultScore)})`}
      </option>
      {SCORES.map((option) => (
        <option key={option.score} value={option.score}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
