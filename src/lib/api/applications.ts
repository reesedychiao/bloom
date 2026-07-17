import { supabase } from "../supabase";
import type { Application, NewApplication, StageEvent, Status } from "../types";

function client() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

export async function listApplications(): Promise<Application[]> {
  const { data, error } = await client()
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Application[];
}

export async function getApplication(id: string): Promise<Application> {
  const { data, error } = await client()
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Application;
}

export async function listStageEvents(applicationId: string): Promise<StageEvent[]> {
  const { data, error } = await client()
    .from("stage_events")
    .select("*")
    .eq("application_id", applicationId)
    .order("occurred_at", { ascending: true });
  if (error) throw error;
  return data as StageEvent[];
}

export async function createApplication(input: NewApplication): Promise<Application> {
  const { data, error } = await client()
    .from("applications")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Application;
}

/** growth_stage, last_activity_at, and the stage_events row are all
 *  handled by database triggers — the client only sets the status. */
export async function updateStatus(id: string, status: Status): Promise<Application> {
  const { data, error } = await client()
    .from("applications")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Application;
}
