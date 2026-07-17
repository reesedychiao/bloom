/**
 * Gardener ranks — spec §5.2.
 * You start at level 1 with 0 Sunlight; reaching level L (for L ≥ 2) takes a
 * cumulative 100 × (L−1)^1.5 Sunlight, rounded to the nearest 10 — fast early
 * levels, slowing gently.
 */

const RANKS = [
  "Seedling",
  "Sprout Tender",
  "Bud Keeper",
  "Bloom Whisperer",
  "Bouquet Artisan",
  "Master Gardener",
] as const;

/** Cumulative Sunlight required to reach `level`. */
export function thresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round((100 * Math.pow(level - 1, 1.5)) / 10) * 10;
}

export function levelForTotal(total: number): number {
  let level = 1;
  while (thresholdForLevel(level + 1) <= total) level++;
  return level;
}

/** Level 7+ becomes numbered Master Gardener prestige (II, III, …). */
export function rankForLevel(level: number): string {
  if (level <= RANKS.length) return RANKS[level - 1];
  return `${RANKS[RANKS.length - 1]} ${toRoman(level - RANKS.length + 1)}`;
}

export interface LevelProgress {
  level: number;
  rank: string;
  /** Sunlight earned within the current level. */
  into: number;
  /** Sunlight span of the current level. */
  span: number;
}

export function levelProgress(total: number): LevelProgress {
  const level = levelForTotal(total);
  const floor = thresholdForLevel(level);
  const ceiling = thresholdForLevel(level + 1);
  return { level, rank: rankForLevel(level), into: total - floor, span: ceiling - floor };
}

function toRoman(n: number): string {
  const table: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  for (const [value, glyph] of table) {
    while (n >= value) {
      out += glyph;
      n -= value;
    }
  }
  return out;
}
