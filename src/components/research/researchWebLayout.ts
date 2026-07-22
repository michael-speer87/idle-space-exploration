import type {
  ResearchProjectId,
} from "../../game/config/research";

export type ResearchDirectorate =
  | "exploration"
  | "industrial"
  | "systems"
  | "command";

export const RESEARCH_DIRECTORATE_IDS:
  readonly ResearchDirectorate[] = [
    "exploration",
    "industrial",
    "systems",
    "command",
  ];

export type ResearchNodeKind =
  | "foundation"
  | "infrastructure"
  | "performance";

export type ResearchWebNodeLayout = {
  x: number;
  y: number;
  directorate: ResearchDirectorate;
  kind: ResearchNodeKind;
};

export type ResearchWebPointId =
  | ResearchProjectId
  | "research_core";

export type ResearchWebConnection = {
  from: ResearchWebPointId;
  to: ResearchProjectId;
};

export const RESEARCH_WEB_CENTER = {
  x: 50,
  y: 50,
} as const;

export const RESEARCH_WEB_LAYOUT = {
  /*
   * Exploration Directorate
   */

  improved_survey_arrays: {
    x: 50,
    y: 16,
    directorate: "exploration",
    kind: "foundation",
  },

  auxiliary_survey_instrumentation: {
    x: 39,
    y: 6,
    directorate: "exploration",
    kind: "infrastructure",
  },

  deep_range_telemetry: {
    x: 61,
    y: 6,
    directorate: "exploration",
    kind: "performance",
  },

  /*
   * Industrial Directorate
   */

  commerce_optimization: {
    x: 75,
    y: 31,
    directorate: "industrial",
    kind: "foundation",
  },

  regional_trade_networks: {
    x: 90,
    y: 19,
    directorate: "industrial",
    kind: "infrastructure",
  },

  interstellar_market_forecasting: {
    x: 94,
    y: 40,
    directorate: "industrial",
    kind: "performance",
  },

  extraction_handling: {
    x: 75,
    y: 69,
    directorate: "industrial",
    kind: "foundation",
  },

  industrial_refining_methods: {
    x: 90,
    y: 81,
    directorate: "industrial",
    kind: "infrastructure",
  },

  advanced_material_processing: {
    x: 94,
    y: 60,
    directorate: "industrial",
    kind: "performance",
  },

  /*
   * Systems Directorate
   */

  power_relay_efficiency: {
    x: 25,
    y: 31,
    directorate: "systems",
    kind: "foundation",
  },

  localized_power_infrastructure: {
    x: 10,
    y: 19,
    directorate: "systems",
    kind: "infrastructure",
  },

  adaptive_grid_balancing: {
    x: 6,
    y: 40,
    directorate: "systems",
    kind: "performance",
  },

  applied_science_methods: {
    x: 25,
    y: 69,
    directorate: "systems",
    kind: "foundation",
  },

  distributed_research_facilities: {
    x: 10,
    y: 81,
    directorate: "systems",
    kind: "infrastructure",
  },

  parallel_analysis_protocols: {
    x: 6,
    y: 60,
    directorate: "systems",
    kind: "performance",
  },
} satisfies Partial<
  Record<
    ResearchProjectId,
    ResearchWebNodeLayout
  >
>;

export const RESEARCH_WEB_PROJECT_IDS =
  Object.keys(
    RESEARCH_WEB_LAYOUT,
  ) as ResearchProjectId[];

export const RESEARCH_WEB_CONNECTIONS:
  ResearchWebConnection[] = [
    {
      from: "research_core",
      to: "improved_survey_arrays",
    },
    {
      from: "research_core",
      to: "commerce_optimization",
    },
    {
      from: "research_core",
      to: "applied_science_methods",
    },
    {
      from: "research_core",
      to: "power_relay_efficiency",
    },
    {
      from: "research_core",
      to: "extraction_handling",
    },

    {
      from: "improved_survey_arrays",
      to: "auxiliary_survey_instrumentation",
    },
    {
      from: "improved_survey_arrays",
      to: "deep_range_telemetry",
    },

    {
      from: "commerce_optimization",
      to: "regional_trade_networks",
    },
    {
      from: "commerce_optimization",
      to: "interstellar_market_forecasting",
    },

    {
      from: "applied_science_methods",
      to: "distributed_research_facilities",
    },
    {
      from: "applied_science_methods",
      to: "parallel_analysis_protocols",
    },

    {
      from: "power_relay_efficiency",
      to: "localized_power_infrastructure",
    },
    {
      from: "power_relay_efficiency",
      to: "adaptive_grid_balancing",
    },

    {
      from: "extraction_handling",
      to: "industrial_refining_methods",
    },
    {
      from: "extraction_handling",
      to: "advanced_material_processing",
    },
  ];