import { describe, expect, it } from "vitest";
import { isTerminal, stageForApplication, stageForStatus, TERMINAL_STATUSES } from "./growth";
import { STATUSES } from "../types";

describe("stageForStatus", () => {
  it("maps active pipeline statuses to their growth stage", () => {
    expect(stageForStatus("planted")).toBe(0);
    expect(stageForStatus("outreach")).toBe(0);
    expect(stageForStatus("screening")).toBe(1);
    expect(stageForStatus("interviewing")).toBe(2);
    expect(stageForStatus("offer")).toBe(3);
    expect(stageForStatus("accepted")).toBe(3);
  });

  it("keeps the previous stage for terminal statuses (the flower wilts as-is)", () => {
    for (const status of TERMINAL_STATUSES) {
      expect(stageForStatus(status, 2)).toBe(2);
      expect(stageForStatus(status, 0)).toBe(0);
    }
  });

  it("resolves every status to a stage, defaulting previous stage to seed", () => {
    for (const status of STATUSES) {
      const stage = stageForStatus(status);
      expect(stage).toBeGreaterThanOrEqual(0);
      expect(stage).toBeLessThanOrEqual(3);
    }
  });
});

describe("stageForApplication", () => {
  it("follows status when there's no interview", () => {
    expect(stageForApplication("planted", false)).toBe(0);
    expect(stageForApplication("screening", false)).toBe(1);
    expect(stageForApplication("interviewing", false)).toBe(2);
  });

  it("blooms as soon as an interview is scheduled, whatever the status", () => {
    expect(stageForApplication("screening", true)).toBe(3);
    expect(stageForApplication("planted", true)).toBe(3);
    expect(stageForApplication("interviewing", true)).toBe(3);
  });

  it("keeps bloom (3) for a rejected flower that had bloomed — stays in the bouquet", () => {
    expect(stageForApplication("rejected", true, 3)).toBe(3);
  });

  it("keeps a rejected bud at bud — never enters the bouquet", () => {
    expect(stageForApplication("rejected", false, 2)).toBe(2);
  });

  it("offer/accepted bloom without an interview too", () => {
    expect(stageForApplication("offer", false)).toBe(3);
    expect(stageForApplication("accepted", false)).toBe(3);
  });
});

describe("isTerminal", () => {
  it("flags only rejected, withdrawn, and ghosted", () => {
    const terminal = STATUSES.filter(isTerminal);
    expect(terminal).toEqual(["rejected", "withdrawn", "ghosted"]);
  });
});
