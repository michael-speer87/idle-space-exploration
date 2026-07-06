export type ResearchProjectId =
    | "improved_survey_arrays"
    | "commerce_optimization"
    | "applied_science_methods"
    | "power_relay_efficiency"
    | "extraction_handling"
    | "outpost_tier_ii"
    | "basic_influence_calibration";

export type ResearchProjectDefinition = {
    id: ResearchProjectId;
    name: string;
    scienceCost: number;
    prerequisiteIds: ResearchProjectId[];
    description: string;
};

export const RESEARCH_PROJECTS: Record<
    ResearchProjectId,
    ResearchProjectDefinition
> = {
    improved_survey_arrays: {
        id: "improved_survey_arrays",
        name: "Improved Survey Arrays",
        scienceCost: 10,
        prerequisiteIds: [],
        description: "Improve Survey Array Output.",
    },

    commerce_optimization: {
        id: "commerce_optimization",
        name: "Commerce Optimization",
        scienceCost: 12,
        prerequisiteIds: [],
        description: "Improve research speed or science output.",
    },

    applied_science_methods: {
    id: "applied_science_methods",
    name: "Applied Science Methods",
    scienceCost: 12,
    prerequisiteIds: [],
    description: "Future effect: improve research speed or Science output.",
  },

  power_relay_efficiency: {
    id: "power_relay_efficiency",
    name: "Power Relay Efficiency",
    scienceCost: 15,
    prerequisiteIds: [],
    description: "Future effect: improve Power Relay output.",
  },

  extraction_handling: {
    id: "extraction_handling",
    name: "Extraction Handling",
    scienceCost: 15,
    prerequisiteIds: [],
    description: "Future effect: enable or improve Extraction Rigs.",
  },

  outpost_tier_ii: {
    id: "outpost_tier_ii",
    name: "Outpost Tier II",
    scienceCost: 25,
    prerequisiteIds: [
      "improved_survey_arrays",
      "commerce_optimization",
      "applied_science_methods",
    ],
    description: "Future effect: unlock Tier II Outpost upgrades.",
  },

  basic_influence_calibration: {
    id: "basic_influence_calibration",
    name: "Basic Influence Calibration",
    scienceCost: 30,
    prerequisiteIds: ["outpost_tier_ii"],
    description: "Future effect: prepare the first Influence reset.",
  },
}

export const RESEARCH_PROJECT_IDS = Object.keys(
    RESEARCH_PROJECTS,
) as ResearchProjectId[];