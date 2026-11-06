import { cn } from "@/lib/utils";

/* The colour of a bar from its percentage, in steps of 20 %: red, orange, yellow, light green and
   dark green (the roles progress-1 to progress-5 in globals.css). The class names are written out so
   that Tailwind finds them. */
const STEP_CLASSES = [
  "bg-progress-1",
  "bg-progress-2",
  "bg-progress-3",
  "bg-progress-4",
  "bg-progress-5",
] as const;

/* 0 to 19 % is step 1, 20 to 39 % step 2, and so on; 100 % belongs to the last step. */
function progressStep(percent: number): number {
  return Math.min(4, Math.max(0, Math.floor(percent / 20)));
}

/* A progress bar with the colour of its step. `percent` is 0 to 100. */
export function ProgressBar({
  percent,
  label,
  valueNow = percent,
  valueMax = 100,
  className,
}: {
  percent: number;
  label: string;
  valueNow?: number;
  valueMax?: number;
  className?: string;
}) {
  const width = Math.min(100, Math.max(0, percent));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={valueMax}
      aria-valuenow={valueNow}
      className={cn(
        "h-3 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      <div
        className={cn(
          "h-full transition-all",
          STEP_CLASSES[progressStep(percent)],
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
