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
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        {/* two upper petals + two lateral sepals, fanned */}
        <ellipse cx="50" cy="34" rx="6" ry="9" fill={ORCHID_LIGHT} />
        <ellipse cx="35" cy="44" rx="9" ry="6" transform="rotate(-18 35 44)" fill={ORCHID} />
        <ellipse cx="65" cy="44" rx="9" ry="6" transform="rotate(18 65 44)" fill={ORCHID} />
        <ellipse cx="41" cy="55" rx="6" ry="8" transform="rotate(-24 41 55)" fill={ORCHID_LIGHT} />
        <ellipse cx="59" cy="55" rx="6" ry="8" transform="rotate(24 59 55)" fill={ORCHID_LIGHT} />
        {/* the labellum — an orchid's signature lower lip */}
        <path d="M50 46 Q42 56 46 66 Q50 70 54 66 Q58 56 50 46 Z" fill={LIP} />
        <circle cx="50" cy="47" r="2.4" fill="var(--marigold)" stroke="none" />
      </g>
    </g>
  );
}
