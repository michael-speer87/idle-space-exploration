import type { GameState } from "./types";
import { generateHexMap } from "./map/generateHexMap";

export function createNewGame(seed = 12345): GameState {
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

        map,

        selectedSystemId: map.homeSystemId,
    };
}