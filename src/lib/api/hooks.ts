import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createApplication,
  getApplication,
  listApplications,
  listStageEvents,
  updateStatus,
} from "./applications";
import type { NewApplication, Status } from "../types";

export const keys = {
  applications: ["applications"] as const,
  application: (id: string) => ["applications", id] as const,
  stageEvents: (id: string) => ["applications", id, "events"] as const,
};

export function useApplications() {
  return useQuery({ queryKey: keys.applications, queryFn: listApplications });
}

export function useApplication(id: string) {
  return useQuery({ queryKey: keys.application(id), queryFn: () => getApplication(id) });
}

export function useStageEvents(id: string) {
  return useQuery({ queryKey: keys.stageEvents(id), queryFn: () => listStageEvents(id) });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewApplication) => createApplication(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.applications }),
  });
}

export function useUpdateStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: Status) => updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.applications }),
  });
}
