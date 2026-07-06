import type { GameState } from "../types";
import { PRIMARY_OUTPOSTS } from "../config/outposts";

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
                epPerSecond += 
                    outpost.baseOutput * AFFINITY_MULTIPLIERS[system.affinities.survey];
                break;
            }

            case "commerce": {
                creditsPerSecond +=
                    outpost.baseOutput * AFFINITY_MULTIPLIERS[system.affinities.commerce];
                break;
            }

            case "science": {
                sciencePerSecond +=
                    outpost.baseOutput * AFFINITY_MULTIPLIERS[system.affinities.science];
                break;
            }
            
            case "power": {
                energyProduced += outpost.baseOutput;
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