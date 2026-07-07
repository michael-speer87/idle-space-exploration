import type { GameState } from "../types";

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

    return {
      status: "loaded",
      gameState: migratedSave,
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

  if (value.version !== 1) {
    return value;
  }

  const influence = isRecord(value.influence)
    ? value.influence
    : {
      lifetimeInfluence: 0,
      totalResets: 0,
    };

  return {
    ...value,
    influence,
  };
}

function isValidGameState(value: unknown): value is GameState {
  if (!isRecord(value)) {
    return false;
  }

  if (value.version !== 1) {
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