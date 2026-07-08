import type { GameState, StarSystemId } from "./types";
import { beginSurvey } from "./systems/explorationSystem";
import type { PrimaryOutpostId } from "./config/outposts";
import { claimWithOutpost, upgradePrimaryOutpost } from "./systems/outpostSystem";
import { advanceGameTime } from "./systems/timeSystem";
import type { ResearchProjectId } from "./config/research";
import { startResearch } from "./systems/researchSystem";
import { createNewGame } from "./createNewGame";
import { performInfluenceReset } from "./systems/influenceSystem";

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
        type: "advanceGameTime";
        seconds: number;
    }
    | {
        type: "claimWithOutpost";
        systemId: StarSystemId;
        outpostId: PrimaryOutpostId;
    }
    | {
        type: "startResearch";
        projectId: ResearchProjectId;
    }
    | {
        type: "resetGame";
        seed?: number;
    }
    | {
        type: "performInfluenceReset"
    }
    | {
        type: "upgradePrimaryOutpost";
        systemId: StarSystemId;
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

        case "advanceGameTime": {
            return advanceGameTime(state, action.seconds);
        }

        case "claimWithOutpost": {
            return claimWithOutpost(state, action.systemId, action.outpostId);
        }

        case "startResearch": {
            return startResearch(state, action.projectId);
        }

        case "resetGame": {
            return createNewGame(action.seed ?? 12345);
        }

        case "performInfluenceReset": {
            return performInfluenceReset(state);
        }

        case "upgradePrimaryOutpost": {
            return upgradePrimaryOutpost(state, action.systemId);
        }

        default: {
            return state;
        }
    }
}