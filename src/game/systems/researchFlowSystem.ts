export type ResearchFlowInput = {
    freshSciencePerSecond: number;
    researchCapacityPerSecond: number;
    seconds: number;
    hasActiveResearch: boolean;
    remainingResearch: number;
}

export type ResearchFlowResult = {
  freshScienceProduced: number;
  researchProgressAdded: number;
  scienceAddedToStorage: number;
};

export function calculateResearchFlow({
  freshSciencePerSecond,
  researchCapacityPerSecond,
  seconds,
  hasActiveResearch,
  remainingResearch,
}: ResearchFlowInput): ResearchFlowResult {
  const safeSeconds = Math.max(0, seconds);

  const freshScienceProduced =
    Math.max(0, freshSciencePerSecond) *
    safeSeconds;

  if (!hasActiveResearch) {
    return {
      freshScienceProduced,
      researchProgressAdded: 0,
      scienceAddedToStorage:
        freshScienceProduced,
    };
  }

  const availableResearchCapacity =
    Math.max(0, researchCapacityPerSecond) *
    safeSeconds;

  const researchProgressAdded = Math.min(
    freshScienceProduced,
    availableResearchCapacity,
    Math.max(0, remainingResearch),
  );

  return {
    freshScienceProduced,
    researchProgressAdded,
    scienceAddedToStorage:
      freshScienceProduced -
      researchProgressAdded,
  };
}