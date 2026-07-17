import { Ground, INK, STROKE } from "./shared";

const ORCHID = "var(--tint-orchid)";
const ORCHID_LIGHT = "color-mix(in srgb, var(--tint-orchid) 62%, var(--parchment))";
const LIP = "color-mix(in srgb, var(--tint-orchid) 82%, var(--soil))";

/** Orchids grow on tall, nearly leafless stems from a low pair of blades. */
function BaseLeaves() {
  return (
    <g fill="var(--leaf)" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
      <path d="M46 126 Q30 118 30 104 Q44 108 49 123 Z" />
      <path d="M54 126 Q69 119 70 106 Q56 110 51 124 Z" opacity="0.9" />
    </g>
  );
}

export function OrchidBud() {
  return (
    <g>
      <Ground />
      <path
        d="M50 126 Q47 92 50 60"
        fill="none"
        stroke="var(--leaf)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <BaseLeaves />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        <path d="M46 60 Q44 48 50 44 Q56 48 54 60 Q50 64 46 60 Z" fill={ORCHID} />
        <path d="M50 46 Q51 54 50 61" fill="none" strokeWidth="1" opacity="0.45" />
      </g>
    </g>
  );
}

export function OrchidBloom() {
  return (
    <g>
      <Ground />
      <path
        d="M50 126 Q47 92 50 56"
        fill="none"
        stroke="var(--leaf)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <BaseLeaves />
      {/* A clean five-petal orchid: two broad upper "wing" petals, a top petal,
          two lower petals, and a distinct contrasting lower lip with a golden
          throat — the touch that reads as orchid without getting busy. */}
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        <ellipse cx="50" cy="28" rx="7" ry="9" fill={ORCHID} />
        <ellipse cx="33" cy="40" rx="11" ry="9" transform="rotate(-14 33 40)" fill={ORCHID} />
        <ellipse cx="67" cy="40" rx="11" ry="9" transform="rotate(14 67 40)" fill={ORCHID} />
        <ellipse cx="40" cy="54" rx="8" ry="9" transform="rotate(-28 40 54)" fill={ORCHID} />
        <ellipse cx="60" cy="54" rx="8" ry="9" transform="rotate(28 60 54)" fill={ORCHID} />
        {/* the lip: lighter, cupped, with a golden throat */}
        <path d="M50 42 C43 42 42 52 47 57 C49 59 51 59 53 57 C58 52 57 42 50 42 Z" fill={ORCHID_LIGHT} />
        <ellipse cx="50" cy="47" rx="3.2" ry="3.8" fill="var(--marigold)" stroke="none" />
        <path d="M50 51 Q48 53 47 56" fill="none" stroke={LIP} strokeWidth="1" opacity="0.7" />
        <path d="M50 51 Q52 53 53 56" fill="none" stroke={LIP} strokeWidth="1" opacity="0.7" />
      </g>
    </g>
  );
}
