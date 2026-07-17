import { supabase } from "../supabase";
import type { Quest } from "../types";
import { localDateString } from "../game/dates";
import { SUNLIGHT_FOR, type SunlightReason } from "../game/sunlight";
import { advanceStreak, FRESH_STREAK, type StreakState } from "../game/streak";
import { actionMatchesQuest, pickDaily, pickWeekly, questWindow, type QuestAction } from "../game/quests";
import { evaluateAchievements, type AchievementDef } from "../game/achievements";
import { levelForTotal, rankForLevel } from "../game/levels";

function client() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

// ---------------------------------------------------------------------------
// reads
// ---------------------------------------------------------------------------

export async function fetchSunlightTotal(): Promise<number> {
  const { data, error } = await client().from("sunlight_events").select("amount");
  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + row.amount, 0);
}

export async function fetchStreak(): Promise<StreakState> {
  const { data, error } = await client().from("streaks").select("*").maybeSingle();
  if (error) throw error;
  return data ?? FRESH_STREAK;
}

export async function fetchUnlockedAchievements(): Promise<Set<string>> {
  const { data, error } = await client().from("achievements").select("key");
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.key as string));
}

/** Today's dailies + this week's weekly, generating them on first open. */
export async function ensureQuests(today = localDateString()): Promise<Quest[]> {
  const c = client();
  const { data: existing, error } = await c
    .from("quests")
    .select("*")
    .gte("expires_on", today)
    .lte("assigned_on", today);
  if (error) throw error;

  const quests = (existing ?? []) as Quest[];
  const toInsert: Omit<Quest, "id" | "progress" | "completed_at">[] = [];

  if (!quests.some((q) => q.kind === "daily")) {
    for (const def of pickDaily(today)) {
      toInsert.push({ ...questWindow(def, today), kind: def.kind, title: def.title, target: def.target, reward: def.reward });
    }
  }
  if (!quests.some((q) => q.kind === "weekly")) {
    const def = pickWeekly(today);
    toInsert.push({ ...questWindow(def, today), kind: def.kind, title: def.title, target: def.target, reward: def.reward });
  }

  if (toInsert.length > 0) {
    const { data: inserted, error: insertError } = await c.from("quests").insert(toInsert).select();
    if (insertError) throw insertError;
    quests.push(...(inserted as Quest[]));
  }
  return quests;
}

// ---------------------------------------------------------------------------
// awardAction — the one entry point for every Sunlight-earning action.
// Sequential writes (ledger → streak → quests → achievements); not atomic,
// but each step is independently retryable and single-user contention is nil.
// ---------------------------------------------------------------------------

export interface AwardInput extends QuestAction {
  /** override for non-table amounts (e.g. ghosted credit) */
  amount?: number;
  refId?: string;
  /** extra ledger line awarded together (e.g. tailored bonus) */
  bonus?: { reason: SunlightReason; amount: number };
}

export interface AwardResult {
  /** ledger lines written, for toasts: [reason, amount] */
  lines: [string, number][];
  freezesSpent: number;
  streakBroke: boolean;
  streak: number;
  completedQuests: Quest[];
  unlocked: AchievementDef[];
  levelUp: { level: number; rank: string } | null;
}

export async function awardAction(input: AwardInput): Promise<AwardResult> {
  const c = client();
  const today = localDateString();
  const totalBefore = await fetchSunlightTotal();

  // 1 — ledger
  const lines: [string, number][] = [];
  const amount = input.amount ?? SUNLIGHT_FOR[input.reason as keyof typeof SUNLIGHT_FOR] ?? 0;
  const rows = [{ reason: input.reason, amount, ref_id: input.refId ?? null, occurred_on: today }];
  lines.push([input.reason, amount]);
  if (input.bonus) {
    rows.push({ reason: input.bonus.reason, amount: input.bonus.amount, ref_id: input.refId ?? null, occurred_on: today });
    lines.push([input.bonus.reason, input.bonus.amount]);
  }
  const { error: ledgerError } = await c.from("sunlight_events").insert(rows);
  if (ledgerError) throw ledgerError;

  // 2 — streak (any earning action waters the garden)
  const prev = await fetchStreak();
  const advance = advanceStreak(prev, today);
  if (advance.changed) {
    const { error: streakError } = await c
      .from("streaks")
      .upsert({ ...advance.state }, { onConflict: "user_id" });
    if (streakError) throw streakError;
  }

  // 3 — quests
  const completedQuests: Quest[] = [];
  const quests = await ensureQuests(today);
  let questSunlight = 0;
  for (const quest of quests) {
    if (quest.completed_at || !actionMatchesQuest(quest.title, input)) continue;
    const progress = quest.progress + 1;
    const done = progress >= quest.target;
    const { error: questError } = await c
      .from("quests")
      .update({ progress, completed_at: done ? new Date().toISOString() : null })
      .eq("id", quest.id);
    if (questError) throw questError;
    if (done) {
      const { error: rewardError } = await c
        .from("sunlight_events")
        .insert({ reason: "quest", amount: quest.reward, ref_id: quest.id, occurred_on: today });
      if (rewardError) throw rewardError;
      questSunlight += quest.reward;
      completedQuests.push({ ...quest, progress, completed_at: new Date().toISOString() });
    }
  }

  // 4 — achievements
  const [{ count: totalApplications }, { count: totalComposted }, { count: blooms }] =
    await Promise.all([
      c.from("applications").select("id", { count: "exact", head: true }),
      c.from("sunlight_events").select("id", { count: "exact", head: true }).eq("reason", "compost"),
      c.from("applications").select("id", { count: "exact", head: true }).in("status", ["offer", "accepted"]),
    ]);
  const unlockedBefore = await fetchUnlockedAchievements();
  const newlyEarned = evaluateAchievements(
    {
      totalApplications: totalApplications ?? 0,
      totalComposted: totalComposted ?? 0,
      currentStreak: advance.state.current_streak,
      everReachedBloom: (blooms ?? 0) > 0,
    },
    unlockedBefore,
  );
  if (newlyEarned.length > 0) {
    const { error: achievementError } = await c
      .from("achievements")
      .insert(newlyEarned.map((a) => ({ key: a.key })));
    if (achievementError) throw achievementError;
  }

  // 5 — level-up detection
  const totalAfter = totalBefore + lines.reduce((s, [, n]) => s + n, 0) + questSunlight;
  const levelAfter = levelForTotal(totalAfter);
  const levelUp =
    levelAfter > levelForTotal(totalBefore)
      ? { level: levelAfter, rank: rankForLevel(levelAfter) }
      : null;

  return {
    lines,
    freezesSpent: advance.freezesSpent,
    streakBroke: advance.broke,
    streak: advance.state.current_streak,
    completedQuests,
    unlocked: newlyEarned,
    levelUp,
  };
}

/** Logging outreach/follow-up also counts as tending the application. */
export async function touchApplication(id: string): Promise<void> {
  const { error } = await client()
    .from("applications")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Attach the composting lesson to the rejection's timeline event. */
export async function annotateLatestStageEvent(applicationId: string, note: string): Promise<void> {
  const c = client();
  const { data, error } = await c
    .from("stage_events")
    .select("id")
    .eq("application_id", applicationId)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  const { error: updateError } = await c.from("stage_events").update({ note }).eq("id", data.id);
  if (updateError) throw updateError;
}
