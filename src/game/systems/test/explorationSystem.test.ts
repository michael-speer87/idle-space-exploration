import { describe, expect, it } from "vitest";
import { createNewGame } from "../../createNewGame";
import {
  advanceActiveSurvey,
  getActiveSurveySpeed,
  getSurveyRequirementForSystem,
} from "../explorationSystem";
import {
  getSurveyDistanceReduction,
} from "../researchSystem";
import { calculateRates } from "../rateSystem";

const DISTANCE_TWO_SYSTEM_ID = "2,0";

describe("Survey distance requirements", () => {
  it("uses the base distance coefficient without Research", () => {
    const state = createNewGame();

    expect(
      getSurveyDistanceReduction(state),
    ).toBe(0);

    expect(
      getSurveyRequirementForSystem(
        state,
        DISTANCE_TWO_SYSTEM_ID,
      ),
    ).toBe(24);
  });

  it("applies Deep Range Telemetry only to the distance contribution", () => {
    const state = createNewGame();

    state.research.projectsById
      .deep_range_telemetry
      .isCompleted = true;

    expect(
      getSurveyDistanceReduction(state),
    ).toBeCloseTo(0.1);

    expect(
      getSurveyRequirementForSystem(
        state,
        DISTANCE_TWO_SYSTEM_ID,
      ),
    ).toBe(23);
  });
});

describe("Active Survey speed", () => {
  it("uses current EP production instead of the stored launch speed", () => {
    const state = createNewGame();

    const homeSystem =
      state.map.systemsById[state.map.homeSystemId];

    homeSystem.claimState = "claimed";
    homeSystem.primaryOutpostId = "survey_array";
    homeSystem.primaryOutpostLevel = 1;

    const targetSystem =
      state.map.systemsById["1,0"];

    targetSystem.explorationState = "surveying";

    state.exploration.firstFreeSurveyAvailable = false;
    state.exploration.activeSurvey = {
      systemId: targetSystem.id,
      progress: 0,
      requiredProgress: 1_000,

      // Deliberately wrong legacy value.
      speedPerSecond: 999,

      isFirstFreeSurvey: false,
    };

    const expectedLiveSpeed =
      calculateRates(state).epPerSecond;

    expect(
      getActiveSurveySpeed(state),
    ).toBeCloseTo(expectedLiveSpeed);

    const advancedState =
      advanceActiveSurvey(state, 1);

    expect(
      advancedState.exploration.activeSurvey?.progress,
    ).toBeCloseTo(expectedLiveSpeed);
  });

  it("keeps the first free Survey at its fixed speed", () => {
    const state = createNewGame();

    const targetSystem =
      state.map.systemsById["1,0"];

    targetSystem.explorationState = "surveying";

    state.exploration.activeSurvey = {
      systemId: targetSystem.id,
      progress: 0,
      requiredProgress: 100,

      // This should also be ignored.
      speedPerSecond: 999,

      isFirstFreeSurvey: true,
    };

    expect(
      getActiveSurveySpeed(state),
    ).toBe(2);

    const advancedState =
      advanceActiveSurvey(state, 1);

    expect(
      advancedState.exploration.activeSurvey?.progress,
    ).toBeCloseTo(2);
  });
});