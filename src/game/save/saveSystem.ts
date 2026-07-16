import type { GameState } from "../types";
import { getSurveyRequirementForSystem } from "../systems/explorationSystem";
import { ensureResearchProjectStates } from "../systems/researchSystem";
import { ensureTutorialState, synchronizeTutorialProgress } from "../systems/tutorialSystem";
import { isTutorialStepId } from "../config/tutorial";

const SAVE_KEY = "idle-space-exploration.save.v1";
const CORRUPTED_SAVE_KEY_PREFIX = "idle-space-exploration.corrupted-save";

export type LoadGameResult =
  | {
    status: "loaded";
    gameState: GameState;
  }
  | {
    status: "missing";
  }
  | {
    status: "corrupted";
    backupKey: string;
  };

export function saveGame(state: GameState): void {
  const serializedState = JSON.stringify(state);

  localStorage.setItem(SAVE_KEY, serializedState);
}

export function loadGame(): LoadGameResult {
  const rawSave = localStorage.getItem(SAVE_KEY);

  if (rawSave === null) {
    return {
      status: "missing",
    };
  }

  try {
    const parsedSave: unknown = JSON.parse(rawSave)
    const migratedSave = migrateGameState(parsedSave);

    if (!isValidGameState(migratedSave)) {
      const backupKey = preserveCorruptedSave(rawSave);

      localStorage.removeItem(SAVE_KEY);

      return {
        status: "corrupted",
        backupKey
      };
    }

    const normalizedGameState =
      synchronizeTutorialProgress({
        ...migratedSave,

        research: ensureResearchProjectStates(
          migratedSave.research,
        ),

        tutorial: ensureTutorialState(
          migratedSave.tutorial,
        ),
      });

    return {
      status: "loaded",
      gameState: normalizedGameState,
    };
  } catch {
    const backupKey = preserveCorruptedSave(rawSave);

    localStorage.removeItem(SAVE_KEY);

    return {
      status: "corrupted",
      backupKey,
    };
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

function preserveCorruptedSave(rawSave: string): string {
  const backupKey = `${CORRUPTED_SAVE_KEY_PREFIX}.${Date.now()}`;

  localStorage.setItem(backupKey, rawSave);

  return backupKey;
}

function migrateGameState(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  if (value.version !== 1 &&
    value.version !== 2 &&
    value.version !== 3) {
    return value;
  }

  const influence = isRecord(value.influence)
    ? value.influence
    : {
      lifetimeInfluence: 0,
      totalResets: 0,
    };

  const resources = isRecord(value.resources)
    ? {
      ...value.resources,

      materials:
        typeof value.resources.materials === "number"
          ? value.resources.materials
          : 0,
    }
    : value.resources;

  const migratedValue = {
    ...value,

    version: 3,
    resources,
    influence,
    tutorial: ensureTutorialState(value.tutorial),
  };

  if (!isValidGameStateShapeForMigration(migratedValue)) {
    return migratedValue;
  }

  const activeSurvey = migratedValue.exploration.activeSurvey;
  const migratedSystemsById = migrateStarSystemsPrimaryOutpostLevel(
    migratedValue.map.systemsById,
  );

  if (migratedSystemsById !== migratedValue.map.systemsById) {
    return {
      ...migratedValue,
      map: {
        ...migratedValue.map,
        systemsById: migratedSystemsById,
      },
    };
  }

  if (
    isRecord(activeSurvey) &&
    typeof activeSurvey.systemId === "string" &&
    typeof activeSurvey.progress === "number" &&
    typeof activeSurvey.speedPerSecond === "number" &&
    typeof activeSurvey.isFirstFreeSurvey === "boolean" &&
    typeof activeSurvey.requiredProgress !== "number"
  ) {
    return {
      ...migratedValue,
      exploration: {
        ...migratedValue.exploration,
        activeSurvey: {
          ...activeSurvey,
          requiredProgress: getSurveyRequirementForSystem(
            migratedValue,
            activeSurvey.systemId,
          ),
        },
      },
    };
  }

  return migratedValue;
}

function isValidGameState(value: unknown): value is GameState {
  if (!isRecord(value)) {
    return false;
  }

  if (value.version !== 3) {
    return false;
  }

  if (typeof value.seed !== "number") {
    return false;
  }

  if (!isRecord(value.resources)) {
    return false;
  }

  if (typeof value.resources.credits !== "number") {
    return false;
  }

  if (typeof value.resources.science !== "number") {
    return false;
  }

  if (typeof value.resources.materials !== "number") {
    return false;
  }

  if (!isRecord(value.exploration)) {
    return false;
  }

  if (typeof value.exploration.firstFreeSurveyAvailable !== "boolean") {
    return false;
  }

  if (!isRecord(value.research)) {
    return false;
  }

  if (!isRecord(value.influence)) {
    return false;
  }

  if (typeof value.influence.lifetimeInfluence !== "number") {
    return false;
  }

  if (typeof value.influence.totalResets !== "number") {
    return false;
  }

  if (!isRecord(value.tutorial)) {
    return false;
  }

  if (
    value.tutorial.status !== "active" &&
    value.tutorial.status !== "completed" &&
    value.tutorial.status !== "skipped"
  ) {
    return false;
  }

  if (
    value.tutorial.status === "active" &&
    !isTutorialStepId(value.tutorial.currentStepId)
  ) {
    return false;
  }

  if (
    value.tutorial.status !== "active" &&
    value.tutorial.currentStepId !== null
  ) {
    return false;
  }

  if (!isRecord(value.map)) {
    return false;
  }

  if (typeof value.map.radius !== "number") {
    return false;
  }

  if (typeof value.map.homeSystemId !== "string") {
    return false;
  }

  if (!Array.isArray(value.map.systemIds)) {
    return false;
  }

  if (!isRecord(value.map.systemsById)) {
    return false;
  }

  if (
    value.selectedSystemId !== null &&
    typeof value.selectedSystemId !== "string"
  ) {
    return false;
  }

  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidGameStateShapeForMigration(
  value: unknown,
): value is GameState {
  if (!isRecord(value)) {
    return false;
  }

  if (!isRecord(value.exploration)) {
    return false;
  }

  if (!isRecord(value.map)) {
    return false;
  }

  if (!Array.isArray(value.map.systemIds)) {
    return false;
  }

  if (!isRecord(value.map.systemsById)) {
    return false;
  }

  return true;
}

function migrateStarSystemsPrimaryOutpostLevel(
  systemsById: Record<string, unknown>,
): Record<string, unknown> {
  let changed = false;
  const migratedSystemsById: Record<string, unknown> = {};

  for (const [systemId, systemValue] of Object.entries(systemsById)) {
    if (!isRecord(systemValue)) {
      migratedSystemsById[systemId] = systemValue;
      continue;
    }

    if (typeof systemValue.primaryOutpostLevel === "number") {
      migratedSystemsById[systemId] = systemValue;
      continue;
    }

    changed = true;

    migratedSystemsById[systemId] = {
      ...systemValue,
      primaryOutpostLevel:
        typeof systemValue.primaryOutpostId === "string" ? 1 : 0,
    };
  }

  return changed ? migratedSystemsById : systemsById;
}