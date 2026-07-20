import type { GameState } from "../types";
import { advanceActiveSurvey } from "./explorationSystem";
import { calculateRates } from "./rateSystem";
import { applyResearchProgress } from "./researchSystem";
import { calculateMaterialFlow } from "./materialEconomySystem";
import { RESEARCH_PROJECTS } from "../config/research";
import { calculateResearchFlow } from "./researchFlowSystem";

export function advanceGameTime(
  state: GameState,
  seconds: number,
): GameState {
  if (seconds <= 0) {
    return state;
  }

  const rates = calculateRates(state);

  const researchFlow = getResearchFlowForTick(
    state,
    rates,
    seconds,
  );

  let nextState = addResourceProduction(state, seconds, rates, researchFlow.scienceAddedToStorage);

  nextState = applyResearchProgress(
    nextState,
    researchFlow.researchProgressAdded,
  );

  nextState = advanceActiveSurvey(
    nextState,
    seconds,
  );

  return nextState;
}

function getResearchFlowForTick(
  state: GameState,
  rates: ReturnType<typeof calculateRates>,
  seconds: number,
) {
  const activeProjectId =
    state.research.activeProjectId;

  if (activeProjectId === null) {
    return calculateResearchFlow({
      freshSciencePerSecond:
        rates.sciencePerSecond,

      researchCapacityPerSecond:
        rates.researchCapacityPerSecond,

      seconds,
      hasActiveResearch: false,
      remainingResearch: 0,
    });
  }

  const projectState =
    state.research.projectsById[activeProjectId];

  const projectDefinition =
    RESEARCH_PROJECTS[activeProjectId];

  if (
    !projectState ||
    !projectDefinition ||
    projectState.isCompleted
  ) {
    return calculateResearchFlow({
      freshSciencePerSecond:
        rates.sciencePerSecond,

      researchCapacityPerSecond:
        rates.researchCapacityPerSecond,

      seconds,
      hasActiveResearch: false,
      remainingResearch: 0,
    });
  }

  return calculateResearchFlow({
    freshSciencePerSecond:
      rates.sciencePerSecond,

    researchCapacityPerSecond:
      rates.researchCapacityPerSecond,

    seconds,
    hasActiveResearch: true,

    remainingResearch: Math.max(
      0,
      projectDefinition.scienceCost -
        projectState.progress,
    ),
  });
}

function addResourceProduction(
  state: GameState,
  seconds: number,
  rates: ReturnType<typeof calculateRates>,
  scienceAddedToStorage: number,
): GameState {
  const materialFlow = calculateMaterialFlow({
    storedMaterials: state.resources.materials,

    materialCapacity:
      rates.materialCapacity,

    potentialProductionPerSecond:
      rates.potentialMaterialProductionPerSecond,

    salesThroughputPerSecond:
      rates.materialSalesThroughputPerSecond,

    seconds,

    creditsPerMaterial:
      rates.creditsPerMaterial,
  });

  if (
    materialFlow.creditsEarned <= 0 &&
    scienceAddedToStorage <= 0 &&
    materialFlow.materialsProduced <= 0 &&
    materialFlow.materialsSold <= 0
  ) {
    return state;
  }

  return {
    ...state,

    resources: {
      ...state.resources,

      credits:
        state.resources.credits +
        materialFlow.creditsEarned,

      science:
        state.resources.science +
        scienceAddedToStorage,

      materials:
        materialFlow.nextMaterials,
    },
  };
}