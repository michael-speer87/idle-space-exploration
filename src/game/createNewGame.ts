import type { GameState, InfluenceState } from "./types";
import { generateHexMap } from "./map/generateHexMap";
import { createInitialResearchState } from "./systems/researchSystem";

export function createNewGame(
    seed = 12345,
    influence: InfluenceState = {
        lifetimeInfluence: 0,
        totalResets: 0,
    },
): GameState {
    const map = generateHexMap({
        seed,
        radius: 3,
    });

    return {
        version: 1,
        seed,

        resources: {
            credits: 0,
            science: 0,
        },

        exploration: {
            firstFreeSurveyAvailable: true,
            activeSurvey: null,
        },

        research: createInitialResearchState(),

        influence,

        map,

        selectedSystemId: map.homeSystemId,
    };
}