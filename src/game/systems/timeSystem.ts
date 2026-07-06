import type { GameState } from "../types";
import { advanceActiveSurvey } from "./explorationSystem";
import { calculateRates } from "./rateSystem";

export function advanceGameTime(
    state: GameState,
    seconds: number,
): GameState {
    if (seconds <= 0) {
        return state;
    }

    let nextState = addResourceProduction(state, seconds);
    
    nextState = advanceActiveSurvey(nextState, seconds);

    return nextState;
}

function addResourceProduction(
    state: GameState,
    seconds: number,
): GameState {
    const rates = calculateRates(state);

    if (rates.creditsPerSecond <= 0 && rates.sciencePerSecond <= 0) {
        return state;
    }

    return {
        ...state,

        resources: {
            ...state.resources,
            credits: state.resources.credits + rates.creditsPerSecond * seconds,
            science: state.resources.science + rates.sciencePerSecond * seconds,
        },
    };
}