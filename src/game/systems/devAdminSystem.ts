import type { GameState, StarSystemId } from "../types";
import { PRIMARY_OUTPOST_IDS, type PrimaryOutpostId, } from "../config/outposts";
import { getHexId, getHexNeighbors } from "../map/hexCoords";

export function devAddResources(
    state: GameState,
    resources: {
        credits?: number;
        science?: number;
    },
) : GameState {
    return {
        ...state,
        resources: {
            ...state.resources,
            credits: Math.max(0, state.resources.credits + (resources.credits ?? 0)),
            science: Math.max(0, state.resources.science + (resources.science ?? 0)),
        },
    };
}

export function devSurveySystem(
    state: GameState,
    systemId: StarSystemId,
): GameState {
    const system = state.map.systemsById[systemId]

    if (!system || system.isHome) {
        return state;
    }

    return {
        ...state,
        exploration: {
            ...state.exploration,
            activeSurvey:
                state.exploration.activeSurvey?.systemId === systemId
                    ? null
                    : state.exploration.activeSurvey
        },
        map: {
            ...state.map,
            systemsById: markSystemSurveyedAndDetectNeighbors(state, systemId),
        },
    };
}

export function devDetectAllSystems(state: GameState): GameState {
    const systemsById = { ...state.map.systemsById };

    for (const systemId of state.map.systemIds) {
        const system = systemsById[systemId]

        if (system.explorationState !== "unknown") {
            continue;
        }

        systemsById[systemId] = {
            ...system,
            explorationState: "detected",
        };
    }

    return {
        ...state,
        map: {
            ...state.map,
            systemsById,
        },
    };
}

export function devClaimWithOutpost(
    state: GameState,
    systemId: StarSystemId,
    outpostId: PrimaryOutpostId,
): GameState {
    const system = state.map.systemsById[systemId];

    if (!system || system.isHome) {
        return state;
    }

    if (!PRIMARY_OUTPOST_IDS.includes(outpostId)) {
        return state;
    }

    const systemsById = markSystemSurveyedAndDetectNeighbors(state, systemId);
    const surveyedSystem = systemsById[systemId];

    systemsById[systemId] = {
        ...surveyedSystem,
        claimState: "claimed",
        primaryOutpostId: outpostId,
        primaryOutpostLevel: 1
    };

    return {
        ...state,
        exploration: {
            ...state.exploration,
            activeSurvey:
                state.exploration.activeSurvey?.systemId === systemId
                    ? null
                    : state.exploration.activeSurvey,
        },
        map:{
            ...state.map,
            systemsById,
        },
    };
}

function markSystemSurveyedAndDetectNeighbors(
    state: GameState,
    systemId: StarSystemId,
): GameState["map"]["systemsById"] {
    const system = state.map.systemsById[systemId];

    if (!system) {
        return state.map.systemsById;
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

        if (!neighbor || neighbor.explorationState !== "unknown") {
            continue;
        }

        systemsById[neighborId] = {
            ...neighbor,
            explorationState: "detected"
        };
    }

    return systemsById
}