import { describe, expect, it } from "vitest";
import { levelForTotal, levelProgress, rankForLevel, thresholdForLevel } from "./levels";

describe("thresholdForLevel", () => {
  it("matches the spec formula, rounded to nearest 10", () => {
    expect(thresholdForLevel(1)).toBe(0);
    expect(thresholdForLevel(2)).toBe(100); // 100 × 1^1.5
    expect(thresholdForLevel(3)).toBe(280); // 100 × 2^1.5 ≈ 282.8
    expect(thresholdForLevel(4)).toBe(520); // 100 × 3^1.5 ≈ 519.6
    expect(thresholdForLevel(5)).toBe(800); // 100 × 4^1.5
  });
});

describe("levelForTotal", () => {
  it("finds the highest reached level", () => {
    expect(levelForTotal(0)).toBe(1);
    expect(levelForTotal(99)).toBe(1);
    expect(levelForTotal(100)).toBe(2);
    expect(levelForTotal(279)).toBe(2);
    expect(levelForTotal(280)).toBe(3);
  });
});

describe("rankForLevel", () => {
  it("ascends through the named ranks", () => {
    expect(rankForLevel(1)).toBe("Seedling");
    expect(rankForLevel(3)).toBe("Bud Keeper");
    expect(rankForLevel(6)).toBe("Master Gardener");
  });
  it("goes to numbered prestige past the named ranks", () => {
    expect(rankForLevel(7)).toBe("Master Gardener II");
    expect(rankForLevel(9)).toBe("Master Gardener IV");
  });
});

describe("levelProgress", () => {
  it("reports progress within the current level", () => {
    const p = levelProgress(150);
    expect(p.level).toBe(2);
    expect(p.into).toBe(50); // 150 − 100
    expect(p.span).toBe(180); // 280 − 100
  });
});
