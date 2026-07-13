import type { GameState, StarSystemId } from "./types";
import { beginSurvey } from "./systems/explorationSystem";
import type { PrimaryOutpostId } from "./config/outposts";
import { claimWithOutpost, upgradePrimaryOutpost } from "./systems/outpostSystem";
import { advanceGameTime } from "./systems/timeSystem";
import type { ResearchProjectId } from "./config/research";
import { startResearch } from "./systems/researchSystem";
import { createNewGame } from "./createNewGame";
import { performInfluenceReset } from "./systems/influenceSystem";
import type { SupportBuildingId } from "./config/supportBuildings";
import { buildSupportBuilding } from "./systems/supportBuildingSystem";
import {
    devAddResources,
    devClaimWithOutpost,
    devDetectAllSystems,
    devSurveySystem,
} from "./systems/devAdminSystem";

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
        type: "buildSupportBuilding"
        systemId: StarSystemId;
        supportBuildingId: SupportBuildingId
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
    | {
        type: "devAddResources";
        credits?: number;
        science?: number;
    }
    |{
        type: "devSurveySystem";
        systemId: StarSystemId;
    }
    | {
        type: "devDetectAllSystems";
    }
    | {
        type: "devClaimWithOutpost";
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

        case "advanceGameTime": {
            return advanceGameTime(state, action.seconds);
        }

        case "claimWithOutpost": {
            return claimWithOutpost(state, action.systemId, action.outpostId);
        }

        case "buildSupportBuilding": {
            return buildSupportBuilding(
                state,
                action.systemId,
                action.supportBuildingId,
            );
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

        case "devAddResources": {
            if (!import.meta.env.DEV) {
                return state;
            }

            return devAddResources(state, {
                credits: action.credits,
                science: action.science,
            });
        }

        case "devSurveySystem": {
            if (!import.meta.env.DEV) {
                return state;
            }

            return devSurveySystem(state, action.systemId);
        }

        case "devDetectAllSystems": {
            if (!import.meta.env.DEV) {
                return state;
            }

            return devDetectAllSystems(state);
        }

        case "devClaimWithOutpost": {
            if (!import.meta.env.DEV) { 
                return state;
            }

            return devClaimWithOutpost(state, action.systemId, action.outpostId);
        }

        default: {
            return state;
        }
    }
}