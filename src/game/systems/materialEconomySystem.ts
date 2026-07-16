import { BASE_CREDITS_PER_MATERIAL } from "../config/economy";

export type MaterialFlowInput = {
  storedMaterials: number;
  materialCapacity: number;
  potentialProductionPerSecond: number;
  salesThroughputPerSecond: number;
  seconds: number;
  creditsPerMaterial?: number;
};

export type MaterialFlowResult = {
  materialsProduced: number;
  materialsSold: number;
  nextMaterials: number;
  creditsEarned: number;
};

export function calculateMaterialFlow({
  storedMaterials,
  materialCapacity,
  potentialProductionPerSecond,
  salesThroughputPerSecond,
  seconds,
  creditsPerMaterial = BASE_CREDITS_PER_MATERIAL,
}: MaterialFlowInput): MaterialFlowResult {
  const safeSeconds = Math.max(0, seconds);
  const safeCapacity = Math.max(0, materialCapacity);

  const safeStoredMaterials = Math.min(
    safeCapacity,
    Math.max(0, storedMaterials),
  );

  const potentialProduction =
    Math.max(0, potentialProductionPerSecond) *
    safeSeconds;

  const potentialSales =
    Math.max(0, salesThroughputPerSecond) *
    safeSeconds;

  /*
   * Sales create storage room during the same time slice.
   * A full Extraction network can therefore keep producing
   * while Commerce is actively selling.
   */
  const materialsProduced = Math.min(
    potentialProduction,
    safeCapacity -
      safeStoredMaterials +
      potentialSales,
  );

  const materialsSold = Math.min(
    potentialSales,
    safeStoredMaterials + materialsProduced,
  );

  const nextMaterials = Math.min(
    safeCapacity,
    Math.max(
      0,
      safeStoredMaterials +
        materialsProduced -
        materialsSold,
    ),
  );

  return {
    materialsProduced,
    materialsSold,
    nextMaterials,

    creditsEarned:
      materialsSold *
      Math.max(0, creditsPerMaterial),
  };
}