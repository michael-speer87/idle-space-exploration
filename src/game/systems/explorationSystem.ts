import type { GameState, StarSystemId } from "../types";
import { getHexId, getHexNeighbors } from "../map/hexCoords";
import { calculateRates } from "./rateSystem";
import {
  BASE_SURVEY_REQUIREMENT,
  SURVEY_REQUIREMENT_GROWTH_RATE,
} from "../config/exploration";

const FIRST_FREE_SURVEY_SPEED_PER_SECOND = 2;

export function canBeginSurvey(
  state: GameState,
  systemId: StarSystemId,
): boolean {
  const system = state.map.systemsById[systemId];

  if (!system) {
    return false;
  }

  if (state.exploration.activeSurvey !== null) {
    return false;
  }

  if (system.explorationState !== "detected") {
    return false;
  }

  if (!hasSurveyedNeighbor(state, systemId)) {
    return false;
  }

  if (state.exploration.firstFreeSurveyAvailable) {
    return true;
  }

  const rates = calculateRates(state);

  return rates.epPerSecond > 0;
}

export function getSurveyRequirementForSystem(
  state: GameState,
  systemId: StarSystemId,
): number {
  const system = state.map.systemsById[systemId];

  if (!system) {
    return BASE_SURVEY_REQUIREMENT;
  }

  if (system.isHome) {
    return 0;
  }

  const completedNonHomeSurveyCount = getCompletedNonHomeSurveyCount(state);

  return Math.ceil(
    BASE_SURVEY_REQUIREMENT *
      Math.pow(SURVEY_REQUIREMENT_GROWTH_RATE, completedNonHomeSurveyCount),
  );
}

export function getCompletedNonHomeSurveyCount(state: GameState): number {
  return state.map.systemIds.filter((systemId) => {
    const system = state.map.systemsById[systemId];

    return system.explorationState === "surveyed" && !system.isHome;
  }).length;
}

export function beginSurvey(
  state: GameState,
  systemId: StarSystemId,
): GameState {
  if (!canBeginSurvey(state, systemId)) {
    return state;
  }

  const system = state.map.systemsById[systemId];
  const rates = calculateRates(state);
  const isFirstFreeSurvey = state.exploration.firstFreeSurveyAvailable;
  const requiredProgress = getSurveyRequirementForSystem(state, systemId);

  return {
    ...state,

    exploration: {
      firstFreeSurveyAvailable: false,
      activeSurvey: {
        systemId,
        progress: 0,
        requiredProgress,
        speedPerSecond: isFirstFreeSurvey
          ? FIRST_FREE_SURVEY_SPEED_PER_SECOND
          : rates.epPerSecond,
        isFirstFreeSurvey,
      },
    },

    map: {
      ...state.map,
      systemsById: {
        ...state.map.systemsById,
        [systemId]: {
          ...system,
          explorationState: "surveying",
        },
      },
    },
  };
}

export function advanceActiveSurvey(
  state: GameState,
  seconds: number,
): GameState {
  const activeSurvey = state.exploration.activeSurvey;

  if (activeSurvey === null) {
    return state;
  }

  if (seconds <= 0) {
    return state;
  }

  const system = state.map.systemsById[activeSurvey.systemId];

  if (!system) {
    return {
      ...state,
      exploration: {
        ...state.exploration,
        activeSurvey: null,
      },
    };
  }

  const requiredProgress = activeSurvey.requiredProgress;

  const nextProgress = Math.min(
    requiredProgress,
    activeSurvey.progress + activeSurvey.speedPerSecond * seconds,
  );

  if (nextProgress < requiredProgress) {
    return {
      ...state,
      exploration: {
        ...state.exploration,
        activeSurvey: {
          ...activeSurvey,
          progress: nextProgress,
        },
      },
    };
  }

  return completeSurvey(state, activeSurvey.systemId);
}

function completeSurvey(
  state: GameState,
  systemId: StarSystemId,
): GameState {
  const system = state.map.systemsById[systemId];

  if (!system) {
    return state;
  }

  const systemsById = {
    ...state.map.systemsById,
    [systemId]: {
      ...system,
      explorationState: "surveyed" as const,
    },
  };

  for (const neighborCoord of getHexNeighbors(system.coord)) {
    const neighborId = getHexId(neighborCoord);
    const neighbor = systemsById[neighborId];

    if (!neighbor) {
      continue;
    }

    if (neighbor.explorationState !== "unknown") {
      continue;
    }

    systemsById[neighborId] = {
      ...neighbor,
      explorationState: "detected",
    };
  }

  return {
    ...state,

    exploration: {
      ...state.exploration,
      activeSurvey: null,
    },

    map: {
      ...state.map,
      systemsById,
    },
  };
}

function hasSurveyedNeighbor(
  state: GameState,
  systemId: StarSystemId,
): boolean {
  const system = state.map.systemsById[systemId];

  if (!system) {
    return false;
  }

  return getHexNeighbors(system.coord).some((neighborCoord) => {
    const neighborId = getHexId(neighborCoord);
    const neighbor = state.map.systemsById[neighborId];

    return (
      neighbor?.explorationState === "surveyed" ||
      neighbor?.claimState === "claimed"
    );
  });
}