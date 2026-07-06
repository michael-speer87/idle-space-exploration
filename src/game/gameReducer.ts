import type { GameState, StarSystemId } from "./types";
import {
    advanceActiveSurvey,
    beginSurvey,
} from "./systems/explorationSystem";

export type GameAction =
    | {
        type: "selectSystem";
        systemId: StarSystemId;
    }
    | {
        type: "beginSurvey";
        systemId: StarSystemId;
    }
    | {
        type: "advanceSurvey";
        seconds: number;
    }

export function gameReducer(
    state: GameState,
    action: GameAction,
): GameState {
    switch (action.type) {
        case "selectSystem": {
            const systemExists = state.map.systemsById[action.systemId] !== undefined;

            if (!systemExists) {
                return state;
            }

            return {
                ...state,
                selectedSystemId: action.systemId,
            };
        }

        case "beginSurvey": {
            return beginSurvey(state, action.systemId);
        }

        case "advanceSurvey": {
            return advanceActiveSurvey(state, action.seconds);
        }

        default: {
            return state;
        }
    }
}