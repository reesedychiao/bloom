import { Ground, INK, LeafPair, Stem, STROKE } from "./shared";

const HEAD_FILL = "color-mix(in srgb, var(--soil) 68%, var(--marigold))";

// non-uniform angles keep the head hand-drawn, never a perfect star
const PETAL_ANGLES = [4, 33, 62, 95, 121, 153, 184, 210, 243, 271, 302, 331];

export function SunflowerBud() {
  return (
    <g>
      <Ground />
      <Stem top={62} sway={4} />
      <LeafPair y={100} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        <path d="M44 50 Q46 42 51 41 Q56 43 57 51 L55 54 Q50 50 46 54 Z" fill="var(--marigold)" />
        <path d="M43 64 Q41 52 51 49 Q60 53 58 64 Q51 70 43 64 Z" fill="var(--leaf)" />
        <path d="M47 63 Q46 55 51 52" fill="none" strokeWidth="1" opacity="0.5" />
      </g>
    </g>
  );
}

export function SunflowerBloom() {
  return (
    <g>
      <Ground />
      <Stem top={58} sway={4} />
      <LeafPair y={102} />
      <g stroke={INK} strokeWidth="1.2">
        {PETAL_ANGLES.map((angle) => (
          <ellipse
            key={angle}
            cx="50"
            cy="29"
            rx="4"
            ry="9.5"
            fill="var(--marigold)"
            transform={`rotate(${angle} 50 44)`}
          />
        ))}
      </g>
      <circle cx="50" cy="44" r="10.5" fill={HEAD_FILL} stroke={INK} strokeWidth={STROKE} />
      <g fill="var(--soil)">
        <circle cx="46.5" cy="41.5" r="1.3" />
        <circle cx="53" cy="43" r="1.3" />
        <circle cx="48" cy="47.5" r="1.3" />
        <circle cx="53.5" cy="48.5" r="1.3" />
      </g>
    </g>
  );
}
