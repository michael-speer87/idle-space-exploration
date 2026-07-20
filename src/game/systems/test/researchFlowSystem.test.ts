import { describe, expect, it } from "vitest";
import {
  calculateResearchFlow,
} from "../researchFlowSystem";

describe("calculateResearchFlow", () => {
  it("stores all fresh Science when no Research is active", () => {
    const result = calculateResearchFlow({
      freshSciencePerSecond: 20,
      researchCapacityPerSecond: 6,
      seconds: 2,
      hasActiveResearch: false,
      remainingResearch: 100,
    });

    expect(result).toEqual({
      freshScienceProduced: 40,
      researchProgressAdded: 0,
      scienceAddedToStorage: 40,
    });
  });

  it("routes all fresh Science when production is below capacity", () => {
    const result = calculateResearchFlow({
      freshSciencePerSecond: 4,
      researchCapacityPerSecond: 10,
      seconds: 2,
      hasActiveResearch: true,
      remainingResearch: 100,
    });

    expect(result).toEqual({
      freshScienceProduced: 8,
      researchProgressAdded: 8,
      scienceAddedToStorage: 0,
    });
  });

  it("limits Research progress to Academy capacity", () => {
    const result = calculateResearchFlow({
      freshSciencePerSecond: 20,
      researchCapacityPerSecond: 6,
      seconds: 1,
      hasActiveResearch: true,
      remainingResearch: 100,
    });

    expect(result).toEqual({
      freshScienceProduced: 20,
      researchProgressAdded: 6,
      scienceAddedToStorage: 14,
    });
  });

  it("stores excess Science when a project finishes during the interval", () => {
    const result = calculateResearchFlow({
      freshSciencePerSecond: 20,
      researchCapacityPerSecond: 6,
      seconds: 2,
      hasActiveResearch: true,
      remainingResearch: 5,
    });

    expect(result).toEqual({
      freshScienceProduced: 40,
      researchProgressAdded: 5,
      scienceAddedToStorage: 35,
    });
  });

  it("cannot make Research progress without Academy capacity", () => {
    const result = calculateResearchFlow({
      freshSciencePerSecond: 20,
      researchCapacityPerSecond: 0,
      seconds: 1,
      hasActiveResearch: true,
      remainingResearch: 100,
    });

    expect(result).toEqual({
      freshScienceProduced: 20,
      researchProgressAdded: 0,
      scienceAddedToStorage: 20,
    });
  });

  it("produces no flow when no time passes", () => {
    const result = calculateResearchFlow({
      freshSciencePerSecond: 20,
      researchCapacityPerSecond: 6,
      seconds: 0,
      hasActiveResearch: true,
      remainingResearch: 100,
    });

    expect(result).toEqual({
      freshScienceProduced: 0,
      researchProgressAdded: 0,
      scienceAddedToStorage: 0,
    });
  });
});