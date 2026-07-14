import type { PrimaryOutpostId } from "./outposts";

export type ResearchProjectId =
  | "improved_survey_arrays"
  | "commerce_optimization"
  | "applied_science_methods"
  | "power_relay_efficiency"
  | "extraction_handling"

  | "auxiliary_survey_instrumentation"
  | "regional_trade_networks"
  | "distributed_research_facilities"
  | "localized_power_infrastructure"
  | "industrial_refining_methods"

  | "outpost_tier_ii"
  | "basic_influence_calibration";


export type ResearchEffect = {
  type: "primary_outpost_output_bonus"
  outpostId: PrimaryOutpostId;
  amount: number;
}

export type ResearchProjectDefinition = {
  id: ResearchProjectId;
  name: string;
  scienceCost: number;
  prerequisiteIds: ResearchProjectId[];
  description: string;
  effects: ResearchEffect[];
};

export const RESEARCH_PROJECTS: Record<
  ResearchProjectId,
  ResearchProjectDefinition
> = {
  improved_survey_arrays: {
    id: "improved_survey_arrays",
    name: "Improved Survey Arrays",
    scienceCost: 1_500,
    prerequisiteIds: [],
    description: "Increases Survey Array EP/sec output by 25%.",
    effects: [
      {
        type: "primary_outpost_output_bonus",
        outpostId: "survey_array",
        amount: 0.25,
      }
    ]
  },

  commerce_optimization: {
    id: "commerce_optimization",
    name: "Commerce Optimization",
    scienceCost: 1_500,
    prerequisiteIds: [],
    description: "Increases Commerce Hub Credits/sec output by 25%.",
    effects: [
      {
        type: "primary_outpost_output_bonus",
        outpostId: "commerce_hub",
        amount: 0.25,
      }
    ]
  },

  applied_science_methods: {
    id: "applied_science_methods",
    name: "Applied Science Methods",
    scienceCost: 2_000,
    prerequisiteIds: [],
    description: "Increases Science Station Science/sec output by 25%.",
    effects: [
      {
        type: "primary_outpost_output_bonus",
        outpostId: "science_station",
        amount: 0.25,
      }
    ]
  },

  power_relay_efficiency: {
    id: "power_relay_efficiency",
    name: "Power Relay Efficiency",
    scienceCost: 2_500,
    prerequisiteIds: [],
    description: "Increases Power Relay Energy output by 25%.",
    effects: [
      {
        type: "primary_outpost_output_bonus",
        outpostId: "power_relay",
        amount: 0.25,
      }
    ]
  },

  extraction_handling: {
    id: "extraction_handling",
    name: "Extraction Handling",
    scienceCost: 2_000,
    prerequisiteIds: [],
    description: "Increases Extraction Rig Credits/sec output by 25%.",
    effects: [
      {
        type: "primary_outpost_output_bonus",
        outpostId: "extraction_rig",
        amount: 0.25,
      }
    ]
  },

  auxiliary_survey_instrumentation: {
    id: "auxiliary_survey_instrumentation",
    name: "Auxiliary Survey Instrumentation",
    scienceCost: 3_000,
    prerequisiteIds: ["improved_survey_arrays"],
    description:
      "Unlocks Survey Booster construction for Survey Array systems.",
    effects: [],
  },

  regional_trade_networks: {
    id: "regional_trade_networks",
    name: "Regional Trade Networks",
    scienceCost: 3_000,
    prerequisiteIds: ["commerce_optimization"],
    description:
      "Unlocks Local Market construction for Commerce Hub systems.",
    effects: [],
  },

  distributed_research_facilities: {
    id: "distributed_research_facilities",
    name: "Distributed Research Facilities",
    scienceCost: 4_000,
    prerequisiteIds: ["applied_science_methods"],
    description:
      "Unlocks Research Annex construction for Science Station systems.",
    effects: [],
  },

  localized_power_infrastructure: {
    id: "localized_power_infrastructure",
    name: "Localized Power Infrastructure",
    scienceCost: 4_500,
    prerequisiteIds: ["power_relay_efficiency"],
    description:
      "Unlocks Solar Grid construction for Power Relay systems.",
    effects: [],
  },

  industrial_refining_methods: {
    id: "industrial_refining_methods",
    name: "Industrial Refining Methods",
    scienceCost: 4_000,
    prerequisiteIds: ["extraction_handling"],
    description:
      "Unlocks Refinery construction for Extraction Rig systems.",
    effects: [],
  },

  outpost_tier_ii: {
    id: "outpost_tier_ii",
    name: "Outpost Tier II",
    scienceCost: 7_500,
    prerequisiteIds: [
      "improved_survey_arrays",
      "commerce_optimization",
      "applied_science_methods",
    ],
    description: "Future effect: unlock Tier II Outpost upgrades.",
    effects: [],
  },

  basic_influence_calibration: {
    id: "basic_influence_calibration",
    name: "Basic Influence Calibration",
    scienceCost: 5_000,
    prerequisiteIds: ["outpost_tier_ii"],
    description: "Future effect: prepare the first Influence reset.",
    effects: [],
  },
}

export const RESEARCH_PROJECT_IDS = Object.keys(
  RESEARCH_PROJECTS,
) as ResearchProjectId[];