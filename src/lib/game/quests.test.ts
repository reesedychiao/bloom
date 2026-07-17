import { describe, expect, it } from "vitest";
import {
  actionMatchesQuest,
  DAILY_POOL,
  pickDaily,
  pickWeekly,
  questWindow,
  WEEKLY_POOL,
} from "./quests";

describe("pickDaily", () => {
  it("returns two distinct quests, deterministic per date", () => {
    const a = pickDaily("2026-07-17");
    const b = pickDaily("2026-07-17");
    expect(a).toEqual(b);
    expect(a).toHaveLength(2);
    expect(a[0].title).not.toBe(a[1].title);
    expect(DAILY_POOL).toEqual(expect.arrayContaining(a));
  });

  it("rotates across dates", () => {
    const seen = new Set(
      ["2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17"].flatMap((d) =>
        pickDaily(d).map((q) => q.title),
      ),
    );
    expect(seen.size).toBeGreaterThan(2);
  });
});

describe("pickWeekly", () => {
  it("is stable within a week", () => {
    expect(pickWeekly("2026-07-14")).toEqual(pickWeekly("2026-07-19"));
    expect(WEEKLY_POOL).toContainEqual(pickWeekly("2026-07-14"));
  });
});

describe("questWindow", () => {
  it("dailies live one day; weeklies span Monday–Sunday", () => {
    const daily = questWindow(DAILY_POOL[0], "2026-07-17");
    expect(daily).toEqual({ assigned_on: "2026-07-17", expires_on: "2026-07-17" });
    const weekly = questWindow(WEEKLY_POOL[0], "2026-07-17");
    expect(weekly).toEqual({ assigned_on: "2026-07-13", expires_on: "2026-07-19" });
  });
});

describe("actionMatchesQuest", () => {
  it("matches planting quests", () => {
    expect(actionMatchesQuest("Plant 1 seed", { reason: "planted" })).toBe(true);
    expect(actionMatchesQuest("Plant 5 seeds", { reason: "planted" })).toBe(true);
    expect(actionMatchesQuest("Plant 1 seed", { reason: "outreach" })).toBe(false);
  });

  it("water-a-wilting-lead needs 7+ idle days", () => {
    expect(actionMatchesQuest("Water a wilting lead", { reason: "followup", idleDays: 8 })).toBe(true);
    expect(actionMatchesQuest("Water a wilting lead", { reason: "outreach", idleDays: 7 })).toBe(true);
    expect(actionMatchesQuest("Water a wilting lead", { reason: "followup", idleDays: 3 })).toBe(false);
    expect(actionMatchesQuest("Water a wilting lead", { reason: "planted" })).toBe(false);
  });

  it("dream outreach requires the dream flag", () => {
    expect(
      actionMatchesQuest("Reach out at 2 dream companies", { reason: "outreach", isDream: true }),
    ).toBe(true);
    expect(
      actionMatchesQuest("Reach out at 2 dream companies", { reason: "outreach", isDream: false }),
    ).toBe(false);
  });
});
