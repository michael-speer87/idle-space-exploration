import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { GameState } from "../../types";
import { createNewGame } from "../../createNewGame";
import {
  loadGame,
  migrateGameState,
} from "../saveSystem";

const SAVE_KEY =
  "idle-space-exploration.save.v1";

function createLocalStorage():
  Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },

    clear() {
      values.clear();
    },

    getItem(key) {
      return values.get(key) ?? null;
    },

    key(index) {
      return [...values.keys()][index] ?? null;
    },

    removeItem(key) {
      values.delete(key);
    },

    setItem(key, value) {
      values.set(key, value);
    },
  };
}

type LegacyResearchProjectState = {
  id: string;
  progress: number;
  isCompleted: boolean;
  completedRank?: number;
};

type Version3Fixture = {
  version: number;

  research: {
    projectsById: Record<
      string,
      LegacyResearchProjectState
    >;

    speedPerSecond?: number;
  };

  [key: string]: unknown;
};

function createVersion3Fixture():
  Version3Fixture {
  const fixture = JSON.parse(
    JSON.stringify(createNewGame()),
  ) as Version3Fixture;

  fixture.version = 3;
  fixture.research.speedPerSecond = 1;

  for (
    const projectState of
    Object.values(
      fixture.research.projectsById,
    )
  ) {
    delete projectState.completedRank;
  }

  return fixture;
}

function createVersion4Fixture():
  Version3Fixture {
  const fixture = createVersion3Fixture();

  fixture.version = 4;

  return fixture;
}

describe("Game-state version 5 migration", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "localStorage",
      createLocalStorage(),
    );
  });

  it(
    "creates new games with zero Goods",
    () => {
      const state = createNewGame();

      expect(state.version).toBe(5);
      expect(state.resources.goods).toBe(0);

      expect(
        state.research.projectsById
          .improved_survey_arrays
          .completedRank,
      ).toBe(0);
    },
  );

  it(
    "migrates completed projects to Rank I",
    () => {
      const legacyState =
        createVersion3Fixture();

      const project =
        legacyState.research.projectsById
          .improved_survey_arrays;

      project.progress = 1_500;
      project.isCompleted = true;

      const migratedState =
        migrateGameState(
          legacyState,
        ) as GameState;

      expect(migratedState.version).toBe(5);

      expect(
        migratedState.research.projectsById
          .improved_survey_arrays
          .completedRank,
      ).toBe(1);

      expect(
        migratedState.research.projectsById
          .improved_survey_arrays
          .progress,
      ).toBe(1_500);

      expect(
        migratedState.research.projectsById
          .improved_survey_arrays
          .isCompleted,
      ).toBe(true);
    },
  );

  it(
    "preserves unfinished progress at Rank 0",
    () => {
      const legacyState =
        createVersion3Fixture();

      const project =
        legacyState.research.projectsById
          .deep_range_telemetry;

      project.progress = 725;
      project.isCompleted = false;

      const migratedState =
        migrateGameState(
          legacyState,
        ) as GameState;

      expect(
        migratedState.research.projectsById
          .deep_range_telemetry
          .completedRank,
      ).toBe(0);

      expect(
        migratedState.research.projectsById
          .deep_range_telemetry
          .progress,
      ).toBe(725);

      expect(
        migratedState.research.projectsById
          .deep_range_telemetry
          .isCompleted,
      ).toBe(false);
    },
  );

  it(
    "removes obsolete stored Research speed",
    () => {
      const legacyState =
        createVersion3Fixture();

      const migratedState =
        migrateGameState(
          legacyState,
        ) as GameState & {
          research: {
            speedPerSecond?: number;
          };
        };

      expect(
        migratedState.research
          .speedPerSecond,
      ).toBeUndefined();
    },
  );

  it(
    "migrates version 4 missing Goods to zero",
    () => {
      const legacyState =
        createVersion4Fixture();

      delete (
        legacyState.resources as {
          goods?: number;
        }
      ).goods;

      const migratedState =
        migrateGameState(
          legacyState,
        ) as GameState;

      expect(migratedState.version).toBe(5);
      expect(migratedState.resources.goods).toBe(0);
    },
  );

  it(
    "preserves an existing numeric Goods value",
    () => {
      const legacyState =
        createVersion4Fixture();

      (
        legacyState.resources as {
          goods: number;
        }
      ).goods = 42;

      const migratedState =
        migrateGameState(
          legacyState,
        ) as GameState;

      expect(migratedState.version).toBe(5);
      expect(migratedState.resources.goods).toBe(42);
    },
  );

  it(
    "rejects version 5 with nonnumeric Goods",
    () => {
      const state = createNewGame() as unknown as {
        resources: {
          goods: unknown;
        };
      };

      state.resources.goods = "42";

      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(state),
      );

      expect(loadGame().status).toBe("corrupted");
    },
  );

  it(
    "rejects version 5 with missing Goods",
    () => {
      const state = createNewGame() as unknown as {
        resources: {
          goods?: number;
        };
      };

      delete state.resources.goods;

      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(state),
      );

      expect(loadGame().status).toBe("corrupted");
    },
  );
});
