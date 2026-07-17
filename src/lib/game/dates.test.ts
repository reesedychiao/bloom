import { describe, expect, it } from "vitest";
import { addDays, daysBetween, sameWeek, weekStart } from "./dates";

describe("daysBetween", () => {
  it("counts forward days", () => {
    expect(daysBetween("2026-07-16", "2026-07-17")).toBe(1);
    expect(daysBetween("2026-07-16", "2026-07-16")).toBe(0);
    expect(daysBetween("2026-06-30", "2026-07-02")).toBe(2);
  });
  it("is negative going backwards", () => {
    expect(daysBetween("2026-07-17", "2026-07-16")).toBe(-1);
  });
});

describe("addDays", () => {
  it("crosses month boundaries", () => {
    expect(addDays("2026-07-31", 1)).toBe("2026-08-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("weekStart / sameWeek", () => {
  it("returns the Monday of the week", () => {
    expect(weekStart("2026-07-17")).toBe("2026-07-13"); // Friday → Monday
    expect(weekStart("2026-07-13")).toBe("2026-07-13"); // Monday stays
    expect(weekStart("2026-07-19")).toBe("2026-07-13"); // Sunday belongs to prior Monday
  });
  it("groups days by Monday-based week", () => {
    expect(sameWeek("2026-07-13", "2026-07-19")).toBe(true);
    expect(sameWeek("2026-07-19", "2026-07-20")).toBe(false);
  });
});
