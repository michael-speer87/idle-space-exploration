import type { GameState } from "../types";
import { advanceActiveSurvey } from "./explorationSystem";
import { calculateRates } from "./rateSystem";
import { advanceActiveResearch } from "./researchSystem";

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
    rates: ReturnType<typeof calculateRates>
): GameState {
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