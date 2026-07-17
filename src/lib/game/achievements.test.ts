import { describe, expect, it } from "vitest";
import { evaluateAchievements, type AchievementStats } from "./achievements";

const base: AchievementStats = {
  totalApplications: 0,
  totalComposted: 0,
  currentStreak: 0,
  everReachedBloom: false,
  totalInterviews: 0,
  bouquetSize: 0,
};

describe("evaluateAchievements", () => {
  it("unlocks first_seed on the first application", () => {
    const earned = evaluateAchievements({ ...base, totalApplications: 1 }, new Set());
    expect(earned.map((a) => a.key)).toEqual(["first_seed"]);
  });

  it("never re-unlocks", () => {
    const earned = evaluateAchievements(
      { ...base, totalApplications: 12 },
      new Set(["first_seed", "ten_seeds"]),
    );
    expect(earned).toEqual([]);
  });

  it("unlocks several at once when thresholds are crossed together", () => {
    const earned = evaluateAchievements(
      { ...base, totalApplications: 10, currentStreak: 7, totalComposted: 1, everReachedBloom: true },
      new Set(["first_seed"]),
    );
    expect(earned.map((a) => a.key).sort()).toEqual([
      "first_bloom",
      "first_compost",
      "ten_seeds",
      "week_streak",
    ]);
  });

  it("unlocks full_bouquet_5 at five blooms", () => {
    expect(
      evaluateAchievements({ ...base, bouquetSize: 4 }, new Set()).map((a) => a.key),
    ).not.toContain("full_bouquet_5");
    expect(
      evaluateAchievements({ ...base, bouquetSize: 5 }, new Set(["first_seed", "first_bloom"])).map(
        (a) => a.key,
      ),
    ).toContain("full_bouquet_5");
  });

  it("unlocks first_interview on the first scheduled interview", () => {
    const earned = evaluateAchievements(
      { ...base, totalApplications: 1, totalInterviews: 1 },
      new Set(["first_seed"]),
    );
    expect(earned.map((a) => a.key)).toEqual(["first_interview"]);
  });
});
