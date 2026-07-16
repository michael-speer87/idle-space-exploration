import type { GameState } from "../types";
import { advanceActiveSurvey } from "./explorationSystem";
import { calculateRates } from "./rateSystem";
import { advanceActiveResearch } from "./researchSystem";
import { calculateMaterialFlow } from "./materialEconomySystem";

export function advanceGameTime(
    state: GameState,
    seconds: number,
): GameState {
    if (seconds <= 0) {
        return state;
    }

    const rates = calculateRates(state);

    let nextState = addResourceProduction(state, seconds, rates);

    nextState = advanceActiveResearch(
        nextState,
        seconds,
        rates.researchSpeedPerSecond,
    )

    nextState = advanceActiveSurvey(nextState, seconds);

    return nextState;
}

function addResourceProduction(
  state: GameState,
  seconds: number,
  rates: ReturnType<typeof calculateRates>,
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
    rates.sciencePerSecond <= 0 &&
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
        rates.sciencePerSecond * seconds,

      materials:
        materialFlow.nextMaterials,
    },
  };
}