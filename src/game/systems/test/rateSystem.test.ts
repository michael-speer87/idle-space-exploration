import { describe, expect, it } from "vitest";
import { createNewGame } from "../../createNewGame";
import { calculateRates } from "../rateSystem";

describe("calculateRates", () => {
  it("adds Research and Support Building output bonuses together", () => {
    const state = createNewGame();

    const homeSystem =
      state.map.systemsById[state.map.homeSystemId];

    homeSystem.primaryOutpostId = "survey_array";
    homeSystem.primaryOutpostLevel = 1;
    homeSystem.affinities.survey = "neutral";
    homeSystem.supportBuildingIds = [
      "survey_booster",
    ];

    state.research.projectsById
      .improved_survey_arrays
      .isCompleted = true;

    const rates = calculateRates(state);

    expect(rates.epPerSecond).toBeCloseTo(1.4);
  });
});