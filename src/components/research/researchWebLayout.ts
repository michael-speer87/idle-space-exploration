import type { ResearchProjectId } from "../../game/config/research";

export type ResearchDiscipline =
  | "survey"
  | "commerce"
  | "science"
  | "power"
  | "extraction";

export type ResearchNodeKind =
  | "foundation"
  | "infrastructure"
  | "performance";

export type ResearchWebNodeLayout = {
  x: number;
  y: number;
  discipline: ResearchDiscipline;
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
  improved_survey_arrays: {
    x: 50,
    y: 18,
    discipline: "survey",
    kind: "foundation",
  },

  auxiliary_survey_instrumentation: {
    x: 39,
    y: 6,
    discipline: "survey",
    kind: "infrastructure",
  },

  deep_range_telemetry: {
    x: 61,
    y: 6,
    discipline: "survey",
    kind: "performance",
  },

  commerce_optimization: {
    x: 78,
    y: 35,
    discipline: "commerce",
    kind: "foundation",
  },

  regional_trade_networks: {
    x: 90,
    y: 22,
    discipline: "commerce",
    kind: "infrastructure",
  },

  interstellar_market_forecasting: {
    x: 94,
    y: 40,
    discipline: "commerce",
    kind: "performance",
  },

  applied_science_methods: {
    x: 68,
    y: 72,
    discipline: "science",
    kind: "foundation",
  },

  distributed_research_facilities: {
    x: 80,
    y: 88,
    discipline: "science",
    kind: "infrastructure",
  },

  parallel_analysis_protocols: {
    x: 61,
    y: 92,
    discipline: "science",
    kind: "performance",
  },

  extraction_handling: {
    x: 32,
    y: 72,
    discipline: "extraction",
    kind: "foundation",
  },

  industrial_refining_methods: {
    x: 20,
    y: 88,
    discipline: "extraction",
    kind: "infrastructure",
  },

  advanced_material_processing: {
    x: 39,
    y: 92,
    discipline: "extraction",
    kind: "performance",
  },

  power_relay_efficiency: {
    x: 22,
    y: 35,
    discipline: "power",
    kind: "foundation",
  },

  localized_power_infrastructure: {
    x: 10,
    y: 22,
    discipline: "power",
    kind: "infrastructure",
  },

  adaptive_grid_balancing: {
    x: 6,
    y: 40,
    discipline: "power",
    kind: "performance",
  },
} satisfies Partial<
  Record<ResearchProjectId, ResearchWebNodeLayout>
>;

export const RESEARCH_WEB_PROJECT_IDS = Object.keys(
  RESEARCH_WEB_LAYOUT,
) as ResearchProjectId[];

export const RESEARCH_WEB_CONNECTIONS: ResearchWebConnection[] = [
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