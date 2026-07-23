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

  | "deep_range_telemetry"
  | "interstellar_market_forecasting"
  | "parallel_analysis_protocols"
  | "adaptive_grid_balancing"
  | "advanced_material_processing"

  | "outpost_tier_ii"
  | "basic_influence_calibration";


export type ResearchEffect =
  | {
    type: "primary_outpost_output_bonus";
    outpostId: PrimaryOutpostId;
    amount: number;
  }
  | {
    type: "survey_distance_reduction";
    amount: number;
  };

export type ResearchProgramId =
  ResearchProjectId;

export type ResearchRankDefinition = {
  rank: number;
  scienceCost: number;
  description: string;
  effects: ResearchEffect[];
};

export type ResearchPrerequisite = {
  programId: ResearchProgramId;
  requiredRank: number;
};

export type ResearchProgramDefinition = {
  id: ResearchProgramId;
  name: string;
  prerequisites: ResearchPrerequisite[];
  ranks: ResearchRankDefinition[];
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
    description: "Increases Commerce Hub Material sales throughput by 25%.",
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
    description: "Increases Extraction Rig Material production by 25%.",
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

  deep_range_telemetry: {
    id: "deep_range_telemetry",
    name: "Deep Range Telemetry",
    scienceCost: 7_500,
    prerequisiteIds: ["improved_survey_arrays"],
    description:
      "Reduces the distance contribution to Survey requirements by 10%.",
    effects: [
      {
        type: "survey_distance_reduction",
        amount: 0.1,
      },
    ],
  },

  interstellar_market_forecasting: {
    id: "interstellar_market_forecasting",
    name: "Interstellar Market Forecasting",
    scienceCost: 7_500,
    prerequisiteIds: ["commerce_optimization"],
    description:
      "Increases Commerce Hub Material sales throughput by an additional 20%.",
    effects: [
      {
        type: "primary_outpost_output_bonus",
        outpostId: "commerce_hub",
        amount: 0.2,
      },
    ],
  },

  parallel_analysis_protocols: {
    id: "parallel_analysis_protocols",
    name: "Parallel Analysis Protocols",
    scienceCost: 9_000,
    prerequisiteIds: ["applied_science_methods"],
    description:
      "Increases Science Station output by an additional 20%.",
    effects: [
      {
        type: "primary_outpost_output_bonus",
        outpostId: "science_station",
        amount: 0.2,
      },
    ],
  },

  adaptive_grid_balancing: {
    id: "adaptive_grid_balancing",
    name: "Adaptive Grid Balancing",
    scienceCost: 8_500,
    prerequisiteIds: ["power_relay_efficiency"],
    description:
      "Increases Power Relay Energy output by an additional 20%.",
    effects: [
      {
        type: "primary_outpost_output_bonus",
        outpostId: "power_relay",
        amount: 0.2,
      },
    ],
  },

  advanced_material_processing: {
    id: "advanced_material_processing",
    name: "Advanced Material Processing",
    scienceCost: 8_000,
    prerequisiteIds: ["extraction_handling"],
    description:
      "Increases Extraction Rig Material production by an additional 20%.",
    effects: [
      {
        type: "primary_outpost_output_bonus",
        outpostId: "extraction_rig",
        amount: 0.2,
      },
    ],
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

export const RESEARCH_PROGRAM_IDS:
  ResearchProgramId[] = [
    ...RESEARCH_PROJECT_IDS,
  ];

const COMPATIBILITY_RESEARCH_PROGRAMS =
  Object.fromEntries(
    RESEARCH_PROGRAM_IDS.map((programId) => {
      const project =
        RESEARCH_PROJECTS[programId];

      const program:
        ResearchProgramDefinition = {
          id: project.id,
          name: project.name,

          prerequisites:
            project.prerequisiteIds.map(
              (prerequisiteId) => ({
                programId: prerequisiteId,
                requiredRank: 1,
              }),
            ),

          ranks: [
            {
              rank: 1,
              scienceCost:
                project.scienceCost,
              description:
                project.description,
              effects: project.effects,
            },
          ],
        };

      return [programId, program];
    }),
  ) as Record<
    ResearchProgramId,
    ResearchProgramDefinition
  >;

export const RESEARCH_PROGRAMS: Record<
  ResearchProgramId,
  ResearchProgramDefinition
> = {
  ...COMPATIBILITY_RESEARCH_PROGRAMS,

  improved_survey_arrays: {
    id: "improved_survey_arrays",
    name: "Integrated Survey Network",
    prerequisites: [],

    ranks: [
      {
        rank: 1,
        scienceCost: 1_500,
        description:
          "Links Survey Arrays through a shared coordination network, increasing Survey EP output by 5%.",

        effects: [
          {
            type:
              "primary_outpost_output_bonus",
            outpostId: "survey_array",
            amount: 0.05,
          },
        ],
      },

      {
        rank: 2,
        scienceCost: 4_500,
        description:
          "Expands synchronization coverage, increasing Survey EP output by an additional 5%.",

        effects: [
          {
            type:
              "primary_outpost_output_bonus",
            outpostId: "survey_array",
            amount: 0.05,
          },
        ],
      },

      {
        rank: 3,
        scienceCost: 12_000,
        description:
          "Completes network-wide Survey coordination, increasing Survey EP output by an additional 5%.",

        effects: [
          {
            type:
              "primary_outpost_output_bonus",
            outpostId: "survey_array",
            amount: 0.05,
          },
        ],
      },
    ],
  },
};