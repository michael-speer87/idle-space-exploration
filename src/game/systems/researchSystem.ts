import type { GameState, ResearchState } from "../types";
import {
    RESEARCH_PROJECTS,
    RESEARCH_PROJECT_IDS,
    type ResearchProjectId,
} from "../config/research"

const DEFAULT_RESEARCH_SPEED_PER_SECOND = 1;

export function createInitialResearchState(): ResearchState {
    const projectsById = {} as ResearchState["projectsById"]

    for (const projectId of RESEARCH_PROJECT_IDS) {
        projectsById[projectId] = {
            id: projectId,
            progress: 0,
            isCompleted: false,
        };
    }

    return {
        activeProjectId: null,
        speedPerSecond: DEFAULT_RESEARCH_SPEED_PER_SECOND,
        projectsById,
    };
}

export function canStartResearch(
    state: GameState,
    projectId: ResearchProjectId,
): boolean {
    const projectState = state.research.projectsById[projectId];
    const projectDefinition = RESEARCH_PROJECTS[projectId];

    if (!projectState || !projectDefinition) {
        return false;
    }

    if (projectState.isCompleted) {
        return false;
    }

    return projectDefinition.prerequisiteIds.every((prerequisiteId) => {
        return state.research.projectsById[prerequisiteId]?.isCompleted === true;
    });
}

export function getStartableResearchProjectIds(
    state: GameState,
): ResearchProjectId[] {
    return RESEARCH_PROJECT_IDS.filter((projectId) => 
        canStartResearch(state, projectId),
    );
}

export function startResearch(
    state: GameState,
    projectId: ResearchProjectId,
): GameState {
    if (!canStartResearch(state, projectId)) {
        return state;
    }

    if (state.research.activeProjectId === projectId) {
        return state;
    }

    return {
        ...state,
        research: {
            ...state.research,
            activeProjectId: projectId,
        },
    };
}

export function advanceActiveResearch(
    state: GameState,
    seconds: number,
): GameState {
    const activeProjectId = state.research.activeProjectId;

    if (activeProjectId === null) {
        return state;
    }

    if (seconds <= 0) {
        return state;
    }

    const projectState = state.research.projectsById[activeProjectId];
    const projectDefinition = RESEARCH_PROJECTS[activeProjectId];

    if (!projectState || !projectDefinition || projectState.isCompleted) {
        return {
            ...state,
            research: {
                ...state.research,
                activeProjectId: null,
            },
        };
    }

    const remainingScienceNeeded = 
        projectDefinition.scienceCost - projectState.progress;

    if (remainingScienceNeeded <= 0) {
        return completeResearchProject(state, activeProjectId);
    }

    const maxScienceToSpend = state.research.speedPerSecond * seconds;

    const scienceSpent = Math.min(
        state.resources.science,
        maxScienceToSpend,
        remainingScienceNeeded,
    );

    if (scienceSpent <= 0) {
        return state;
    }

    const nextProgress = projectState.progress + scienceSpent;

    if (nextProgress < projectDefinition.scienceCost) {
        return {
            ...state,

            resources: {
                ...state.resources,
                science: state.resources.science - scienceSpent,
            },

            research: {
                ...state.research,
                projectsById: {
                    ...state.research.projectsById,
                    [activeProjectId]: {
                        ...projectState,
                        progress: nextProgress,
                    },
                },
            },
        };
    }

    return completeResearchProject(
        {
            ...state,

            resources: {
                ...state.resources,
                science: state.resources.science - scienceSpent,
            },

            research: {
                ...state.research,
                projectsById: {
                    ...state.research.projectsById,
                    [activeProjectId]: {
                        ...projectState,
                        progress: projectDefinition.scienceCost,
                    },
                },
            },
        },
        activeProjectId,
    );
}

function completeResearchProject(
    state: GameState,
    projectId: ResearchProjectId,
): GameState {
    const projectState = state.research.projectsById[projectId];

    if (!projectState) {
        return state;
    }

    return {
        ...state,

        research: {
            ...state.research,
            activeProjectId:
                state.research.activeProjectId === projectId
                    ? null
                    : state.research.activeProjectId,
            projectsById: {
                ...state.research.projectsById,
                [projectId]: {
                    ...projectState,
                    isCompleted: true,
                },
            },
        },
    };
}