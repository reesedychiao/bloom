/**
 * Achievements — unlock logic only in Phase 2; the pressed-flower wall
 * screen arrives in Phase 4. Badges carry no Sunlight (effort actions and
 * quests are the XP sources); they're keepsakes.
 */

export interface AchievementStats {
  totalApplications: number;
  totalComposted: number; // compost-reason sunlight events
  currentStreak: number;
  everReachedBloom: boolean; // any flower reached bloom (interview booked or offer)
  totalInterviews: number;
  bouquetSize: number; // flowers that have bloomed (growth_stage 3)
}

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  earned: (s: AchievementStats) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: "first_seed",
    title: "First seed",
    description: "Planted your first application.",
    earned: (s) => s.totalApplications >= 1,
  },
  {
    key: "ten_seeds",
    title: "Ten seeds",
    description: "Ten applications in the ground.",
    earned: (s) => s.totalApplications >= 10,
  },
  {
    key: "first_compost",
    title: "First compost",
    description: "Turned a rejection into richer soil.",
    earned: (s) => s.totalComposted >= 1,
  },
  {
    key: "week_streak",
    title: "A week of rain",
    description: "Watered your garden seven days running.",
    earned: (s) => s.currentStreak >= 7,
  },
  {
    key: "first_interview",
    title: "First interview",
    description: "A flower budded — someone wants to talk.",
    earned: (s) => s.totalInterviews >= 1,
  },
  {
    key: "first_bloom",
    title: "First bloom",
    description: "A flower reached full bloom.",
    earned: (s) => s.everReachedBloom,
  },
  {
    key: "full_bouquet_5",
    title: "A full bouquet",
    description: "Five blooms gathered in your vase.",
    earned: (s) => s.bouquetSize >= 5,
  },
];

/** Newly earned achievements, given current stats and already-unlocked keys. */
export function evaluateAchievements(
  stats: AchievementStats,
  unlocked: ReadonlySet<string>,
): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => !unlocked.has(a.key) && a.earned(stats));
}
