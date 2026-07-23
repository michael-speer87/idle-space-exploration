import { describe, expect, it } from "vitest";
import { createNewGame } from "../../createNewGame";
import { calculateRates, calculateProductionEfficiency } from "../rateSystem";

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
      .completedRank = 1;

    const rates = calculateRates(state);

    expect(rates.epPerSecond).toBeCloseTo(1.2);
  });

  it("calculates Research Academy capacity without producing Science", () => {
    const state = createNewGame();

    const academySystem =
      state.map.systemsById["1,0"];

    academySystem.claimState = "claimed";
    academySystem.primaryOutpostId =
      "research_academy";
    academySystem.primaryOutpostLevel = 1;
    academySystem.affinities.science =
      "neutral";

    const rates = calculateRates(state);

    expect(
      rates.researchCapacityPerSecond,
    ).toBeCloseTo(1);

    expect(
      rates.sciencePerSecond,
    ).toBe(0);
  });
});

describe("calculateProductionEfficiency", () => {
  it("returns full efficiency when Energy demand is covered", () => {
    expect(
      calculateProductionEfficiency(100, 100),
    ).toBe(1);

    expect(
      calculateProductionEfficiency(125, 100),
    ).toBe(1);
  });

  it("gradually lowers efficiency as Energy coverage falls", () => {
    expect(
      calculateProductionEfficiency(90, 100),
    ).toBeCloseTo(0.91);

    expect(
      calculateProductionEfficiency(50, 100),
    ).toBeCloseTo(0.55);

    expect(
      calculateProductionEfficiency(10, 100),
    ).toBeCloseTo(0.19);
  });

  it("never falls below ten percent efficiency", () => {
    expect(
      calculateProductionEfficiency(0, 100),
    ).toBeCloseTo(0.1);

    expect(
      calculateProductionEfficiency(-50, 100),
    ).toBeCloseTo(0.1);
  });

  it("returns full efficiency when nothing uses Energy", () => {
    expect(
      calculateProductionEfficiency(0, 0),
    ).toBe(1);
  });
});