import type { GameState, StarSystemId } from "../types";
import type { PrimaryOutpostId } from "../config/outposts";

export function canClaimWithOutpost(
    state: GameState,
    systemId: StarSystemId,
    outpostId: PrimaryOutpostId,
): boolean {
    const system = state.map.systemsById[systemId];

    if (!system) {
        return false;
    }

    if (system.isHome) {
        return false;
    }

    if (system.explorationState !== "surveyed") {
        return false;
    }

    if (system.claimState !== "unclaimed") {
        return false;
    }

    if (system.primaryOutpostId !== null) {
        return false;
    }

    if (outpostId !== "survey_array") {
        return false;
    }

    return true;
}

export function claimWithOutpost(
    state: GameState,
    systemId: StarSystemId,
    outpostId: PrimaryOutpostId,
): GameState {
    if (!canClaimWithOutpost(state, systemId, outpostId)) {
        return state;
    }

    const system = state.map.systemsById[systemId];

    return {
        ...state,

        map: {
            ...state.map,
            systemsById: {
                ...state.map.systemsById,
                [systemId]: {
                    ...system,
                    claimState: "claimed",
                    primaryOutpostId: outpostId,
                },
            },
        },
    };
}