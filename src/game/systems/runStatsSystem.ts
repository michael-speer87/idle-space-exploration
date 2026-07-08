import { RESEARCH_PROJECTS } from "../config/research";
import type { GameState } from "../types";
import {
  type PrimaryOutpostId,
} from "../config/outposts";

export type RunStatsSummary = {
    seed: number;
    saveVersion: number;

    totalSystems: number;
    claimedSystems: number;

    unknownSystems: number;
    detectedSystems: number;
    surveyingSystems: number;
    surveyedSystems: number;

    lifetimeInfluence: number;
    totalResets: number;

    activeSurveyLabel: string;
    activeSurveyProgressLabel: string;

    activeResearchLabel: string;
    activeResearchProgressLabel: string;

    outpostCountsById: Record<PrimaryOutpostId, number>;
};

export function getRunStatsSummary(state: GameState): RunStatsSummary {
  let claimedSystems = 0;
  let unknownSystems = 0;
  let detectedSystems = 0;
  let surveyingSystems = 0;
  let surveyedSystems = 0;

  const outpostCountsById: Record<PrimaryOutpostId, number> = {
    survey_array: 0,
    commerce_hub: 0,
    science_station: 0,
    power_relay: 0,
    extraction_rig: 0,
  };

  for (const systemId of state.map.systemIds) {
    const system = state.map.systemsById[systemId];

    if (system.claimState === "claimed") {
      claimedSystems += 1;
    }

    if (system.primaryOutpostId !== null) {
      outpostCountsById[system.primaryOutpostId] += 1;
    }

    switch (system.explorationState) {
      case "unknown":
        unknownSystems += 1;
        break;
      case "detected":
        detectedSystems += 1;
        break;
      case "surveying":
        surveyingSystems += 1;
        break;
      case "surveyed":
        surveyedSystems += 1;
        break;
    }
  }

  const activeSurvey = state.exploration.activeSurvey;
  const activeSurveySystem =
    activeSurvey !== null
      ? state.map.systemsById[activeSurvey.systemId]
      : null;

  const activeResearchId = state.research.activeProjectId;
  const activeResearchProject =
    activeResearchId !== null ? RESEARCH_PROJECTS[activeResearchId] : null;
  const activeResearchState =
    activeResearchId !== null
      ? state.research.projectsById[activeResearchId]
      : null;

  return {
    seed: state.seed,
    saveVersion: state.version,

    totalSystems: state.map.systemIds.length,
    claimedSystems,

    unknownSystems,
    detectedSystems,
    surveyingSystems,
    surveyedSystems,

    lifetimeInfluence: state.influence.lifetimeInfluence,
    totalResets: state.influence.totalResets,

    activeSurveyLabel:
      activeSurveySystem !== null ? activeSurveySystem.name : "None",

    activeSurveyProgressLabel:
      activeSurvey !== null
        ? `${activeSurvey.progress.toFixed(1)} / ${activeSurvey.requiredProgress.toFixed(1)}`
        : "None",

    activeResearchLabel:
      activeResearchProject !== null ? activeResearchProject.name : "None",

    activeResearchProgressLabel:
      activeResearchProject !== null && activeResearchState !== null
        ? `${activeResearchState.progress.toFixed(1)} / ${activeResearchProject.scienceCost.toFixed(1)}`
        : "None",

    outpostCountsById,
  };
}