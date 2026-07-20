import { describe, expect, it } from "vitest";
import { createNewGame } from "../../createNewGame";
import { advanceGameTime } from "../timeSystem";

describe("Research flow integration", () => {
  it("routes fresh Science through Research Academy capacity", () => {
    const state = createNewGame();

    const scienceSystem =
      state.map.systemsById["1,0"];

    scienceSystem.claimState = "claimed";
    scienceSystem.primaryOutpostId =
      "science_station";
    scienceSystem.primaryOutpostLevel = 3;
    scienceSystem.affinities.science =
      "neutral";

    const academySystem =
      state.map.systemsById["0,1"];

    academySystem.claimState = "claimed";
    academySystem.primaryOutpostId =
      "research_academy";
    academySystem.primaryOutpostLevel = 1;
    academySystem.affinities.science =
      "neutral";

    state.research.activeProjectId =
      "improved_survey_arrays";

    const nextState =
      advanceGameTime(state, 1);

    expect(
      nextState.research.projectsById
        .improved_survey_arrays.progress,
    ).toBeCloseTo(1);

    expect(
      nextState.resources.science,
    ).toBeCloseTo(1);
  });

  it("does not spend stored Science without an Academy", () => {
    const state = createNewGame();

    state.resources.science = 100;

    const scienceSystem =
      state.map.systemsById["1,0"];

    scienceSystem.claimState = "claimed";
    scienceSystem.primaryOutpostId =
      "science_station";
    scienceSystem.primaryOutpostLevel = 1;
    scienceSystem.affinities.science =
      "neutral";

    state.research.activeProjectId =
      "improved_survey_arrays";

    const nextState =
      advanceGameTime(state, 1);

    expect(
      nextState.research.projectsById
        .improved_survey_arrays.progress,
    ).toBe(0);

    expect(
      nextState.resources.science,
    ).toBeCloseTo(101);
  });

  it("stores all fresh Science when no Research is active", () => {
    const state = createNewGame();

    const scienceSystem =
      state.map.systemsById["1,0"];

    scienceSystem.claimState = "claimed";
    scienceSystem.primaryOutpostId =
      "science_station";
    scienceSystem.primaryOutpostLevel = 1;
    scienceSystem.affinities.science =
      "neutral";

    const academySystem =
      state.map.systemsById["0,1"];

    academySystem.claimState = "claimed";
    academySystem.primaryOutpostId =
      "research_academy";
    academySystem.primaryOutpostLevel = 1;
    academySystem.affinities.science =
      "neutral";

    const nextState =
      advanceGameTime(state, 1);

    expect(
      nextState.resources.science,
    ).toBeCloseTo(1);

    expect(
      nextState.research.activeProjectId,
    ).toBeNull();
  });
});