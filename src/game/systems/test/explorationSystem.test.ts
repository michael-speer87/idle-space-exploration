import { describe, expect, it } from "vitest";
import { createNewGame } from "../../createNewGame";
import {
  getSurveyRequirementForSystem,
} from "../explorationSystem";
import {
  getSurveyDistanceReduction,
} from "../researchSystem";

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