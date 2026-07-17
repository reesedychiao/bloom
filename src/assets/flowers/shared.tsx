/**
 * Shared drawing pieces for all flower species.
 * Convention: viewBox 0 0 100 140, ground line ~y126, ink outlines in --soil,
 * fills from the palette only (color-mix for tints). Every shape carries a
 * little asymmetry on purpose — nothing perfectly mirrored.
 */

export const INK = "var(--soil)";
export const STROKE = 1.5;

export function Ground() {
  return (
    <path
      d="M28 127 Q50 118 72 127 Q62 134 50 133 Q38 134 28 127 Z"
      fill="var(--soil)"
      opacity="0.88"
    />
  );
}

/** Stage 0 — a seed tucked into the soil, first shoot just cracking through. */
export function SeedStage() {
  return (
    <g>
      <Ground />
      <ellipse
        cx="50"
        cy="120"
        rx="4.5"
        ry="6"
        transform="rotate(16 50 120)"
        fill="color-mix(in srgb, var(--soil) 42%, var(--marigold))"
        stroke={INK}
        strokeWidth={STROKE}
      />
      <path
        d="M51 112 Q53 106 50 101"
        fill="none"
        stroke="var(--leaf)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Stage 1 — the sprout, shared by every species. */
export function SproutStage() {
  return (
    <g>
      <Ground />
      <path
        d="M50 126 Q49 104 51 86"
        fill="none"
        stroke="var(--leaf)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M51 90 Q30 84 27 64 Q49 66 52 88 Z"
        fill="var(--leaf)"
        stroke={INK}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M51 98 Q68 90 74 74 Q54 74 50 95 Z"
        fill="var(--leaf)"
        stroke={INK}
        strokeWidth={STROKE}
        strokeLinejoin="round"
        opacity="0.92"
      />
    </g>
  );
}

/** A gently curved stem from the ground up to `top`. */
export function Stem({ top, sway = 3 }: { top: number; sway?: number }) {
  const mid = (126 + top) / 2;
  return (
    <path
      d={`M50 126 Q${50 - sway} ${mid} ${50 + sway * 0.4} ${top}`}
      fill="none"
      stroke="var(--leaf)"
      strokeWidth="3"
      strokeLinecap="round"
    />
  );
}

/** Two mid-stem leaves; left one deliberately bigger than right. */
export function LeafPair({ y = 98 }: { y?: number }) {
  return (
    <g fill="var(--leaf)" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
      <path d={`M50 ${y} Q${28} ${y - 4} ${24} ${y - 20} Q${42} ${y - 17} 50 ${y} Z`} />
      <path
        d={`M50 ${y + 8} Q${67} ${y + 5} ${71} ${y - 8} Q${56} ${y - 8} 50 ${y + 8} Z`}
        opacity="0.92"
      />
    </g>
  );
}
