import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Application, Status } from "./lib/types";
import { stageForStatus } from "./lib/game/growth";

/**
 * Core-flow smoke test (spec §3): plant → advance stage → bloom, driven
 * through the real components, hooks, router, and growth logic. The data
 * layer is mocked in memory (deterministic, no network) — a Vitest
 * integration test was chosen over Playwright because the app touches many
 * Supabase endpoints that route-interception would have to stub one by one.
 */

// in-memory applications store, shared by the mocked api module
const store: Application[] = [];

function baseApp(over: Partial<Application>): Application {
  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    company: "",
    role: "",
    url: null,
    source: null,
    location: null,
    salary_min: null,
    salary_max: null,
    salary_currency: null,
    species: "sunflower",
    is_dream: false,
    tailored: false,
    status: "planted",
    growth_stage: 0,
    notes: null,
    applied_at: null,
    last_activity_at: new Date().toISOString(),
    ...over,
  };
}

vi.mock("./lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: { user: { id: "u1", email: "r@x.co" } } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => {},
    },
  },
}));

vi.mock("./lib/api/applications", () => ({
  listApplications: async () => [...store].reverse(),
  getApplication: async (id: string) => store.find((a) => a.id === id)!,
  listStageEvents: async () => [],
  createApplication: async (input: Partial<Application>) => {
    const app = baseApp({ ...input, growth_stage: stageForStatus(input.status ?? "planted") });
    store.push(app);
    return app;
  },
  updateStatus: async (id: string, status: Status) => {
    const app = store.find((a) => a.id === id)!;
    app.status = status;
    app.growth_stage = stageForStatus(status, app.growth_stage);
    return app;
  },
}));

const emptyAward = {
  lines: [] as [string, number][],
  freezesSpent: 0,
  streakBroke: false,
  streak: 0,
  completedQuests: [],
  unlocked: [],
  levelUp: null,
};

vi.mock("./lib/api/game", () => ({
  awardAction: async () => emptyAward,
  ensureQuests: async () => [],
  fetchStreak: async () => ({ current_streak: 0, longest_streak: 0, last_active_on: null, freezes_available: 2, freezes_used_this_week: 0 }),
  fetchSunlightTotal: async () => 0,
  fetchUnlockedAchievements: async () => new Set<string>(),
  touchApplication: async () => {},
  annotateLatestStageEvent: async () => {},
}));

vi.mock("./lib/api/interviews", () => ({
  listInterviews: async () => [],
  createInterview: async () => ({ prep_tasks: [] }),
  completePrepTask: async () => ({}),
  setInterviewOutcome: async () => {},
}));

import App from "./App";

describe("core flow: plant → advance → bloom", () => {
  beforeEach(() => {
    store.length = 0;
    window.history.pushState({}, "", "/");
  });
  afterEach(() => vi.clearAllMocks());

  it("plants a seed, then advances it all the way to bloom", async () => {
    const user = userEvent.setup();
    render(<App />);

    // garden loads with the empty state
    expect(await screen.findByText(/your garden is ready/i)).toBeInTheDocument();

    // plant a seed
    await user.click(screen.getByRole("button", { name: /plant a seed/i }));
    const dialog = await screen.findByRole("dialog", { name: /plant a seed/i });
    await user.type(within(dialog).getByLabelText("Company"), "Acme");
    await user.type(within(dialog).getByLabelText("Role"), "Engineer");
    await user.click(within(dialog).getByRole("button", { name: /^plant seed$/i }));

    // the flower appears in the garden (seed stage)
    const flower = await screen.findByRole("button", { name: /acme, engineer/i });
    expect(flower).toBeInTheDocument();

    // open its detail and advance the stage to an offer → full bloom
    await user.click(flower);
    const statusSelect = await screen.findByLabelText("Stage");
    await user.selectOptions(statusSelect, "offer");

    // the detail flower reaches bloom (growth_stage 3)
    await waitFor(() => {
      const stored = store.find((a) => a.company === "Acme");
      expect(stored?.growth_stage).toBe(3);
    });
  });
});
