import { Ground, INK, LeafPair, Stem, STROKE } from "./shared";

const ROSE = "var(--tint-rose)";
const ROSE_LIGHT = "color-mix(in srgb, var(--tint-rose) 72%, var(--parchment))";
const ROSE_DEEP = "color-mix(in srgb, var(--tint-rose) 78%, var(--soil))";

export function RoseBud() {
  return (
    <g>
      <Ground />
      <Stem top={64} sway={2} />
      <LeafPair y={101} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        <path d="M44 66 Q42 50 50 46 Q58 51 56 66 Q50 71 44 66 Z" fill={ROSE} />
        <path d="M47 62 Q47 52 51 49 Q54 55 52 64" fill="none" strokeWidth="1" opacity="0.5" />
        {/* sepals hugging the bud */}
        <path d="M44 64 Q40 70 41 76 Q46 71 47 66 Z" fill="var(--leaf)" />
        <path d="M56 63 Q61 69 60 76 Q54 70 53 66 Z" fill="var(--leaf)" />
      </g>
    </g>
  );
}

export function RoseBloom() {
  return (
    <g>
      <Ground />
      <Stem top={58} sway={2} />
      <LeafPair y={103} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        {/* outer ring — five uneven scalloped petals */}
        <path
          d="M50 29 C56 26 62 30 63 36 C69 38 70 46 65 51 C66 57 60 61 53 60 C48 63 40 61 38 55 C32 53 31 44 35 40 C34 33 43 28 50 29 Z"
          fill={ROSE}
        />
        {/* petal separations on the outer ring */}
        <path d="M50 30 Q47 35 48 40" fill="none" strokeWidth="1" opacity="0.5" />
        <path d="M62 37 Q56 39 53 42" fill="none" strokeWidth="1" opacity="0.5" />
        <path d="M64 50 Q58 49 55 46" fill="none" strokeWidth="1" opacity="0.5" />
        <path d="M39 54 Q44 50 46 46" fill="none" strokeWidth="1" opacity="0.5" />
        {/* middle layer — three cupped petals */}
        <path d="M50 56 Q41 55 41 46 Q41 39 48 37 Q44 46 50 56 Z" fill={ROSE_LIGHT} />
        <path d="M50 56 Q59 54 59 45 Q58 38 52 37 Q57 46 50 56 Z" fill={ROSE_LIGHT} />
        <path d="M45 40 Q50 34 55 40 Q56 48 50 52 Q44 48 45 40 Z" fill={ROSE_LIGHT} />
        {/* heart of the rose — a small furled whorl */}
        <path d="M46 44 Q47 39 52 40 Q55 42 53 46 Q50 49 47 47 Q45 46 46 44 Z" fill={ROSE_DEEP} />
        <path d="M48 45 Q49 42 52 43" fill="none" strokeWidth="1" opacity="0.6" />
      </g>
    </g>
  );
}
