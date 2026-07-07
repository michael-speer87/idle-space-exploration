import type { GameState } from "../types";
import { INFLUENCE_OUTPUT_BONUS_PER_POINT } from "../config/influence";
import { FIRST_INFLUENCE_RESET_CLAIMED_SYSTEM_REQUIREMENT } from "../config/progression";
import { createNewGame } from "../createNewGame";
import {
    canPerformInfluenceReset,
    getClaimedSystemCount,
} from "./progressionSystem"

export type InfluenceResetPreview = {
    canReset: boolean;
    claimedSystemCount: number;
    claimedSystemRequirement: number;
    influenceGain: number;
    currentLifetimeInfluence: number;
    nextLifetimeInfluence: number;
    totalResets: number;
    currentOutputMultiplier: number;
    nextOutputMultiplier: number;
    blockedReason: string | null;
};

export function getInfluenceResetPreview(
    state: GameState,
): InfluenceResetPreview {
    const claimedSystemCount = getClaimedSystemCount(state);
    const claimedSystemRequirement =
        FIRST_INFLUENCE_RESET_CLAIMED_SYSTEM_REQUIREMENT
    
    const canReset = canPerformInfluenceReset(state);
    const influenceGain = canReset ? calculateInfluenceGain(state) : 0;

    const  currentLifetimeInfluence = state.influence.lifetimeInfluence;
    const nextLifetimeInfluence = currentLifetimeInfluence + influenceGain;

    return {
        canReset,
        claimedSystemCount,
        claimedSystemRequirement,
        influenceGain,
        currentLifetimeInfluence,
        nextLifetimeInfluence,
        totalResets: state.influence.totalResets,
        currentOutputMultiplier: getInfluenceOutputMultiplier(state),
        nextOutputMultiplier: 1 + nextLifetimeInfluence * INFLUENCE_OUTPUT_BONUS_PER_POINT,
        blockedReason: canReset
            ? null
            : `Cliam ${claimedSystemRequirement} systems to autorize reset.`,
    };
}

export function performInfluenceReset(state: GameState): GameState {
    if (!canPerformInfluenceReset(state)) {
        return state;
    }

    const influenceGain = calculateInfluenceGain(state);

    const nextInfluence = {
        lifetimeInfluence: state.influence.lifetimeInfluence + influenceGain,
        totalResets: state.influence.totalResets + 1,
    };

    const nextSeed = createNextRunSeed(state);

    return createNewGame(nextSeed, nextInfluence, state.research);
}

export function getInfluenceOutputMultiplier(state: GameState): number {
    return (
        1 +
        state.influence.lifetimeInfluence * INFLUENCE_OUTPUT_BONUS_PER_POINT
    );
}

function calculateInfluenceGain(state: GameState): number {
    const claimedSystemCount = getClaimedSystemCount(state)

    return Math.max(
        1,
        Math.floor(
            claimedSystemCount / FIRST_INFLUENCE_RESET_CLAIMED_SYSTEM_REQUIREMENT,
        ),
    );
}

function createNextRunSeed(state: GameState): number {
    return state.seed + 1009 + state.influence.totalResets
}