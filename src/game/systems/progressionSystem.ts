import { FIRST_INFLUENCE_RESET_CLAIMED_SYSTEM_REQUIREMENT } from "../config/progression";
import type { GameState } from "../types";

export type RunObjectiveProgress = {
    claimedSystemCount: number;
    claimedSystemRequirement: number;
    progressPercent: number;
    isInfluenceResetReady: boolean;
};

export function getRunObjectiveProgress(
    state: GameState
): RunObjectiveProgress {
    const claimedSystemCount = getClaimedSystemCount(state);
    const claimedSystemRequirement =
        FIRST_INFLUENCE_RESET_CLAIMED_SYSTEM_REQUIREMENT;

    const progressPercent = Math.min(
        100,
        Math.round((claimedSystemCount / claimedSystemRequirement) * 100),
    );

    return {
        claimedSystemCount,
        claimedSystemRequirement,
        progressPercent,
        isInfluenceResetReady: claimedSystemCount >= claimedSystemRequirement,
    };
}

export function getClaimedSystemCount(state: GameState): number {
    return state.map.systemIds.filter((systemId) => {
        const system = state.map.systemsById[systemId];

        return system.claimState === "claimed";
    }).length;
}

export function canPerformInfluenceReset(state: GameState): boolean {
    return getRunObjectiveProgress(state).isInfluenceResetReady;
}