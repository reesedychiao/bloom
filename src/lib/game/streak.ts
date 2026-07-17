import { daysBetween, sameWeek } from "./dates";

/**
 * Watering streak — spec §5.3. Any Sunlight-earning action waters the garden
 * for that day. Missed days consume streak freezes automatically (2 per week,
 * replenished each Monday) before the streak ever breaks: streak loss is the
 * #1 churn moment, so one busy day must never destroy weeks of momentum.
 */

export interface StreakState {
  current_streak: number;
  longest_streak: number;
  last_active_on: string | null;
  freezes_available: number;
  freezes_used_this_week: number;
}

export const FRESH_STREAK: StreakState = {
  current_streak: 0,
  longest_streak: 0,
  last_active_on: null,
  freezes_available: 2,
  freezes_used_this_week: 0,
};

export interface StreakAdvance {
  state: StreakState;
  /** false when today was already counted (no writes needed) */
  changed: boolean;
  freezesSpent: number;
  broke: boolean;
}

export function advanceStreak(prev: StreakState, today: string): StreakAdvance {
  // replenish freezes on week rollover before anything else
  let freezes_available = prev.freezes_available;
  let freezes_used_this_week = prev.freezes_used_this_week;
  if (prev.last_active_on && !sameWeek(prev.last_active_on, today)) {
    freezes_available = 2;
    freezes_used_this_week = 0;
  }

  if (prev.last_active_on === today) {
    return { state: prev, changed: false, freezesSpent: 0, broke: false };
  }

  let current = prev.current_streak;
  let freezesSpent = 0;
  let broke = false;

  if (prev.last_active_on === null) {
    current = 1;
  } else {
    const gap = daysBetween(prev.last_active_on, today);
    if (gap <= 0) {
      // clock went backwards (device change) — count today, never punish
      return { state: prev, changed: false, freezesSpent: 0, broke: false };
    }
    const missed = gap - 1;
    if (missed === 0) {
      current += 1;
    } else if (missed <= freezes_available) {
      freezesSpent = missed;
      freezes_available -= missed;
      freezes_used_this_week += missed;
      current += 1;
    } else {
      current = 1;
      broke = true;
    }
  }

  const state: StreakState = {
    current_streak: current,
    longest_streak: Math.max(prev.longest_streak, current),
    last_active_on: today,
    freezes_available,
    freezes_used_this_week,
  };
  return { state, changed: true, freezesSpent, broke };
}
