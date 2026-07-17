import { addDays, daysBetween } from "./dates";
/**
 * Interview prep engine — spec §6. Given an interview date (local) and kind,
 * generate the checklist working backward from the date. Guarantees:
 * - no task is ever due in the past
 * - <2 days out collapses to a single "crash prep" task due today
 * - 2–4 days out keeps only the tasks whose slot still fits (the later-stage
 *   tasks — practice, mock, logistics — are the highest-value close to the date)
 */

import type { InterviewKind } from "../types";

export type PrepKind = "research" | "jd_mapping" | "practice" | "mock" | "logistics";

export interface PrepTaskDraft {
  due_on: string;
  title: string;
  kind: PrepKind;
  sunlight_reward: number;
}

const PRACTICE_TITLES: Record<InterviewKind, string> = {
  recruiter: "Comp research + your 60-second pitch",
  behavioral: "Write out 3 STAR stories",
  technical: "2 practice problems, timed",
  system_design: "1 system design walkthrough, out loud",
  case: "1 case framework rep",
  onsite: "Dry-run the loop: 1 story, 1 problem, 1 design sketch",
  final: "Re-read your stories + why-them; refresh comp numbers",
};

/** Offset (days before interview) → task. Order matters: T-5 … T-1. */
function sequenceFor(kind: InterviewKind): { offset: number; draft: Omit<PrepTaskDraft, "due_on"> }[] {
  return [
    {
      offset: 5,
      draft: {
        kind: "research",
        title: "Research the company: product, funding, recent news — jot 3 takeaways",
        sunlight_reward: 25,
      },
    },
    {
      offset: 4,
      draft: {
        kind: "jd_mapping",
        title: "Map the job description to your experience (one line per requirement)",
        sunlight_reward: 25,
      },
    },
    { offset: 3, draft: { kind: "practice", title: PRACTICE_TITLES[kind], sunlight_reward: 25 } },
    {
      offset: 2,
      draft: {
        kind: "mock",
        title: "Mock: record yourself answering 3 questions, or grab a friend",
        sunlight_reward: 40, // mock rate per spec §5.1
      },
    },
    {
      offset: 1,
      draft: {
        kind: "logistics",
        title: "Logistics check (link/route, outfit, materials) + write 3 questions to ask them",
        sunlight_reward: 25,
      },
    },
  ];
}

/**
 * @param interviewOn local date (YYYY-MM-DD) of the interview
 * @param today local date; defaults belong to the caller so this stays pure
 */
export function generatePrepTasks(
  interviewOn: string,
  kind: InterviewKind,
  today: string,
): PrepTaskDraft[] {
  const daysOut = daysBetween(today, interviewOn);
  if (daysOut < 0) return [];

  if (daysOut < 2) {
    return [
      {
        due_on: today,
        kind: "practice",
        title: `Crash prep: 3 takeaways about them, ${PRACTICE_TITLES[kind].toLowerCase()}, logistics check`,
        sunlight_reward: 25,
      },
    ];
  }

  return sequenceFor(kind)
    .filter(({ offset }) => offset <= daysOut)
    .map(({ offset, draft }) => ({ ...draft, due_on: addDays(interviewOn, -offset) }))
    .sort((a, b) => (a.due_on < b.due_on ? -1 : 1));
}
