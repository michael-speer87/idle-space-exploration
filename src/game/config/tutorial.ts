export const TUTORIAL_STEPS = [
  {
    id: "complete_first_survey",
    title: "Survey the Frontier",
    objective:
      "Select a detected neighboring system and complete the first free survey.",
    guidance:
      "GRaD has provided 100 Credits and enough starter Energy to establish the expedition.",
  },
  {
    id: "build_survey_array",
    title: "Establish Survey Operations",
    objective:
      "Build a Survey Array on the surveyed system.",
    guidance:
      "Survey Arrays generate the Exploration Power needed for future surveys.",
  },
  {
    id: "complete_second_survey",
    title: "Expand the Survey Network",
    objective:
      "Use your Survey Array to complete a second survey.",
    guidance:
      "Select a detected system adjacent to territory you have already surveyed.",
  },
  {
    id: "build_extraction_rig",
    title: "Begin Material Extraction",
    objective:
      "Build an Extraction Rig on a surveyed system.",
    guidance:
      "Extraction Rigs produce Materials and contribute storage to the global Material network.",
  },
  {
    id: "accumulate_materials",
    title: "Stockpile Materials",
    objective:
      "Accumulate at least 10 Materials.",
    guidance:
      "Watch the green storage gauge beside your Extraction Rig as the network fills.",
  },
  {
    id: "complete_third_survey",
    title: "Locate a Trade System",
    objective:
      "Complete a third survey to prepare another system for development.",
    guidance:
      "The next system will become the commercial side of the economy.",
  },
  {
    id: "build_commerce_hub",
    title: "Establish Commerce",
    objective:
      "Build a Commerce Hub on a surveyed system.",
    guidance:
      "Commerce Hubs sell Materials automatically and convert them into Credits.",
  },
  {
    id: "establish_trade",
    title: "Complete the Economic Cycle",
    objective:
      "Operate Extraction and Commerce until Materials are sold for Credits.",
    guidance:
      "Extraction supplies Materials, Commerce sells them, and the resulting Credits fund expansion.",
  },
] as const;

export type TutorialStepId =
  (typeof TUTORIAL_STEPS)[number]["id"];

export type TutorialStepDefinition =
  (typeof TUTORIAL_STEPS)[number];

export function getTutorialStepDefinition(
  stepId: TutorialStepId,
): TutorialStepDefinition {
  return TUTORIAL_STEPS.find(
    (step) => step.id === stepId,
  )!;
}

export function getNextTutorialStepId(
  stepId: TutorialStepId,
): TutorialStepId | null {
  const currentIndex = TUTORIAL_STEPS.findIndex(
    (step) => step.id === stepId,
  );

  const nextStep = TUTORIAL_STEPS[currentIndex + 1];

  return nextStep?.id ?? null;
}

export function isTutorialStepId(
  value: unknown,
): value is TutorialStepId {
  return (
    typeof value === "string" &&
    TUTORIAL_STEPS.some((step) => step.id === value)
  );
}