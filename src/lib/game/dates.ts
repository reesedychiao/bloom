/**
 * Date helpers for game logic. Everything works on local-time YYYY-MM-DD
 * strings: a "day" for streak purposes is the user's day, not UTC's.
 * Arithmetic is done at UTC noon to dodge DST edge cases.
 */

export function localDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function atNoonUtc(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00Z`);
}

/** Whole days from `a` to `b` (positive when b is later). */
export function daysBetween(a: string, b: string): number {
  return Math.round((atNoonUtc(b).getTime() - atNoonUtc(a).getTime()) / 86_400_000);
}

export function addDays(dateStr: string, n: number): string {
  const d = atNoonUtc(dateStr);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Monday of the week containing dateStr (ISO week start). */
export function weekStart(dateStr: string): string {
  const d = atNoonUtc(dateStr);
  const day = d.getUTCDay(); // 0 Sun … 6 Sat
  const back = day === 0 ? 6 : day - 1;
  return addDays(dateStr, -back);
}

/** True when the two dates fall in the same Monday-based week. */
export function sameWeek(a: string, b: string): boolean {
  return weekStart(a) === weekStart(b);
}
