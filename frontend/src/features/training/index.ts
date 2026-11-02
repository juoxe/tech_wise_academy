// Public interface of the feature `training` (ADR-0001): other code imports only from here.
export {
  fetchProgress,
  recordAnswer,
  type ProgressEntry,
  type TrainingGame,
} from "@/features/training/api/training-api";
export { getProfileId } from "@/features/training/lib/profile";
export { useProgress } from "@/features/training/hooks/use-progress";
export { useRecordAnswer } from "@/features/training/hooks/use-record-answer";
