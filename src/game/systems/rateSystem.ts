import {
  getExtractionStorageCapacity,
  getOutpostLevelEnergyUseMultiplier,
  getOutpostLevelOutputMultiplier,
  PRIMARY_OUTPOSTS,
  type PrimaryOutpostId,
} from "../config/outposts";
import { SUPPORT_BUILDINGS } from "../config/supportBuildings";
import type { GameState, StarSystem } from "../types";
import { getInfluenceOutputMultiplier } from "./influenceSystem";
import { getResearchOutpostOutputBonus } from "./researchSystem";
import { BASE_CREDITS_PER_MATERIAL, GRAD_COMMAND_STARTER_ENERGY } from "../config/economy";
import { calculateMaterialFlow } from "./materialEconomySystem";

export type CalculatedRates = {
  epPerSecond: number;
  creditsPerSecond: number;
  sciencePerSecond: number;

  materialProductionPerSecond: number;
  potentialMaterialProductionPerSecond: number;

  materialSalesPerSecond: number;
  materialSalesThroughputPerSecond: number;

  materialCapacity: number;
  creditsPerMaterial: number;

  researchSpeedPerSecond: number;
  energyProduced: number;
  energyUsed: number;
  energySurplus: number;
  productionEfficiency: number;
};

const AFFINITY_MULTIPLIERS = {
  low: 0.75,
  neutral: 1,
  high: 1.25,
} as const;

const MINIMUM_PRODUCTION_EFFICIENCY = 0.1;
const BASE_RESEARCH_SPEED_PER_SECOND = 1;

export function calculateProductionEfficiency(
  energyProduced: number,
  energyUsed: number,
): number {
  const safeEnergyUsed = Math.max(0, energyUsed);

  if (safeEnergyUsed === 0) {
    return 1;
  }

  const energyCoverage = Math.min(
    1,
    Math.max(0, energyProduced) / safeEnergyUsed,
  );

  return (
    MINIMUM_PRODUCTION_EFFICIENCY +
    (1 - MINIMUM_PRODUCTION_EFFICIENCY) *
    energyCoverage
  );
}

export function calculateRates(state: GameState): CalculatedRates {
  const energyProduced = calculateEnergyProduced(state);
  const energyUsed = calculateEnergyUsed(state);
  const energySurplus = energyProduced - energyUsed;
  const influenceOutputMultiplier = getInfluenceOutputMultiplier(state);

  const productionEfficiency =
    calculateProductionEfficiency(
      energyProduced,
      energyUsed,
    );

  

  let epPerSecond = 0;
  let sciencePerSecond = 0;

  let potentialMaterialProductionPerSecond = 0;
  let materialSalesThroughputPerSecond = 0;

  for (const systemId of state.map.systemIds) {
    const system = state.map.systemsById[systemId];

    if (system.claimState !== "claimed") {
      continue;
    }

    if (system.primaryOutpostId === null) {
      continue;
    }

    const outpost = PRIMARY_OUTPOSTS[system.primaryOutpostId];

    switch (outpost.category) {
      case "survey": {
        epPerSecond +=
          getSurveyOutput(state, system) *
          productionEfficiency *
          influenceOutputMultiplier;
        break;
      }

      case "commerce": {
        materialSalesThroughputPerSecond +=
          getCommerceThroughput(state, system) *
          productionEfficiency *
          influenceOutputMultiplier;

        break;
      }

      case "science": {
        sciencePerSecond +=
          getScienceOutput(state, system) *
          productionEfficiency *
          influenceOutputMultiplier;
        break;
      }

      case "power": {
        // Power Relays create Energy and are not reduced by Energy shortage.
        break;
      }

      case "extraction": {
        potentialMaterialProductionPerSecond +=
          getExtractionOutput(state, system) *
          productionEfficiency *
          influenceOutputMultiplier;
        break;
      }
    }
  }


  const materialCapacity =
    calculateMaterialCapacity(state);

  const materialFlow = calculateMaterialFlow({
    storedMaterials: state.resources.materials,
    materialCapacity,

    potentialProductionPerSecond:
      potentialMaterialProductionPerSecond,

    salesThroughputPerSecond:
      materialSalesThroughputPerSecond,

    seconds: 1,
  });

  const materialProductionPerSecond =
    materialFlow.materialsProduced;

  const materialSalesPerSecond =
    materialFlow.materialsSold;

  const creditsPerSecond =
    materialFlow.creditsEarned;

  const researchSpeedPerSecond = Math.max(
    BASE_RESEARCH_SPEED_PER_SECOND,
    sciencePerSecond,
  );

  return {
    epPerSecond,
    creditsPerSecond,
    sciencePerSecond,

    materialProductionPerSecond,
    potentialMaterialProductionPerSecond,

    materialSalesPerSecond,
    materialSalesThroughputPerSecond,

    materialCapacity,
    creditsPerMaterial:
      BASE_CREDITS_PER_MATERIAL,

    researchSpeedPerSecond,

    energyProduced,
    energyUsed,
    energySurplus,
    productionEfficiency,
  };
}

function calculateMaterialCapacity(state: GameState): number {
  let materialCapacity = 0;

  for (const systemId of state.map.systemIds) {
    const system = state.map.systemsById[systemId];

    if (
      system.claimState !== "claimed" ||
      system.primaryOutpostId !== "extraction_rig"
    ) {
      continue;
    }

    materialCapacity += getExtractionStorageCapacity(
      system.primaryOutpostLevel,
    );
  }

  return materialCapacity;
}

function calculateEnergyProduced(state: GameState): number {
  let energyProduced = getGradCommandEnergyProduced(state);

  for (const systemId of state.map.systemIds) {
    const system = state.map.systemsById[systemId];

    if (system.claimState !== "claimed") {
      continue;
    }

    if (system.primaryOutpostId === null) {
      continue;
    }

    const outpost = PRIMARY_OUTPOSTS[system.primaryOutpostId];

    if (outpost.category !== "power") {
      continue;
    }

    energyProduced += getPowerOutput(state, system);
  }

  return energyProduced;
}

function calculateEnergyUsed(state: GameState): number {
  let energyUsed = 0;

  for (const systemId of state.map.systemIds) {
    const system = state.map.systemsById[systemId];

    if (system.claimState !== "claimed") {
      continue;
    }

    if (system.primaryOutpostId === null) {
      continue;
    }

    const outpost = PRIMARY_OUTPOSTS[system.primaryOutpostId];

    if (!outpost.usesEnergy) {
      continue;
    }

    energyUsed +=
      outpost.baseEnergyUse *
      getOutpostLevelEnergyUseMultiplier(system.primaryOutpostLevel);
  }

  return energyUsed;
}

function getGradCommandEnergyProduced(state: GameState): number {
  const hasGradCommand = state.map.systemIds.some((systemId) => {
    const system = state.map.systemsById[systemId];

    return system.claimState === "claimed" && system.hasGradCommand;
  });

  return hasGradCommand ? GRAD_COMMAND_STARTER_ENERGY : 0;
}

function getSupportBuildingOutputBonus(system: StarSystem): number {
  if (system.primaryOutpostId === null) {
    return 0;
  }

  return system.supportBuildingIds.reduce(
    (bonus, supportBuildingId) => {
      const building = SUPPORT_BUILDINGS[supportBuildingId];

      // Ignore incompatible entries if an old or edited save contains one.
      if (building.requiredPrimaryOutpostId !== system.primaryOutpostId) {
        return bonus;
      }

      return bonus + building.outputBonus;
    },
    0,
  );
}

function getPrimaryOutpostRate(
  state: GameState,
  system: StarSystem,
  outpostId: PrimaryOutpostId,
): number {
  if (system.primaryOutpostId !== outpostId) {
    return 0;
  }

  const outpost = PRIMARY_OUTPOSTS[outpostId];

  const levelMultiplier = getOutpostLevelOutputMultiplier(
    system.primaryOutpostLevel,
  );

  const affinityMultiplier = AFFINITY_MULTIPLIERS[system.affinities[outpost.category]];

  const primaryRateBonus =
    getResearchOutpostOutputBonus(state, outpost.id) +
    getSupportBuildingOutputBonus(system);

  return (
    outpost.baseOutput *
    levelMultiplier *
    affinityMultiplier *
    (1 + primaryRateBonus)
  );
}

function getSurveyOutput(
  state: GameState,
  system: StarSystem,
): number {
  return getPrimaryOutpostRate(
    state,
    system,
    "survey_array",
  );
}

export function getCommerceThroughput(
  state: GameState,
  system: StarSystem,
): number {
  return getPrimaryOutpostRate(
    state,
    system,
    "commerce_hub",
  );
}

function getScienceOutput(
  state: GameState,
  system: StarSystem,
): number {
  return getPrimaryOutpostRate(
    state,
    system,
    "science_station",
  );
}

function getPowerOutput(
  state: GameState,
  system: StarSystem,
): number {
  return getPrimaryOutpostRate(
    state,
    system,
    "power_relay",
  );
}

export function getExtractionOutput(
  state: GameState,
  system: StarSystem,
): number {
  return getPrimaryOutpostRate(
    state,
    system,
    "extraction_rig",
  );
}