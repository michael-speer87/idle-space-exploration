import {
  describe,
  expect,
  it,
} from "vitest";

import type { GameState } from "../../types";
import { createNewGame } from "../../createNewGame";
import { migrateGameState } from "../saveSystem";

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

describe("Game-state version 4 migration", () => {
  it(
    "creates new games using version 4 rank state",
    () => {
      const state = createNewGame();

      expect(state.version).toBe(4);

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

      expect(migratedState.version).toBe(4);

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
});