import { Ground, INK, LeafPair, Stem, STROKE } from "./shared";

const POPPY = "var(--tint-poppy)";
const POPPY_LIGHT = "color-mix(in srgb, var(--tint-poppy) 78%, var(--parchment))";

export function PoppyBud() {
  return (
    <g>
      <Ground />
      {/* poppies nod before they open — a bud tipped over on a hairy stem */}
      <Stem top={66} sway={6} />
      <LeafPair y={102} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        <ellipse cx="46" cy="60" rx="8" ry="9.5" transform="rotate(-22 46 60)" fill="var(--leaf)" />
        <path d="M40 56 Q44 52 49 54" fill="none" strokeWidth="1" opacity="0.5" />
      </g>
    </g>
  );
}

export function PoppyBloom() {
  return (
    <g>
      <Ground />
      <Stem top={58} sway={5} />
      <LeafPair y={104} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        {/* four broad crepe petals, deliberately uneven */}
        <path d="M50 46 Q30 40 30 28 Q31 18 44 20 Q52 22 50 46 Z" fill={POPPY} />
        <path d="M50 46 Q70 39 71 27 Q70 17 57 20 Q49 23 50 46 Z" fill={POPPY} />
        <path d="M50 44 Q40 30 48 22 Q56 30 50 44 Z" fill={POPPY_LIGHT} />
        <path d="M50 46 Q38 56 40 64 Q50 60 50 46 Z" fill={POPPY} />
        <path d="M50 46 Q62 56 60 64 Q50 60 50 46 Z" fill={POPPY} />
        {/* dark seed capsule + stamen ring */}
        <circle cx="50" cy="44" r="6" fill="color-mix(in srgb, var(--soil) 80%, var(--tint-poppy))" />
        <g stroke="var(--soil)" strokeWidth="1">
          <path d="M50 44 L44 40" />
          <path d="M50 44 L56 40" />
          <path d="M50 44 L46 49" />
          <path d="M50 44 L55 49" />
        </g>
      </g>
    </g>
  );
}
