import { describe, expect, it } from "vitest";
import { generatePrepTasks } from "./prep";

const TODAY = "2026-07-17";

describe("generatePrepTasks", () => {
  it("emits the full T-5…T-1 sequence when 6+ days out", () => {
    const tasks = generatePrepTasks("2026-07-24", "technical", TODAY); // 7 days out
    expect(tasks.map((t) => t.kind)).toEqual([
      "research",
      "jd_mapping",
      "practice",
      "mock",
      "logistics",
    ]);
    expect(tasks.map((t) => t.due_on)).toEqual([
      "2026-07-19",
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
    ]);
  });

  it("emits the full sequence at exactly 5 days out, starting today", () => {
    const tasks = generatePrepTasks("2026-07-22", "behavioral", TODAY);
    expect(tasks).toHaveLength(5);
    expect(tasks[0].due_on).toBe(TODAY);
  });

  it("compresses to fitting slots at 4 and 3 days out", () => {
    const four = generatePrepTasks("2026-07-21", "case", TODAY);
    expect(four.map((t) => t.kind)).toEqual(["jd_mapping", "practice", "mock", "logistics"]);
    expect(four[0].due_on).toBe(TODAY);

    const three = generatePrepTasks("2026-07-20", "case", TODAY);
    expect(three.map((t) => t.kind)).toEqual(["practice", "mock", "logistics"]);
  });

  it("keeps mock + logistics at 2 days out", () => {
    const tasks = generatePrepTasks("2026-07-19", "onsite", TODAY);
    expect(tasks.map((t) => t.kind)).toEqual(["mock", "logistics"]);
    expect(tasks.map((t) => t.due_on)).toEqual([TODAY, "2026-07-18"]);
  });

  it("collapses to a single crash-prep task due today when <2 days out", () => {
    for (const date of ["2026-07-18", "2026-07-17"]) {
      const tasks = generatePrepTasks(date, "technical", TODAY);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].due_on).toBe(TODAY);
      expect(tasks[0].title).toMatch(/^Crash prep/);
    }
  });

  it("returns nothing for interviews in the past", () => {
    expect(generatePrepTasks("2026-07-16", "recruiter", TODAY)).toEqual([]);
  });

  it("never schedules a task before today", () => {
    for (let daysOut = 0; daysOut <= 10; daysOut++) {
      const date = `2026-07-${String(17 + daysOut).padStart(2, "0")}`;
      for (const task of generatePrepTasks(date, "technical", TODAY)) {
        expect(task.due_on >= TODAY).toBe(true);
      }
    }
  });

  it("varies the practice task by interview kind", () => {
    const star = generatePrepTasks("2026-07-24", "behavioral", TODAY).find(
      (t) => t.kind === "practice",
    );
    const problems = generatePrepTasks("2026-07-24", "technical", TODAY).find(
      (t) => t.kind === "practice",
    );
    expect(star!.title).toMatch(/STAR/);
    expect(problems!.title).toMatch(/practice problems/);
  });

  it("pays the mock task at the mock rate", () => {
    const tasks = generatePrepTasks("2026-07-24", "technical", TODAY);
    expect(tasks.find((t) => t.kind === "mock")!.sunlight_reward).toBe(40);
    expect(tasks.find((t) => t.kind === "research")!.sunlight_reward).toBe(25);
  });
});
