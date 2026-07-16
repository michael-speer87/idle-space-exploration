import type { GameState, InfluenceState, ResearchState, TutorialState } from "./types";
import { generateHexMap } from "./map/generateHexMap";
import { createInitialResearchState } from "./systems/researchSystem";
import { BASE_EXPEDITION_CREDITS } from "./config/economy";
import { createInitialTutorialState } from "./systems/tutorialSystem";

export function createNewGame(
    seed = 12345,
    influence: InfluenceState = {
        lifetimeInfluence: 0,
        totalResets: 0,
    },
    research: ResearchState = createInitialResearchState(),
    tutorial: TutorialState = createInitialTutorialState(),
): GameState {
    const map = generateHexMap({
        seed,
        radius: 3,
    });

    return {
        version: 3,
        seed,

        resources: {
            credits: BASE_EXPEDITION_CREDITS,
            science: 0,
            materials: 0,
        },

        exploration: {
            firstFreeSurveyAvailable: true,
            activeSurvey: null,
        },

        research,

        influence,

        tutorial,

        map,

        selectedSystemId: map.homeSystemId,
    };
}