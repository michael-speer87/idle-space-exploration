import {
  TUTORIAL_STEPS,
  getNextTutorialStepId,
  getTutorialStepDefinition,
  isTutorialStepId,
  type TutorialStepDefinition,
  type TutorialStepId,
} from "../config/tutorial";

import type {
  GameState,
  TutorialState,
} from "../types";

import { calculateRates } from "./rateSystem";

const MATERIAL_TUTORIAL_TARGET = 10;

export function createInitialTutorialState(): TutorialState {
  return {
    status: "active",
    currentStepId: TUTORIAL_STEPS[0].id,
  };
}

export function ensureTutorialState(
  value: unknown,
): TutorialState {
  if (!isRecord(value)) {
    return createInitialTutorialState();
  }

  if (
    value.status === "active" &&
    isTutorialStepId(value.currentStepId)
  ) {
    return {
      status: "active",
      currentStepId: value.currentStepId,
    };
  }

  if (
    value.status === "completed" ||
    value.status === "skipped"
  ) {
    return {
      status: value.status,
      currentStepId: null,
    };
  }

  return createInitialTutorialState();
}

export function getCurrentTutorialStep(
  state: GameState,
): TutorialStepDefinition | null {
  if (
    state.tutorial.status !== "active" ||
    state.tutorial.currentStepId === null
  ) {
    return null;
  }

  return getTutorialStepDefinition(
    state.tutorial.currentStepId,
  );
}

export function getTutorialProgress(
  state: GameState,
): {
  currentStepNumber: number;
  totalStepCount: number;
} {
  const totalStepCount = TUTORIAL_STEPS.length;

  if (
    state.tutorial.status !== "active" ||
    state.tutorial.currentStepId === null
  ) {
    return {
      currentStepNumber: totalStepCount,
      totalStepCount,
    };
  }

  const currentIndex = TUTORIAL_STEPS.findIndex(
    (step) =>
      step.id === state.tutorial.currentStepId,
  );

  return {
    currentStepNumber:
      currentIndex >= 0 ? currentIndex + 1 : 1,

    totalStepCount,
  };
}

export function advanceTutorialProgress(
  state: GameState,
): GameState {
  if (
    state.tutorial.status !== "active" ||
    state.tutorial.currentStepId === null
  ) {
    return state;
  }

  if (
    !isTutorialStepComplete(
      state,
      state.tutorial.currentStepId,
    )
  ) {
    return state;
  }

  const nextStepId = getNextTutorialStepId(
    state.tutorial.currentStepId,
  );

  if (nextStepId === null) {
    return {
      ...state,

      tutorial: {
        status: "completed",
        currentStepId: null,
      },
    };
  }

  return {
    ...state,

    tutorial: {
      status: "active",
      currentStepId: nextStepId,
    },
  };
}

/**
 * Used when loading an existing save. It advances past
 * every tutorial objective that the save already satisfies.
 */
export function synchronizeTutorialProgress(
  state: GameState,
): GameState {
  let synchronizedState = state;

  for (
    let stepIndex = 0;
    stepIndex < TUTORIAL_STEPS.length;
    stepIndex += 1
  ) {
    const nextState =
      advanceTutorialProgress(synchronizedState);

    if (nextState === synchronizedState) {
      break;
    }

    synchronizedState = nextState;
  }

  return synchronizedState;
}

export function skipTutorial(
  state: GameState,
): GameState {
  if (state.tutorial.status !== "active") {
    return state;
  }

  return {
    ...state,

    tutorial: {
      status: "skipped",
      currentStepId: null,
    },
  };
}

export function resetTutorial(
  state: GameState,
): GameState {
  return {
    ...state,
    tutorial: createInitialTutorialState(),
  };
}

function isTutorialStepComplete(
  state: GameState,
  stepId: TutorialStepId,
): boolean {
  switch (stepId) {
    case "complete_first_survey":
      return getCompletedNonHomeSurveyCount(state) >= 1;

    case "build_survey_array":
      return hasPrimaryOutpost(state, "survey_array");

    case "complete_second_survey":
      return getCompletedNonHomeSurveyCount(state) >= 2;

    case "build_extraction_rig":
      return hasPrimaryOutpost(
        state,
        "extraction_rig",
      );

    case "accumulate_materials":
      return (
        state.resources.materials >=
        MATERIAL_TUTORIAL_TARGET
      );

    case "complete_third_survey":
      return getCompletedNonHomeSurveyCount(state) >= 3;

    case "build_commerce_hub":
      return hasPrimaryOutpost(state, "commerce_hub");

    case "establish_trade": {
      const rates = calculateRates(state);

      return (
        rates.materialSalesPerSecond > 0 &&
        rates.creditsPerSecond > 0
      );
    }
  }
}

function hasPrimaryOutpost(
  state: GameState,
  outpostId:
    | "survey_array"
    | "extraction_rig"
    | "commerce_hub",
): boolean {
  return state.map.systemIds.some((systemId) => {
    const system = state.map.systemsById[systemId];

    return (
      system.claimState === "claimed" &&
      system.primaryOutpostId === outpostId
    );
  });
}

function getCompletedNonHomeSurveyCount(
  state: GameState,
): number {
  return state.map.systemIds.filter((systemId) => {
    const system = state.map.systemsById[systemId];

    return (
      !system.isHome &&
      system.explorationState === "surveyed"
    );
  }).length;
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}