import { Ground, INK, STROKE } from "./shared";

const PETAL_LIGHT = "color-mix(in srgb, var(--tint-tulip) 78%, var(--parchment))";

/** Tulips get their own long blade leaves from the base instead of LeafPair. */
function BladeLeaves() {
  return (
    <g fill="var(--leaf)" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
      <path d="M46 126 Q28 104 36 76 Q46 96 49 122 Z" />
      <path d="M55 126 Q70 108 66 86 Q57 102 53 124 Z" opacity="0.92" />
    </g>
  );
}

export function TulipBud() {
  return (
    <g>
      <Ground />
      <path
        d="M50 126 Q48 96 50 68"
        fill="none"
        stroke="var(--leaf)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <BladeLeaves />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        <path d="M42 68 Q41 48 50 44 Q59 48 58 67 Q50 74 42 68 Z" fill="var(--tint-tulip)" />
        <path d="M50 45 Q52 56 51 70" fill="none" strokeWidth="1" opacity="0.45" />
      </g>
    </g>
  );
}

export function TulipBloom() {
  return (
    <g>
      <Ground />
      <path
        d="M50 126 Q48 96 50 66"
        fill="none"
        stroke="var(--leaf)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <BladeLeaves />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        <path d="M40 62 Q36 44 43 36 Q49 42 50 60 Q45 66 40 62 Z" fill="var(--tint-tulip)" />
        <path d="M60 61 Q65 46 58 37 Q51 43 50 60 Q55 66 60 61 Z" fill="var(--tint-tulip)" />
        <path d="M43 40 Q49 30 57 39 Q58 56 50 63 Q42 57 43 40 Z" fill={PETAL_LIGHT} />
      </g>
    </g>
  );
}
