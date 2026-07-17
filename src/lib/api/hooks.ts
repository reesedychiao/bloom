import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createApplication,
  getApplication,
  listApplications,
  listStageEvents,
  updateStatus,
} from "./applications";
import {
  annotateLatestStageEvent,
  awardAction,
  ensureQuests,
  fetchStreak,
  fetchSunlightTotal,
  touchApplication,
  type AwardResult,
} from "./game";
import {
  completePrepTask,
  createInterview,
  listInterviews,
  setInterviewOutcome,
  type NewInterview,
} from "./interviews";
import { daysBetween, localDateString } from "../game/dates";
import { GHOSTED_CREDIT, SUNLIGHT_FOR } from "../game/sunlight";
import { isTerminal, stageForStatus } from "../game/growth";
import { useUI } from "../../stores/ui";
import type { Application, Interview, NewApplication, PrepTask, Status } from "../types";

export const keys = {
  applications: ["applications"] as const,
  application: (id: string) => ["applications", id] as const,
  stageEvents: (id: string) => ["applications", id, "events"] as const,
  interviews: (appId: string) => ["applications", appId, "interviews"] as const,
  game: ["game"] as const,
  sunlight: ["game", "sunlight"] as const,
  streak: ["game", "streak"] as const,
  quests: ["game", "quests"] as const,
};

// ---------------------------------------------------------------------------
// queries
// ---------------------------------------------------------------------------

export function useApplications() {
  return useQuery({ queryKey: keys.applications, queryFn: listApplications });
}

export function useApplication(id: string) {
  return useQuery({ queryKey: keys.application(id), queryFn: () => getApplication(id) });
}

export function useStageEvents(id: string) {
  return useQuery({ queryKey: keys.stageEvents(id), queryFn: () => listStageEvents(id) });
}

export function useInterviews(appId: string) {
  return useQuery({ queryKey: keys.interviews(appId), queryFn: () => listInterviews(appId) });
}

export function useSunlightTotal() {
  return useQuery({ queryKey: keys.sunlight, queryFn: fetchSunlightTotal });
}

export function useStreak() {
  return useQuery({ queryKey: keys.streak, queryFn: fetchStreak });
}

export function useTodayQuests() {
  return useQuery({ queryKey: keys.quests, queryFn: () => ensureQuests() });
}

// ---------------------------------------------------------------------------
// award plumbing — one place turns AwardResults into toasts + celebrations
// ---------------------------------------------------------------------------

const REASON_COPY: Record<string, string> = {
  planted: "Seed planted",
  tailored_bonus: "Tailored care",
  outreach: "Outreach logged",
  followup: "Follow-up logged",
  stage_advance: "Your flower grew",
  compost: "Composted. Your garden grows richer.",
  prep_task: "Prep done",
  mock: "Mock interview done",
};

function useApplyAward() {
  const queryClient = useQueryClient();
  const pushToast = useUI((s) => s.pushToast);
  const setLevelUp = useUI((s) => s.setLevelUp);

  return (result: AwardResult | null) => {
    if (!result) return;
    for (const [reason, amount] of result.lines) {
      if (amount > 0) pushToast(`+${amount} ☀ ${REASON_COPY[reason] ?? reason}`);
    }
    if (result.freezesSpent > 0) pushToast("Rain covered for you — streak safe 🌧", "notice");
    for (const quest of result.completedQuests) {
      pushToast(`Quest complete: ${quest.title} +${quest.reward} ☀`);
    }
    for (const achievement of result.unlocked) pushToast(`Pressed & framed: ${achievement.title} 🌸`, "notice");
    if (result.levelUp) setLevelUp(result.levelUp);
    queryClient.invalidateQueries({ queryKey: keys.game });
  };
}

function idleDaysOf(app: Application): number {
  return daysBetween(app.last_activity_at.slice(0, 10), localDateString());
}

// ---------------------------------------------------------------------------
// mutations
// ---------------------------------------------------------------------------

/** Plant a seed: create the application, then award (+20, +10 tailored). */
export function usePlantSeed() {
  const queryClient = useQueryClient();
  const applyAward = useApplyAward();
  return useMutation({
    mutationFn: async (input: NewApplication) => {
      const app = await createApplication(input);
      const award = await awardAction({
        reason: "planted",
        refId: app.id,
        isDream: app.is_dream,
        bonus: input.tailored
          ? { reason: "tailored_bonus", amount: SUNLIGHT_FOR.tailored_bonus }
          : undefined,
      });
      return { app, award };
    },
    onSuccess: ({ award }) => {
      queryClient.invalidateQueries({ queryKey: keys.applications });
      applyAward(award);
    },
  });
}

/** Status change; awards stage_advance Sunlight only when the flower grew. */
export function useAdvanceStatus(app: Application) {
  const queryClient = useQueryClient();
  const applyAward = useApplyAward();
  return useMutation({
    mutationFn: async (status: Status) => {
      await updateStatus(app.id, status);
      const grew =
        !isTerminal(status) && stageForStatus(status, app.growth_stage) > app.growth_stage;
      return grew ? awardAction({ reason: "stage_advance", refId: app.id }) : null;
    },
    onSuccess: (award) => {
      queryClient.invalidateQueries({ queryKey: keys.applications });
      applyAward(award);
    },
  });
}

/** Quick-log outreach (+15) or follow-up (+10); tending resets idle time. */
export function useLogTouch(app: Application) {
  const queryClient = useQueryClient();
  const applyAward = useApplyAward();
  return useMutation({
    mutationFn: async (kind: "outreach" | "followup") => {
      const idleDays = idleDaysOf(app);
      await touchApplication(app.id);
      return awardAction({ reason: kind, refId: app.id, idleDays, isDream: app.is_dream });
    },
    onSuccess: (award) => {
      queryClient.invalidateQueries({ queryKey: keys.applications });
      applyAward(award);
    },
  });
}

/** Compost a rejection. The lesson note earns the Sunlight (spec §5.1). */
export function useCompost(app: Application) {
  const queryClient = useQueryClient();
  const applyAward = useApplyAward();
  return useMutation({
    mutationFn: async (lesson: string) => {
      await updateStatus(app.id, "rejected");
      if (!lesson.trim()) return null;
      await annotateLatestStageEvent(app.id, lesson.trim());
      return awardAction({ reason: "compost", refId: app.id });
    },
    onSuccess: (award) => {
      queryClient.invalidateQueries({ queryKey: keys.applications });
      applyAward(award);
    },
  });
}

/** Schedule an interview; prep checklist is generated alongside (spec §6). */
export function useCreateInterview(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewInterview) => createInterview(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.interviews(appId) }),
  });
}

/** Ticking a prep task pays its stored reward through the normal award path. */
export function useCompletePrepTask(app: Application) {
  const queryClient = useQueryClient();
  const applyAward = useApplyAward();
  return useMutation({
    mutationFn: async (task: PrepTask) => {
      await completePrepTask(task.id);
      return awardAction({
        reason: task.kind === "mock" ? "mock" : "prep_task",
        amount: task.sunlight_reward,
        refId: task.id,
        isDream: app.is_dream,
      });
    },
    onSuccess: (award) => {
      queryClient.invalidateQueries({ queryKey: keys.interviews(app.id) });
      applyAward(award);
    },
  });
}

export function useSetInterviewOutcome(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: Interview["outcome"] }) =>
      setInterviewOutcome(id, outcome),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.interviews(appId) }),
  });
}

/** Quietly fold a long-silent lead (21+ days) with a small compost credit. */
export function useMarkGhosted(app: Application) {
  const queryClient = useQueryClient();
  const applyAward = useApplyAward();
  return useMutation({
    mutationFn: async () => {
      await updateStatus(app.id, "ghosted");
      return awardAction({ reason: "compost", amount: GHOSTED_CREDIT, refId: app.id });
    },
    onSuccess: (award) => {
      queryClient.invalidateQueries({ queryKey: keys.applications });
      applyAward(award);
    },
  });
}
