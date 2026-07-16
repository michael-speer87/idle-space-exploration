import type { GameState, InfluenceState, ResearchState } from "./types";
import { generateHexMap } from "./map/generateHexMap";
import { createInitialResearchState } from "./systems/researchSystem";

export function createNewGame(
    seed = 12345,
    influence: InfluenceState = {
        lifetimeInfluence: 0,
        totalResets: 0,
    },
    research: ResearchState = createInitialResearchState(),
): GameState {
    const map = generateHexMap({
        seed,
        radius: 3,
    });

    return {
        version: 2,
        seed,

        resources: {
            credits: 0,
            science: 0,
            materials: 0,
        },

        exploration: {
            firstFreeSurveyAvailable: true,
            activeSurvey: null,
        },

        research,

        influence,

        map,

        selectedSystemId: map.homeSystemId,
    };
}