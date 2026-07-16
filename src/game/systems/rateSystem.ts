import {
  getExtractionStorageCapacity,
  getOutpostLevelEnergyUseMultiplier,
  getOutpostLevelOutputMultiplier,
  PRIMARY_OUTPOSTS,
} from "../config/outposts";
import { SUPPORT_BUILDINGS } from "../config/supportBuildings";
import type { GameState, StarSystem } from "../types";
import { getInfluenceOutputMultiplier } from "./influenceSystem";
import { getResearchOutpostOutputMultiplier } from "./researchSystem";

export type CalculatedRates = {
  epPerSecond: number;
  creditsPerSecond: number;
  sciencePerSecond: number;

  materialProductionPerSecond: number;
  potentialMaterialProductionPerSecond: number;
  materialCapacity: number;

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

const GRAD_COMMAND_STARTER_ENERGY = 6;
const ENERGY_SHORTAGE_PRODUCTION_EFFICIENCY = 0.5;
const BASE_RESEARCH_SPEED_PER_SECOND = 1;

export function calculateRates(state: GameState): CalculatedRates {
  const energyProduced = calculateEnergyProduced(state);
  const energyUsed = calculateEnergyUsed(state);
  const energySurplus = energyProduced - energyUsed;
  const influenceOutputMultiplier = getInfluenceOutputMultiplier(state);

  const productionEfficiency =
    energySurplus < 0 ? ENERGY_SHORTAGE_PRODUCTION_EFFICIENCY : 1;

  let epPerSecond = 0;
  let creditsPerSecond = 0;
  let sciencePerSecond = 0;
  let potentialMaterialProductionPerSecond = 0;

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
        creditsPerSecond +=
          getCommerceOutput(state, system) *
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

  const materialCapacity = calculateMaterialCapacity(state);

  const materialProductionPerSecond =
    state.resources.materials < materialCapacity
      ? potentialMaterialProductionPerSecond
      : 0;

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
    materialCapacity,

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

function getSupportBuildingOutputMultiplier(system: StarSystem): number {
  if (system.primaryOutpostId === null) {
    return 1;
  }

  const totalBonus = system.supportBuildingIds.reduce(
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

  return 1 + totalBonus;
}

function getSurveyOutput(state: GameState, system: StarSystem): number {
  const outpost = PRIMARY_OUTPOSTS.survey_array;
  const levelMultiplier = getOutpostLevelOutputMultiplier(
    system.primaryOutpostLevel,
  );

  let output =
    outpost.baseOutput *
    levelMultiplier *
    AFFINITY_MULTIPLIERS[system.affinities.survey];

  output *= getResearchOutpostOutputMultiplier(state, outpost.id,);
  
  output *= getSupportBuildingOutputMultiplier(system);

  return output;
}

function getCommerceOutput(state: GameState, system: StarSystem): number {
  const outpost = PRIMARY_OUTPOSTS.commerce_hub;
  const levelMultiplier = getOutpostLevelOutputMultiplier(
    system.primaryOutpostLevel,
  );

  let output =
    outpost.baseOutput *
    levelMultiplier *
    AFFINITY_MULTIPLIERS[system.affinities.commerce];

  output *= getResearchOutpostOutputMultiplier(state, outpost.id,);

  output *= getSupportBuildingOutputMultiplier(system);

  return output;
}

function getScienceOutput(state: GameState, system: StarSystem): number {
  const outpost = PRIMARY_OUTPOSTS.science_station;
  const levelMultiplier = getOutpostLevelOutputMultiplier(
    system.primaryOutpostLevel,
  );

  let output =
    outpost.baseOutput *
    levelMultiplier *
    AFFINITY_MULTIPLIERS[system.affinities.science];

  output *= getResearchOutpostOutputMultiplier(state, outpost.id,);

  output *= getSupportBuildingOutputMultiplier(system);

  return output;
}

function getPowerOutput(state: GameState, system: StarSystem): number {
  const outpost = PRIMARY_OUTPOSTS.power_relay;
  const levelMultiplier = getOutpostLevelOutputMultiplier(
    system.primaryOutpostLevel,
  );

  let output =
    outpost.baseOutput *
    levelMultiplier *
    AFFINITY_MULTIPLIERS[system.affinities.power];

  output *= getResearchOutpostOutputMultiplier(state, outpost.id,);

  output *= getSupportBuildingOutputMultiplier(system);

  return output;
}

function getExtractionOutput(state: GameState, system: StarSystem): number {
  const outpost = PRIMARY_OUTPOSTS.extraction_rig;
  const levelMultiplier = getOutpostLevelOutputMultiplier(
    system.primaryOutpostLevel,
  );

  let output =
    outpost.baseOutput *
    levelMultiplier *
    AFFINITY_MULTIPLIERS[system.affinities.extraction];

  output *= getResearchOutpostOutputMultiplier(state, outpost.id,);

  output *= getSupportBuildingOutputMultiplier(system);

  return output;
}