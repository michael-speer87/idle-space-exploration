import type { GameState, ResearchState } from "../types";
import {
    RESEARCH_PROJECTS,
    RESEARCH_PROJECT_IDS,
    type ResearchProjectId,
} from "../config/research"
import type { PrimaryOutpostId } from "../config/outposts";

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
        projectsById,
    };
}

export function ensureResearchProjectStates(
  research: ResearchState,
): ResearchState {
  let hasChanges = false;

  const projectsById = {
    ...research.projectsById,
  };

  for (const projectId of RESEARCH_PROJECT_IDS) {
    if (projectsById[projectId] !== undefined) {
      continue;
    }

    hasChanges = true;

    projectsById[projectId] = {
      id: projectId,
      progress: 0,
      isCompleted: false,
    };
  }

  const activeProjectId =
    research.activeProjectId !== null &&
    RESEARCH_PROJECTS[research.activeProjectId] !== undefined
      ? research.activeProjectId
      : null;

  if (activeProjectId !== research.activeProjectId) {
    hasChanges = true;
  }

  if (!hasChanges) {
    return research;
  }

  return {
    ...research,
    activeProjectId,
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

export function applyResearchProgress(
  state: GameState,
  researchProgressAdded: number,
): GameState {
  const activeProjectId =
    state.research.activeProjectId;

  if (activeProjectId === null) {
    return state;
  }

  const projectState =
    state.research.projectsById[activeProjectId];

  const projectDefinition =
    RESEARCH_PROJECTS[activeProjectId];

  if (
    !projectState ||
    !projectDefinition ||
    projectState.isCompleted
  ) {
    return {
      ...state,

      research: {
        ...state.research,
        activeProjectId: null,
      },
    };
  }

  if (researchProgressAdded <= 0) {
    return state;
  }

  const remainingResearch =
    projectDefinition.scienceCost -
    projectState.progress;

  if (remainingResearch <= 0) {
    return completeResearchProject(
      state,
      activeProjectId,
    );
  }

  const appliedProgress = Math.min(
    researchProgressAdded,
    remainingResearch,
  );

  const nextProgress =
    projectState.progress + appliedProgress;

  const nextState: GameState = {
    ...state,

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

  if (
    nextProgress <
    projectDefinition.scienceCost
  ) {
    return nextState;
  }

  return completeResearchProject(
    nextState,
    activeProjectId,
  );
}

export function isResearchCompleted(
    state: GameState,
    projectId: ResearchProjectId,
): boolean {
    return state.research.projectsById[projectId]?.isCompleted === true;
}

export function getResearchOutpostOutputBonus(
    state: GameState,
    outpostId: PrimaryOutpostId,
): number {
    let totalBonus = 0;

    for (const projectId of RESEARCH_PROJECT_IDS) {
        if (!isResearchCompleted(state, projectId)) {
            continue;
        }

        const project = RESEARCH_PROJECTS[projectId];

        for (const effect of project.effects) {
            if (
                effect.type === "primary_outpost_output_bonus" &&
                effect.outpostId === outpostId
            ) {
                totalBonus += effect.amount;
            }
        }
    }

    return totalBonus;
}

export function getSurveyDistanceReduction(
  state: GameState,
): number {
  let totalReduction = 0;

  for (const projectId of RESEARCH_PROJECT_IDS) {
    if (!isResearchCompleted(state, projectId)) {
      continue;
    }

    const project = RESEARCH_PROJECTS[projectId];

    for (const effect of project.effects) {
      if (effect.type === "survey_distance_reduction") {
        totalReduction += effect.amount;
      }
    }
  }

  return Math.min(1, Math.max(0, totalReduction));
}

export function getResearchOutpostOutputMultiplier(
    state: GameState,
    outpostId: PrimaryOutpostId,
): number {
    return 1 + getResearchOutpostOutputBonus(state, outpostId);
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