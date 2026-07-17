import { Ground, INK } from "./shared";

const LAV = "var(--tint-lavender)";
const LAV_LIGHT = "color-mix(in srgb, var(--tint-lavender) 74%, var(--parchment))";

/** One flowering spike: staggered florets climbing a thin stem. */
function Spike({
  x,
  top,
  bottom,
  florets,
  sway = 0,
}: {
  x: number;
  top: number;
  bottom: number;
  florets: number;
  sway?: number;
}) {
  const step = (bottom - top) / florets;
  return (
    <g>
      <path
        d={`M${x} 126 Q${x + sway} ${(126 + top) / 2} ${x} ${top}`}
        fill="none"
        stroke="var(--leaf)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {Array.from({ length: florets }, (_, i) => {
        const y = bottom - i * step;
        const side = i % 2 === 0 ? -2.6 : 2.4;
        return (
          <ellipse
            key={i}
            cx={x + side}
            cy={y}
            rx="2.6"
            ry="3.4"
            transform={`rotate(${side * 6} ${x + side} ${y})`}
            fill={i % 3 === 2 ? LAV_LIGHT : LAV}
            stroke={INK}
            strokeWidth="0.9"
          />
        );
      })}
      <ellipse cx={x} cy={top - 2} rx="2.4" ry="3.2" fill={LAV} stroke={INK} strokeWidth="0.9" />
    </g>
  );
}

/** Thin blade leaves low on the plant. */
function ThinLeaves() {
  return (
    <g fill="var(--leaf)" stroke={INK} strokeWidth="1.2" strokeLinejoin="round">
      <path d="M48 122 Q36 112 34 100 Q44 106 50 118 Z" />
      <path d="M53 123 Q64 114 65 103 Q56 109 51 120 Z" opacity="0.9" />
    </g>
  );
}

export function LavenderBud() {
  return (
    <g>
      <Ground />
      <ThinLeaves />
      <Spike x={50} top={72} bottom={84} florets={3} sway={-3} />
    </g>
  );
}

export function LavenderBloom() {
  return (
    <g>
      <Ground />
      <ThinLeaves />
      <Spike x={38} top={64} bottom={86} florets={5} sway={-4} />
      <Spike x={50} top={40} bottom={74} florets={8} sway={-2} />
      <Spike x={62} top={58} bottom={82} florets={6} sway={4} />
    </g>
  );
}
