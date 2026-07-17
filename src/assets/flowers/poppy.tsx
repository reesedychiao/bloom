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

// broad rounded petal, tip up, base at the flower centre (50,42); rotated
// around the centre to build the open face. Slightly irregular angles keep it
// hand-drawn rather than a perfect pinwheel.
const PETAL = "M50 42 C39 41 33 28 40 19 C45 12 55 12 60 19 C67 28 61 41 50 42 Z";
const PETAL_ANGLES = [2, 71, 145, 217, 290];
const DARK = "color-mix(in srgb, var(--soil) 78%, var(--tint-poppy))";

export function PoppyBloom() {
  return (
    <g>
      <Ground />
      <Stem top={54} sway={5} />
      <LeafPair y={104} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        {/* five broad crepe petals fanned around the centre */}
        {PETAL_ANGLES.map((angle, i) => (
          <path
            key={angle}
            d={PETAL}
            fill={i % 2 === 0 ? POPPY : POPPY_LIGHT}
            transform={`rotate(${angle} 50 42)`}
          />
        ))}
        {/* the poppy's signature dark centre: seed capsule + a halo of stamens */}
        <g fill={DARK} stroke="none">
          {Array.from({ length: 11 }, (_, i) => {
            const a = (i / 11) * Math.PI * 2;
            return <circle key={i} cx={50 + Math.cos(a) * 8.5} cy={42 + Math.sin(a) * 8.5} r="1.2" />;
          })}
        </g>
        <circle cx="50" cy="42" r="5" fill={DARK} />
        <circle cx="50" cy="42" r="5" fill="none" stroke="var(--soil)" strokeWidth="0.8" />
      </g>
    </g>
  );
}
