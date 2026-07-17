import { supabase } from "../supabase";
import { generatePrepTasks } from "../game/prep";
import { localDateString } from "../game/dates";
import type { Interview, InterviewKind, InterviewWithPrep, PrepTask } from "../types";

function client() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

export async function listInterviews(applicationId: string): Promise<InterviewWithPrep[]> {
  const { data, error } = await client()
    .from("interviews")
    .select("*, prep_tasks(*)")
    .eq("application_id", applicationId)
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return (data as InterviewWithPrep[]).map((interview) => ({
    ...interview,
    prep_tasks: [...interview.prep_tasks].sort((a, b) => (a.due_on < b.due_on ? -1 : 1)),
  }));
}

export interface NewInterview {
  application_id: string;
  scheduled_at: string; // ISO timestamp
  kind: InterviewKind;
  location_or_link?: string;
}

/** Create the interview and its auto-generated prep checklist (spec §6). */
export async function createInterview(input: NewInterview): Promise<InterviewWithPrep> {
  const c = client();
  const { data: interview, error } = await c
    .from("interviews")
    .insert(input)
    .select()
    .single();
  if (error) throw error;

  const drafts = generatePrepTasks(
    localDateString(new Date(input.scheduled_at)),
    input.kind,
    localDateString(),
  );
  let prep_tasks: PrepTask[] = [];
  if (drafts.length > 0) {
    const { data: tasks, error: prepError } = await c
      .from("prep_tasks")
      .insert(drafts.map((d) => ({ ...d, interview_id: (interview as Interview).id })))
      .select();
    if (prepError) throw prepError;
    prep_tasks = tasks as PrepTask[];
  }
  return { ...(interview as Interview), prep_tasks };
}

export async function completePrepTask(id: string): Promise<PrepTask> {
  const { data, error } = await client()
    .from("prep_tasks")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PrepTask;
}

export async function setInterviewOutcome(
  id: string,
  outcome: Interview["outcome"],
): Promise<void> {
  const { error } = await client().from("interviews").update({ outcome }).eq("id", id);
  if (error) throw error;
}
