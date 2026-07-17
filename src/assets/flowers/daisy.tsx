import { Ground, INK, LeafPair, Stem, STROKE } from "./shared";

/* Pressed-daisy white: parchment warmed a touch so it reads on the page in
 * daylight (ink outlines do the separating) and stays light in night garden. */
const DAISY_WHITE = "color-mix(in srgb, var(--parchment) 90%, var(--petal))";

const PETAL_ANGLES = [8, 41, 76, 105, 139, 172, 203, 234, 262, 297, 328];

export function DaisyBud() {
  return (
    <g>
      <Ground />
      <Stem top={68} sway={5} />
      <LeafPair y={104} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
        <path d="M45 66 Q45 57 50 55 Q56 58 55 67 Z" fill={DAISY_WHITE} />
        <path d="M44 70 Q43 61 50 58 Q57 62 56 70 Q50 75 44 70 Z" fill="var(--leaf)" />
      </g>
    </g>
  );
}

export function DaisyBloom() {
  return (
    <g>
      <Ground />
      <Stem top={60} sway={5} />
      <LeafPair y={104} />
      <g stroke={INK} strokeWidth="1.1">
        {PETAL_ANGLES.map((angle) => (
          <ellipse
            key={angle}
            cx="50"
            cy="32.5"
            rx="3"
            ry="8.5"
            fill={DAISY_WHITE}
            transform={`rotate(${angle} 50 46)`}
          />
        ))}
      </g>
      <circle cx="50" cy="46" r="6" fill="var(--marigold)" stroke={INK} strokeWidth={STROKE} />
      <circle cx="48" cy="44.5" r="1" fill="var(--soil)" />
    </g>
  );
}
