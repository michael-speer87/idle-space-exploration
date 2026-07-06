import type { GameState, StarSystemId } from "../types";
import type { PrimaryOutpostId } from "../config/outposts";
import { calculateRates } from "./rateSystem";

export const CLAIMABLE_PRIMARY_OUTPOST_IDS: readonly PrimaryOutpostId[] = [
    "survey_array",
    "commerce_hub",
    "science_station",
    "power_relay",
];

export function getClaimableOutpostIds(
    state: GameState,
    systemId: StarSystemId,
): PrimaryOutpostId[] {
    return CLAIMABLE_PRIMARY_OUTPOST_IDS.filter((outpostId) =>
        canClaimWithOutpost(state, systemId, outpostId),
    );
}

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

    const rates = calculateRates(state);

    if (rates.epPerSecond <= 0 && outpostId !== "survey_array") {
        return false;
    }

    return CLAIMABLE_PRIMARY_OUTPOST_IDS.includes(outpostId);
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