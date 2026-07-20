export type PrimaryOutpostId =
    | "survey_array"
    | "commerce_hub"
    | "science_station"
    | "power_relay"
    | "extraction_rig"
    | "research_academy";

export type OutpostCategory =
    | "survey"
    | "commerce"
    | "science"
    | "power"
    | "extraction"
    | "research";

export type OutpostAffinityKey =
  | "survey"
  | "commerce"
  | "science"
  | "power"
  | "extraction";

export type PrimaryOutpostDefinition = {
    id: PrimaryOutpostId;
    name: string;
    category: OutpostCategory;
    affinityKey: OutpostAffinityKey;
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
        affinityKey: "survey",
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
        affinityKey: "commerce",
        baseOutput: 1,
        claimCreditCost: 10,
        claimCreditCostGrowthRate: 1.18,
        upgradeCreditCost: 15,
        upgradeCreditCostGrowthRate: 1.35,
        baseEnergyUse: 2,
        usesEnergy: true,
        description: "Sells Materials automatically to generate Credits.",
    },

    science_station: {
        id: "science_station",
        name: "Science Station",
        category: "science",
        affinityKey: "science",
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
        affinityKey: "power",
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
        affinityKey: "extraction",
        baseOutput: 1,
        claimCreditCost: 15,
        claimCreditCostGrowthRate: 1.2,
        upgradeCreditCost: 20,
        upgradeCreditCostGrowthRate: 1.4,
        baseEnergyUse: 3,
        usesEnergy: true,
        description: "Produces Materials/sec and provides Material storage.",
    },

    research_academy: {
        id: "research_academy",
        name: "Research Acadamy",
        category: "research",
        affinityKey: "science",
        baseOutput: 1,
        claimCreditCost: 30,
        claimCreditCostGrowthRate: 1.2,
        upgradeCreditCost: 35,
        upgradeCreditCostGrowthRate: 1.4,
        baseEnergyUse: 4,
        usesEnergy: true,

        description:
            "Routes fresh science into active Research up to its Research Capacity.",
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

export function getExtractionStorageCapacity(level: number): number {
    if (level <= 0) {
        return 0;
    }

    return 100 + (level - 1) * 10;
}