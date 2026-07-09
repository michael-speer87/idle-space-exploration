export type PrimaryOutpostId =
    | "survey_array"
    | "commerce_hub"
    | "science_station"
    | "power_relay"
    | "extraction_rig";

export type OutpostCategory =
    | "survey"
    | "commerce"
    | "science"
    | "power"
    | "extraction";

export type PrimaryOutpostDefinition = {
    id: PrimaryOutpostId;
    name: string;
    category: OutpostCategory;
    baseOutput: number;
    claimCreditCost: number;
    claimCreditCostGrowthRate: number;
    upgradeCreditCost: number;
    upgradeCreditCostGrowthRate: number;
    baseEnergyUse: number;
    usesEnergy: boolean;
    description: string;
};

export const PRIMARY_OUTPOSTS: Record<
    PrimaryOutpostId,
    PrimaryOutpostDefinition
> = {
    survey_array: {
        id: "survey_array",
        name: "Survey Array",
        category: "survey",
        baseOutput: 1,
        claimCreditCost: 10,
        claimCreditCostGrowthRate: 1.18,
        upgradeCreditCost: 15,
        upgradeCreditCostGrowthRate: 1.35,
        baseEnergyUse: 2,
        usesEnergy: true,
        description: "Produces EP/sec and enables continued surveying.",
    },

    commerce_hub: {
        id: "commerce_hub",
        name: "Commerce Hub",
        category: "commerce",
        baseOutput: 1,
        claimCreditCost: 10,
        claimCreditCostGrowthRate: 1.18,
        upgradeCreditCost: 15,
        upgradeCreditCostGrowthRate: 1.35,
        baseEnergyUse: 2,
        usesEnergy: true,
        description: "Produces Credits/sec.",
    },

    science_station: {
        id: "science_station",
        name: "Science Station",
        category: "science",
        baseOutput: 1,
        claimCreditCost: 15,
        claimCreditCostGrowthRate: 1.2,
        upgradeCreditCost: 20,
        upgradeCreditCostGrowthRate: 1.4,
        baseEnergyUse: 3,
        usesEnergy: true,
        description: "Produces Science/sec.",
    },

    power_relay: {
        id: "power_relay",
        name: "Power Relay",
        category: "power",
        baseOutput: 5,
        claimCreditCost: 20,
        claimCreditCostGrowthRate: 1.22,
        upgradeCreditCost: 25,
        upgradeCreditCostGrowthRate: 1.4,
        baseEnergyUse: 0,
        usesEnergy: false,
        description: "Provides Evergy Capacity.",
    },

    extraction_rig: {
        id: "extraction_rig",
        name: "Extraction Rig",
        category: "extraction",
        baseOutput: 1,
        claimCreditCost: 15,
        claimCreditCostGrowthRate: 1.2,
        upgradeCreditCost: 20,
        upgradeCreditCostGrowthRate: 1.4,
        baseEnergyUse: 3,
        usesEnergy: true,
        description: "Extracts materials that are automatically converted into Credits/sec.",
    },
};

export function getOutpostLevelOutputMultiplier(level: number): number {
  if (level <= 0) {
    return 0;
  }

  return 1 + (level - 1) * 0.5;
}

export function getOutpostLevelEnergyUseMultiplier(level: number): number {
    if (level <= 0) {
        return 0;
    }

    return 1 + (level - 1) * 0.1;
}