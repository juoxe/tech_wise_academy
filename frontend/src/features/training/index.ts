// Public interface of the feature `training` (ADR-0001): other code imports only from here.
export {
  fetchPriorities,
  fetchProgress,
  fetchResults,
  recordAnswer,
  recordResult,
  resetPriorities,
  resetProgress,
  setPriorities,
  type PriorityEntry,
  type ProgressEntry,
  type ResultSummary,
  type RoundGame,
  type RoundResult,
  type TrainingGame,
} from "@/features/training/api/training-api";
export { getProfileId } from "@/features/training/lib/profile";
export { useProgress } from "@/features/training/hooks/use-progress";
export { useRecordAnswer } from "@/features/training/hooks/use-record-answer";
export { useRecordResult } from "@/features/training/hooks/use-record-result";
export { useResults } from "@/features/training/hooks/use-results";
export { useResetProgress } from "@/features/training/hooks/use-reset-progress";
export {
  usePriorities,
  useResetPriorities,
  useSetPriorities,
} from "@/features/training/hooks/use-priorities";
export {
  DEFAULT_LABEL,
  SCORES,
  STACK_SCORE,
  effectiveScore,
  inStack,
  isHidden,
  scoreLabel,
  scoreOf,
  weightOf,
  type MaybeScore,
  type PriorityTool,
  type Score,
  type Scores,
} from "@/features/training/lib/priority";
