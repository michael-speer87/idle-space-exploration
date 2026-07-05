import type { GameState, StarSystemId } from "./types";

export type GameAction =
    | {
        type: "selectSystem";
        systemId: StarSystemId;
    };

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

        default: {
            return state;
        }
    }
}