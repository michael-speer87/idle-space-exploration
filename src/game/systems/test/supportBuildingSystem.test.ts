import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createNewGame,
} from "../../createNewGame";

import {
  getSupportBuildingBuildOptions,
} from "../supportBuildingSystem";

function createSurveyArrayState() {
  const state = createNewGame();

  const system =
    state.map.systemsById["1,0"];

  system.explorationState =
    "surveyed";
  system.claimState = "claimed";
  system.primaryOutpostId =
    "survey_array";
  system.primaryOutpostLevel = 1;
  system.supportSlotCount = 1;
  system.supportBuildingIds = [];

  state.resources.credits = 1_000;

  return state;
}

describe(
  "Research-owned Support Building unlocks",
  () => {
    it(
      "derives the required program and rank from Research effects",
      () => {
        const state =
          createSurveyArrayState();

        const option =
          getSupportBuildingBuildOptions(
            state,
            "1,0",
          ).find(
            (buildOption) =>
              buildOption
                .supportBuildingId ===
              "survey_booster",
          );

        expect(
          option?.unlockRequirement,
        ).toEqual({
          programId:
            "auxiliary_survey_instrumentation",
          requiredRank: 1,
        });
      },
    );

    it(
      "blocks construction before the unlock rank is completed",
      () => {
        const state =
          createSurveyArrayState();

        const option =
          getSupportBuildingBuildOptions(
            state,
            "1,0",
          ).find(
            (buildOption) =>
              buildOption
                .supportBuildingId ===
              "survey_booster",
          );

        expect(option?.canBuild).toBe(
          false,
        );

        expect(
          option?.blockedReason,
        ).toBe(
          "Complete Auxiliary Survey Instrumentation Rank 1 first.",
        );
      },
    );

    it(
      "allows construction after the unlock rank is completed",
      () => {
        const state =
          createSurveyArrayState();

        state.research.projectsById
          .auxiliary_survey_instrumentation
          .completedRank = 1;

        const option =
          getSupportBuildingBuildOptions(
            state,
            "1,0",
          ).find(
            (buildOption) =>
              buildOption
                .supportBuildingId ===
              "survey_booster",
          );

        expect(option?.canBuild).toBe(
          true,
        );

        expect(
          option?.blockedReason,
        ).toBeNull();
      },
    );
  },
);