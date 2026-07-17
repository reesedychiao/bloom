import { describe, expect, it } from "vitest";
import { advanceStreak, FRESH_STREAK, type StreakState } from "./streak";

function state(overrides: Partial<StreakState>): StreakState {
  return { ...FRESH_STREAK, ...overrides };
}

describe("advanceStreak", () => {
  it("starts a streak on first ever activity", () => {
    const r = advanceStreak(FRESH_STREAK, "2026-07-16");
    expect(r.state.current_streak).toBe(1);
    expect(r.state.longest_streak).toBe(1);
    expect(r.changed).toBe(true);
  });

  it("is a no-op for a second action the same day", () => {
    const r = advanceStreak(
      state({ current_streak: 3, longest_streak: 3, last_active_on: "2026-07-16" }),
      "2026-07-16",
    );
    expect(r.changed).toBe(false);
    expect(r.state.current_streak).toBe(3);
  });

  it("increments on consecutive days", () => {
    const r = advanceStreak(
      state({ current_streak: 3, longest_streak: 5, last_active_on: "2026-07-16" }),
      "2026-07-17",
    );
    expect(r.state.current_streak).toBe(4);
    expect(r.state.longest_streak).toBe(5);
    expect(r.freezesSpent).toBe(0);
  });

  it("auto-applies one freeze for a one-day gap", () => {
    const r = advanceStreak(
      state({ current_streak: 10, longest_streak: 10, last_active_on: "2026-07-14" }),
      "2026-07-16",
    );
    expect(r.freezesSpent).toBe(1);
    expect(r.state.current_streak).toBe(11);
    expect(r.state.freezes_available).toBe(1);
    expect(r.state.freezes_used_this_week).toBe(1);
    expect(r.broke).toBe(false);
  });

  it("spends two freezes for a two-day gap", () => {
    const r = advanceStreak(
      state({ current_streak: 10, longest_streak: 10, last_active_on: "2026-07-13" }),
      "2026-07-16",
    );
    expect(r.freezesSpent).toBe(2);
    expect(r.state.current_streak).toBe(11);
    expect(r.state.freezes_available).toBe(0);
  });

  it("breaks the streak when the gap exceeds available freezes", () => {
    const r = advanceStreak(
      state({
        current_streak: 10,
        longest_streak: 10,
        last_active_on: "2026-07-13",
        freezes_available: 1,
      }),
      "2026-07-16", // 2 missed days, 1 freeze
    );
    expect(r.broke).toBe(true);
    expect(r.state.current_streak).toBe(1);
    expect(r.state.longest_streak).toBe(10);
    expect(r.freezesSpent).toBe(0);
  });

  it("replenishes freezes on a new week before judging the gap", () => {
    // last active Friday 2026-07-17 with 0 freezes left; next action Tuesday 2026-07-21
    const r = advanceStreak(
      state({
        current_streak: 6,
        longest_streak: 6,
        last_active_on: "2026-07-17",
        freezes_available: 0,
        freezes_used_this_week: 2,
      }),
      "2026-07-21", // new ISO week → freezes reset to 2; 3 missed days > 2 → breaks anyway
    );
    expect(r.broke).toBe(true);
    expect(r.state.freezes_available).toBe(2);
    expect(r.state.freezes_used_this_week).toBe(0);

    const r2 = advanceStreak(
      state({
        current_streak: 6,
        longest_streak: 6,
        last_active_on: "2026-07-18", // Saturday
        freezes_available: 0,
        freezes_used_this_week: 2,
      }),
      "2026-07-20", // Monday: new week, 1 missed day, fresh freezes cover it
    );
    expect(r2.broke).toBe(false);
    expect(r2.freezesSpent).toBe(1);
    expect(r2.state.current_streak).toBe(7);
  });

  it("never punishes a clock that went backwards", () => {
    const r = advanceStreak(
      state({ current_streak: 4, longest_streak: 4, last_active_on: "2026-07-16" }),
      "2026-07-15",
    );
    expect(r.changed).toBe(false);
    expect(r.state.current_streak).toBe(4);
  });
});
