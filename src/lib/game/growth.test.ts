import { describe, expect, it } from "vitest";
import { isTerminal, stageForStatus, TERMINAL_STATUSES } from "./growth";
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

describe("isTerminal", () => {
  it("flags only rejected, withdrawn, and ghosted", () => {
    const terminal = STATUSES.filter(isTerminal);
    expect(terminal).toEqual(["rejected", "withdrawn", "ghosted"]);
  });
});
