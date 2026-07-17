import { Ground, INK, Stem, STROKE } from "./shared";

/* Cool porcelain white — a touch of mist so it reads apart from the lily. */
const CALLA = "color-mix(in srgb, var(--parchment) 82%, var(--mist))";
const CALLA_SHADE = "color-mix(in srgb, var(--parchment) 60%, var(--mist))";

/** One broad arrowhead leaf, low and to the side. */
function BroadLeaf() {
  return (
    <path
      d="M54 124 Q72 116 74 96 Q60 98 53 112 Q51 119 54 124 Z"
      fill="var(--leaf)"
      stroke={INK}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
  );
}

export function CallaBud() {
  return (
    <g>
      <Ground />
      <Stem top={64} sway={-3} />
      <BroadLeaf />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        {/* tightly rolled spathe */}
        <path d="M46 66 Q44 50 50 41 Q55 49 53 66 Q50 70 46 66 Z" fill={CALLA} />
        <path d="M50 43 Q52 54 51 67" fill="none" strokeWidth="1" opacity="0.5" />
      </g>
    </g>
  );
}

export function CallaBloom() {
  return (
    <g>
      <Ground />
      <Stem top={62} sway={-3} />
      <BroadLeaf />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        {/* open spathe — asymmetric wrap with a flared lip */}
        <path
          d="M45 64 Q40 48 45 36 Q49 28 57 30 Q64 33 62 44 Q60 56 53 64 Q48 68 45 64 Z"
          fill={CALLA}
        />
        <path d="M46 62 Q44 48 48 38" fill="none" strokeWidth="1" opacity="0.5" />
        {/* inner shadow of the wrap */}
        <path d="M53 62 Q59 52 59 41 Q61 52 54 63 Z" fill={CALLA_SHADE} />
        {/* marigold spadix peeking out */}
        <path d="M49 56 Q48 44 51 37 Q54 44 52 56 Q50.5 58 49 56 Z" fill="var(--marigold)" />
      </g>
    </g>
  );
}
