import { Ground, INK, LeafPair, Stem, STROKE } from "./shared";

const PEONY = "var(--petal)";
const PEONY_LIGHT = "color-mix(in srgb, var(--petal) 70%, var(--parchment))";
const PEONY_DEEP = "color-mix(in srgb, var(--petal) 82%, var(--soil))";

export function PeonyBud() {
  return (
    <g>
      <Ground />
      <Stem top={66} sway={3} />
      <LeafPair y={102} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        <circle cx="50" cy="58" r="8.5" fill={PEONY} />
        <path d="M44 62 Q43 55 48 51" fill="none" strokeWidth="1" opacity="0.5" />
        <path d="M56 61 Q57 54 52 51" fill="none" strokeWidth="1" opacity="0.5" />
        <path d="M43 62 Q38 67 39 73 Q45 69 46 64 Z" fill="var(--leaf)" />
        <path d="M57 61 Q62 66 61 73 Q55 68 54 63 Z" fill="var(--leaf)" />
      </g>
    </g>
  );
}

export function PeonyBloom() {
  return (
    <g>
      <Ground />
      <Stem top={60} sway={3} />
      <LeafPair y={104} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        {/* outer ruffle — overlapping round petals, deliberately uneven */}
        <circle cx="39" cy="41" r="7.5" fill={PEONY} />
        <circle cx="50" cy="35" r="8" fill={PEONY} />
        <circle cx="61" cy="41" r="7" fill={PEONY} />
        <circle cx="63" cy="51" r="6.5" fill={PEONY} />
        <circle cx="37" cy="52" r="7" fill={PEONY} />
        <circle cx="45" cy="58" r="6.5" fill={PEONY} />
        <circle cx="56" cy="58" r="6" fill={PEONY} />
        {/* inner ruffle */}
        <circle cx="45" cy="44" r="5.5" fill={PEONY_LIGHT} />
        <circle cx="55" cy="44" r="5" fill={PEONY_LIGHT} />
        <circle cx="50" cy="52" r="5.5" fill={PEONY_LIGHT} />
        {/* furled center */}
        <path d="M46 45 Q48 41 52 42 Q55 44 53 48 Q50 51 47 49 Q45 47 46 45 Z" fill={PEONY_DEEP} />
      </g>
    </g>
  );
}
