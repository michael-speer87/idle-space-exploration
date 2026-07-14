import type { AffinityProfile, StarVisual } from "../types";

export type SystemRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "very_rare"
  | "ultra_rare";

export type SystemRarityDefinition = {
  id: SystemRarity;
  name: string;
  starVisual: StarVisual;
  minimumQualityScore: number;
};

export const SYSTEM_RARITIES: Record<
  SystemRarity,
  SystemRarityDefinition
> = {
  common: {
    id: "common",
    name: "Common",
    starVisual: "yellow",
    minimumQualityScore: 2,
  },
  uncommon: {
    id: "uncommon",
    name: "Uncommon",
    starVisual: "orange",
    minimumQualityScore: 5,
  },
  rare: {
    id: "rare",
    name: "Rare",
    starVisual: "white",
    minimumQualityScore: 7,
  },
  very_rare: {
    id: "very_rare",
    name: "Very Rare",
    starVisual: "blue",
    minimumQualityScore: 9,
  },
  ultra_rare: {
    id: "ultra_rare",
    name: "Ultra Rare",
    starVisual: "red",
    minimumQualityScore: 11,
  },
};

export function getSystemQualityScore(
  affinities: AffinityProfile,
  supportSlotCount: number,
): number {
  const affinityLevels = Object.values(affinities);
  const hasHighAffinity = affinityLevels.some(
    (affinity) => affinity === "high",
  );

  let affinityScore = 0;

  if (hasHighAffinity) {
    affinityScore = 3;
  } else {
    const lowAffinityCount = affinityLevels.filter(
      (affinity) => affinity === "low",
    ).length;

    if (lowAffinityCount === 0) {
      affinityScore = 2;
    } else if (lowAffinityCount === 1) {
      affinityScore = 1;
    }
  }

  return supportSlotCount * 2 + affinityScore;
}

export function getSystemRarity(
  affinities: AffinityProfile,
  supportSlotCount: number,
): SystemRarity {
  const qualityScore = getSystemQualityScore(
    affinities,
    supportSlotCount,
  );

  if (
    qualityScore >=
    SYSTEM_RARITIES.ultra_rare.minimumQualityScore
  ) {
    return "ultra_rare";
  }

  if (
    qualityScore >=
    SYSTEM_RARITIES.very_rare.minimumQualityScore
  ) {
    return "very_rare";
  }

  if (
    qualityScore >= SYSTEM_RARITIES.rare.minimumQualityScore
  ) {
    return "rare";
  }

  if (
    qualityScore >= SYSTEM_RARITIES.uncommon.minimumQualityScore
  ) {
    return "uncommon";
  }

  return "common";
}

export function getStarVisualForSystem(
  affinities: AffinityProfile,
  supportSlotCount: number,
): StarVisual {
  const rarity = getSystemRarity(
    affinities,
    supportSlotCount,
  );

  return SYSTEM_RARITIES[rarity].starVisual;
}

export function getSystemRarityFromStarVisual(
  starVisual: StarVisual,
): SystemRarity {
  switch (starVisual) {
    case "red":
      return "ultra_rare";

    case "blue":
      return "very_rare";

    case "white":
      return "rare";

    case "orange":
      return "uncommon";

    case "yellow":
    default:
      return "common";
  }
}