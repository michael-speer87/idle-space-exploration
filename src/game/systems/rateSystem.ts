import type { GameState, StarSystem } from "../types";
import { 
  getOutpostLevelEnergyUseMultiplier,
  getOutpostLevelOutputMultiplier,
  PRIMARY_OUTPOSTS 
} from "../config/outposts";
import { isResearchCompleted } from "./researchSystem";
import { getInfluenceOutputMultiplier } from "./influenceSystem";

export type CalculatedRates = {
    epPerSecond: number;
    creditsPerSecond: number;
    sciencePerSecond: number;
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

const RESEARCH_EFFECTS = {
    improvedSurveyArraysMultiplier: 1.25,
    commerceOptimizationMultiplier: 1.25,
    appliedScienceMethodsMultiplier: 1.25,
    powerRelayEfficiencyMultiplier: 1.25,
    extractionHandlingMultiplier: 1.25,
} as const;

const GRAD_COMMAND_STARTER_ENERGY = 6;
const ENERGY_SHORTAGE_PRODUCTION_EFFICIENCY = 0.5

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
        epPerSecond += getSurveyOutput(state, system) * 
          productionEfficiency *
          influenceOutputMultiplier;
        break;
      }

      case "commerce": {
        creditsPerSecond += getCommerceOutput(state, system) * 
          productionEfficiency *
          influenceOutputMultiplier;
        break;
      }

      case "science": {
        sciencePerSecond += getScienceOutput(state, system) * 
          productionEfficiency *
          influenceOutputMultiplier;
        break;
      }

      case "power": {
        // Power Relays create Energy and are not reduced by Energy shortage.
        break;
      }

      case "extraction": {
        creditsPerSecond += getExtractionOutput(state, system) * 
          productionEfficiency *
          influenceOutputMultiplier;;
        break;
      }
    }
  }

  return {
    epPerSecond,
    creditsPerSecond,
    sciencePerSecond,
    energyProduced,
    energyUsed,
    energySurplus,
    productionEfficiency,
  };
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

function getSurveyOutput(state: GameState, system: StarSystem): number {
  const outpost = PRIMARY_OUTPOSTS.survey_array;
  const levelMultiplier = getOutpostLevelOutputMultiplier(
    system.primaryOutpostLevel,
  );

  let output =
    outpost.baseOutput * 
    levelMultiplier * 
    AFFINITY_MULTIPLIERS[system.affinities.survey];

  if (isResearchCompleted(state, "improved_survey_arrays")) {
    output *= RESEARCH_EFFECTS.improvedSurveyArraysMultiplier;
  }

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

  if (isResearchCompleted(state, "commerce_optimization")) {
    output *= RESEARCH_EFFECTS.commerceOptimizationMultiplier;
  }

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

  if (isResearchCompleted(state, "applied_science_methods")) {
    output *= RESEARCH_EFFECTS.appliedScienceMethodsMultiplier;
  }

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

  if (isResearchCompleted(state, "power_relay_efficiency")) {
    output *= RESEARCH_EFFECTS.powerRelayEfficiencyMultiplier;
  }

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

  if (isResearchCompleted(state, "extraction_handling")) {
    output *= RESEARCH_EFFECTS.extractionHandlingMultiplier;
  }

  return output;
}