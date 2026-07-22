import type { GameState, ResearchState } from "../types";
import {
  RESEARCH_PROGRAM_IDS,
  RESEARCH_PROGRAMS,
  type ResearchEffect,
  type ResearchProjectId,
  type ResearchRankDefinition,
} from "../config/research";
import type { PrimaryOutpostId } from "../config/outposts";

export function createInitialResearchState(): ResearchState {
  const projectsById = {} as ResearchState["projectsById"]

  for (const projectId of RESEARCH_PROGRAM_IDS) {
    projectsById[projectId] = {
      id: projectId,
      completedRank: 0,
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

  for (
    const projectId of
    RESEARCH_PROGRAM_IDS
  ) {
    const program =
      RESEARCH_PROGRAMS[projectId];

    const projectState =
      projectsById[projectId];

    if (projectState === undefined) {
      hasChanges = true;

      projectsById[projectId] = {
        id: projectId,
        completedRank: 0,
        progress: 0,
        isCompleted: false,
      };

      continue;
    }

    const rawCompletedRank =
      typeof projectState.completedRank ===
        "number" &&
        Number.isFinite(
          projectState.completedRank,
        )
        ? Math.floor(
          projectState.completedRank,
        )
        : projectState.isCompleted
          ? 1
          : 0;

    const completedRank = Math.min(
      program.ranks.length,
      Math.max(0, rawCompletedRank),
    );

    const isCompleted =
      completedRank >= program.ranks.length;

    if (
      completedRank !==
      projectState.completedRank ||
      isCompleted !== projectState.isCompleted
    ) {
      hasChanges = true;

      projectsById[projectId] = {
        ...projectState,
        completedRank,
        isCompleted,
      };
    }
  }

  const activeProjectId =
    research.activeProjectId;

  const activeProgram =
    activeProjectId !== null
      ? RESEARCH_PROGRAMS[activeProjectId]
      : undefined;

  const activeProjectState =
    activeProjectId !== null
      ? projectsById[activeProjectId]
      : undefined;

  const normalizedActiveProjectId =
    activeProjectId !== null &&
      activeProgram !== undefined &&
      activeProjectState !== undefined &&
      activeProjectState.completedRank <
      activeProgram.ranks.length
      ? activeProjectId
      : null;

  if (
    normalizedActiveProjectId !==
    research.activeProjectId
  ) {
    hasChanges = true;
  }

  if (!hasChanges) {
    return research;
  }

  return {
    ...research,
    activeProjectId:
      normalizedActiveProjectId,
    projectsById,
  };
}

export function getNextResearchRankDefinition(
  state: GameState,
  projectId: ResearchProjectId,
): ResearchRankDefinition | null {
  const program =
    RESEARCH_PROGRAMS[projectId];

  const projectState =
    state.research.projectsById[projectId];

  if (!program || !projectState) {
    return null;
  }

  return (
    program.ranks[
    projectState.completedRank
    ] ?? null
  );
}

export function isResearchProgramMastered(
  state: GameState,
  projectId: ResearchProjectId,
): boolean {
  const program =
    RESEARCH_PROGRAMS[projectId];

  const projectState =
    state.research.projectsById[projectId];

  if (!program || !projectState) {
    return false;
  }

  return (
    projectState.completedRank >=
    program.ranks.length
  );
}

export function canStartResearch(
  state: GameState,
  projectId: ResearchProjectId,
): boolean {
  const program =
    RESEARCH_PROGRAMS[projectId];

  const nextRank =
    getNextResearchRankDefinition(
      state,
      projectId,
    );

  if (!program || nextRank === null) {
    return false;
  }

  return program.prerequisites.every(
    ({
      programId,
      requiredRank,
    }) => {
      const prerequisiteState =
        state.research.projectsById[
        programId
        ];

      return (
        prerequisiteState !== undefined &&
        prerequisiteState.completedRank >=
        requiredRank
      );
    },
  );
}

export function getStartableResearchProjectIds(
  state: GameState,
): ResearchProjectId[] {
  return RESEARCH_PROGRAM_IDS.filter((projectId) =>
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
    state.research.projectsById[
    activeProjectId
    ];

  const nextRank =
    getNextResearchRankDefinition(
      state,
      activeProjectId,
    );

  if (
    !projectState ||
    nextRank === null
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
    nextRank.scienceCost -
    projectState.progress;

  if (remainingResearch <= 0) {
    return completeResearchRank(
      state,
      activeProjectId,
    );
  }

  const appliedProgress = Math.min(
    researchProgressAdded,
    remainingResearch,
  );

  const nextProgress =
    projectState.progress +
    appliedProgress;

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
    nextRank.scienceCost
  ) {
    return nextState;
  }

  return completeResearchRank(
    nextState,
    activeProjectId,
  );
}

export function isResearchCompleted(
  state: GameState,
  projectId: ResearchProjectId,
): boolean {
  return isResearchProgramMastered(
    state,
    projectId,
  );
}

function getCompletedResearchEffects(
  state: GameState,
): ResearchEffect[] {
  const completedEffects:
    ResearchEffect[] = [];

  for (
    const programId of
    RESEARCH_PROGRAM_IDS
  ) {
    const program =
      RESEARCH_PROGRAMS[programId];

    const programState =
      state.research.projectsById[
      programId
      ];

    if (!programState) {
      continue;
    }

    const completedRankCount =
      Math.min(
        program.ranks.length,

        Math.max(
          0,
          Math.floor(
            programState.completedRank,
          ),
        ),
      );

    const completedRanks =
      program.ranks.slice(
        0,
        completedRankCount,
      );

    for (
      const rank of completedRanks
    ) {
      completedEffects.push(
        ...rank.effects,
      );
    }
  }

  return completedEffects;
}

export function getResearchOutpostOutputBonus(
  state: GameState,
  outpostId: PrimaryOutpostId,
): number {
  let totalBonus = 0;

  for (
    const effect of
    getCompletedResearchEffects(state)
  ) {
    if (
      effect.type ===
        "primary_outpost_output_bonus" &&
      effect.outpostId === outpostId
    ) {
      totalBonus += effect.amount;
    }
  }

  return totalBonus;
}

export function getSurveyDistanceReduction(
  state: GameState,
): number {
  let totalReduction = 0;

  for (
    const effect of
    getCompletedResearchEffects(state)
  ) {
    if (
      effect.type ===
      "survey_distance_reduction"
    ) {
      totalReduction += effect.amount;
    }
  }

  return Math.min(
    1,
    Math.max(0, totalReduction),
  );
}

export function getResearchOutpostOutputMultiplier(
  state: GameState,
  outpostId: PrimaryOutpostId,
): number {
  return 1 + getResearchOutpostOutputBonus(state, outpostId);
}

function completeResearchRank(
  state: GameState,
  projectId: ResearchProjectId,
): GameState {
  const program =
    RESEARCH_PROGRAMS[projectId];

  const projectState =
    state.research.projectsById[
    projectId
    ];

  if (!program || !projectState) {
    return state;
  }

  const completedRank = Math.min(
    program.ranks.length,
    projectState.completedRank + 1,
  );

  const isCompleted =
    completedRank >=
    program.ranks.length;

  return {
    ...state,

    research: {
      ...state.research,

      activeProjectId:
        state.research.activeProjectId ===
          projectId
          ? null
          : state.research.activeProjectId,

      projectsById: {
        ...state.research.projectsById,

        [projectId]: {
          ...projectState,
          completedRank,
          progress: 0,
          isCompleted,
        },
      },
    },
  };
}