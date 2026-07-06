import type { GameState, StarSystemId } from "./types";
import {
    advanceActiveSurvey,
    beginSurvey,
} from "./systems/explorationSystem";
import type { PrimaryOutpostId } from "./config/outposts";
import { claimWithOutpost } from "./systems/outpostSystem";

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
    | {
        type: "claimWithOutpost";
        systemId: StarSystemId;
        outpostId: PrimaryOutpostId;
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

        case "claimWithOutpost": {
            return claimWithOutpost(state, action.systemId, action.outpostId);
        }

        default: {
            return state;
        }
    }
}