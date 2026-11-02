import { deleteJson, getJson, postJson } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { getProfileId } from "@/features/training";

export type InterviewSetSummary =
  components["schemas"]["InterviewSetSummaryOut"];

export type InterviewSet = components["schemas"]["InterviewSetOut"];

export type InterviewCard = components["schemas"]["InterviewCardOut"];

function profileHeader() {
  return { "X-Profile-Id": getProfileId() };
}

/* Generates a card set from a job advertisement; the first call also indexes the tools. */
export function createInterviewSet(jobAd: string): Promise<InterviewSet> {
  return postJson("/api/interview-sets", { job_ad: jobAd }, profileHeader());
}

export function fetchInterviewSets(): Promise<InterviewSetSummary[]> {
  return getJson("/api/interview-sets", profileHeader());
}

export function fetchInterviewSet(id: string): Promise<InterviewSet> {
  return getJson(`/api/interview-sets/${id}`, profileHeader());
}

export function deleteInterviewSet(id: string): Promise<void> {
  return deleteJson(`/api/interview-sets/${id}`, profileHeader());
}
