import { Ground, INK, LeafPair, Stem, STROKE } from "./shared";

/* Pale pink-flushed white; ink outlines keep it readable on parchment. */
const LILY = "color-mix(in srgb, var(--parchment) 72%, var(--petal))";
const LILY_DEEP = "color-mix(in srgb, var(--parchment) 45%, var(--petal))";

export function LilyBud() {
  return (
    <g>
      <Ground />
      <Stem top={62} sway={4} />
      <LeafPair y={103} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        {/* long closed trumpet, tip nodding slightly */}
        <path d="M45 64 Q43 50 49 42 Q51 40 53 43 Q58 52 55 65 Q50 70 45 64 Z" fill={LILY} />
        <path d="M49 44 Q50 54 50 66" fill="none" strokeWidth="1" opacity="0.45" />
      </g>
    </g>
  );
}

export function LilyBloom() {
  return (
    <g>
      <Ground />
      <Stem top={56} sway={4} />
      <LeafPair y={103} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        {/* six pointed petals, slightly irregular star */}
        <path d="M50 46 Q42 34 50 21 Q58 35 50 46 Z" fill={LILY} />
        <path d="M50 46 Q59 36 71 37 Q66 50 50 46 Z" fill={LILY} />
        <path d="M50 46 Q40 37 29 39 Q35 51 50 46 Z" fill={LILY} />
        <path d="M50 46 Q60 51 62 64 Q47 61 50 46 Z" fill={LILY} />
        <path d="M50 46 Q40 52 38 64 Q52 61 50 46 Z" fill={LILY} />
        {/* throat + stamens */}
        <circle cx="50" cy="46" r="3.2" fill={LILY_DEEP} />
        <g fill="none" strokeWidth="1" opacity="0.85">
          <path d="M50 45 Q53 38 57 35" />
          <path d="M50 45 Q49 37 46 33" />
          <path d="M50 46 Q55 44 60 45" />
        </g>
        <g fill="var(--marigold)" stroke="none">
          <ellipse cx="57.5" cy="34.5" rx="1.8" ry="1.1" transform="rotate(-30 57.5 34.5)" />
          <ellipse cx="45.5" cy="32.5" rx="1.8" ry="1.1" transform="rotate(50 45.5 32.5)" />
          <ellipse cx="60.5" cy="45" rx="1.8" ry="1.1" />
        </g>
      </g>
    </g>
  );
}
