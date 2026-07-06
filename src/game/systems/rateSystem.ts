import type { GameState } from "../types";
import { PRIMARY_OUTPOSTS } from "../config/outposts";
import { isResearchCompleted } from "./researchSystem";

export type CalculatedRates = {
    epPerSecond: number;
    creditsPerSecond: number;
    sciencePerSecond: number;
    energyProduced: number;
    energyUsed: number;
    energySurplus: number;
};

const AFFINITY_MULTIPLIERS = {
    low: 0.75,
    neutral: 1,
    high: 1.25,
} as const;

const RESEARCH_EFFECTS = {
    improvedSurveyArraysMultiplier: 1.25,
    commerceOptimizationMultiplier: 1.25,
    appliedScienceMethodsMultiplier: 1.25,
    powerRelayEfficiencyMultiplier: 1.25,
} as const;

export function calculateRates(state: GameState): CalculatedRates {
    let epPerSecond = 0;
    let creditsPerSecond = 0;
    let sciencePerSecond = 0;
    let energyProduced = 0;
    let energyUsed = 0;

    for (const systemId of state.map.systemIds) {
        const system = state.map.systemsById[systemId]

        if (system.claimState !== "claimed") {
            continue;
        }

        if (system.primaryOutpostId === null) {
            continue;
        }

        const outpost = PRIMARY_OUTPOSTS[system.primaryOutpostId];

        if (outpost.usesEnergy) {
            energyUsed += 1;
        }

        switch (outpost.category) {
            case "survey": {
                let surveyOutput =
                    outpost.baseOutput * AFFINITY_MULTIPLIERS[system.affinities.survey];
                
                if (isResearchCompleted(state, "improved_survey_arrays")) {
                    surveyOutput *= RESEARCH_EFFECTS.improvedSurveyArraysMultiplier
                }

                epPerSecond += surveyOutput;
                break;
            }

            case "commerce": {
                let commerceOutput =
                    outpost.baseOutput *
                    AFFINITY_MULTIPLIERS[system.affinities.commerce];

                if (isResearchCompleted(state, "commerce_optimization")) {
                    commerceOutput *= RESEARCH_EFFECTS.commerceOptimizationMultiplier
                }

                creditsPerSecond += commerceOutput;
                break;
            }

            case "science": {
                let scienceOutput =
                    outpost.baseOutput * AFFINITY_MULTIPLIERS[system.affinities.science];

                if (isResearchCompleted(state, "applied_science_methods")) {
                    scienceOutput *= RESEARCH_EFFECTS.appliedScienceMethodsMultiplier;
                }

                sciencePerSecond += scienceOutput;
                break;
            }
            
            case "power": {
                let powerOutput =
                    outpost.baseOutput * AFFINITY_MULTIPLIERS[system.affinities.power];
                
                if (isResearchCompleted(state, "power_relay_efficiency")) {
                    powerOutput *= RESEARCH_EFFECTS.powerRelayEfficiencyMultiplier
                }

                energyProduced += powerOutput;
                break;
            }
            
            case "extraction": {
                // Extraction exists in the config, but its economy is later.
            break;
            }
        }
    }

    const energySurplus = energyProduced - energyUsed;

    return {
        epPerSecond,
        creditsPerSecond,
        sciencePerSecond,
        energyProduced,
        energyUsed,
        energySurplus,
    };
}