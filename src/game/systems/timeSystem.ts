import type { GameState } from "../types";
import { advanceActiveSurvey } from "./explorationSystem";

export function advanceGameTime(
    state: GameState,
    seconds: number,
): GameState {
    if (seconds <= 0) {
        return state;
    }

    let nextState = state;

    nextState = advanceActiveSurvey(nextState, seconds);

    return nextState;
}