import type { ComponentType } from "react";
import type { GrowthStage, Species } from "../../lib/types";
import { SeedStage, SproutStage } from "./shared";
import { SunflowerBud, SunflowerBloom } from "./sunflower";
import { TulipBud, TulipBloom } from "./tulip";
import { RoseBud, RoseBloom } from "./rose";
import { DaisyBud, DaisyBloom } from "./daisy";
import { LavenderBud, LavenderBloom } from "./lavender";
import { PeonyBud, PeonyBloom } from "./peony";
import { LilyBud, LilyBloom } from "./lily";
import { CallaBud, CallaBloom } from "./calla";

const ART: Partial<Record<Species, { Bud: ComponentType; Bloom: ComponentType }>> = {
  sunflower: { Bud: SunflowerBud, Bloom: SunflowerBloom },
  tulip: { Bud: TulipBud, Bloom: TulipBloom },
  rose: { Bud: RoseBud, Bloom: RoseBloom },
  daisy: { Bud: DaisyBud, Bloom: DaisyBloom },
  lavender: { Bud: LavenderBud, Bloom: LavenderBloom },
  peony: { Bud: PeonyBud, Bloom: PeonyBloom },
  lily: { Bud: LilyBud, Bloom: LilyBloom },
  calla_lily: { Bud: CallaBud, Bloom: CallaBloom },
};

/**
 * One flower at a given growth stage. Seed and sprout are shared across
 * species; bud and bloom are species-specific. Species without art yet
 * (remaining 4 ship in Phase 4) fall back to the sprout.
 */
export function Flower({
  species,
  stage,
  className,
}: {
  species: Species;
  stage: GrowthStage;
  className?: string;
}) {
  const art = ART[species];
  return (
    <svg viewBox="0 0 100 140" aria-hidden="true" className={className}>
      {stage === 0 && <SeedStage />}
      {stage === 1 && <SproutStage />}
      {stage === 2 && (art ? <art.Bud /> : <SproutStage />)}
      {stage === 3 && (art ? <art.Bloom /> : <SproutStage />)}
    </svg>
  );
}
