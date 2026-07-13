import type { PrimaryOutpostId } from "./outposts";
import type { ResearchProjectId } from "./research";

export type SupportBuildingId =
    | "survey_booster"
    | "local_market"
    | "research_annex"
    | "solar_grid"
    | "refinery";

export type SupportBuildingDefinition = {
    id: SupportBuildingId;
    name: string;
    requiredPrimaryOutpostId: PrimaryOutpostId;
    unlockResearchId: ResearchProjectId;
    creditCost: number;
    outputBonus: number;
    description: string;
};

export const SUPPORT_BUILDINGS: Record<SupportBuildingId, SupportBuildingDefinition> = {
     survey_booster: {
    id: "survey_booster",
    name: "Survey Booster",
    requiredPrimaryOutpostId: "survey_array",
    unlockResearchId: "improved_survey_arrays",
    creditCost: 75,
    outputBonus: 0.15,
    description: "Increases this system's Survey Array EP output by 15%.",
  },

  local_market: {
    id: "local_market",
    name: "Local Market",
    requiredPrimaryOutpostId: "commerce_hub",
    unlockResearchId: "commerce_optimization",
    creditCost: 75,
    outputBonus: 0.15,
    description: "Increases this system's Commerce Hub Credit output by 15%.",
  },

  research_annex: {
    id: "research_annex",
    name: "Research Annex",
    requiredPrimaryOutpostId: "science_station",
    unlockResearchId: "applied_science_methods",
    creditCost: 100,
    outputBonus: 0.15,
    description: "Increases this system's Science Station output by 15%.",
  },

  solar_grid: {
    id: "solar_grid",
    name: "Solar Grid",
    requiredPrimaryOutpostId: "power_relay",
    unlockResearchId: "power_relay_efficiency",
    creditCost: 125,
    outputBonus: 0.15,
    description: "Increases this system's Power Relay Energy output by 15%.",
  },

  refinery: {
    id: "refinery",
    name: "Refinery",
    requiredPrimaryOutpostId: "extraction_rig",
    unlockResearchId: "extraction_handling",
    creditCost: 100,
    outputBonus: 0.15,
    description: "Increases this system's Extraction Rig output by 15%.",
  },
};

export const SUPPORT_BUILDING_IDS = Object.keys(
  SUPPORT_BUILDINGS,
) as SupportBuildingId[];