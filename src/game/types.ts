import type { PrimaryOutpostId } from "./config/outposts";
import type { ResearchProjectId } from "./config/research";
import type { SupportBuildingId } from "./config/supportBuildings";
import type { TutorialStepId } from "./config/tutorial";

export type GameVersion = 4;

export type StarSystemId = string;

export type HexCoord = {
  q: number;
  r: number;
};

export type StarVisual = "yellow" | "red" | "blue" | "white" | "orange";

export type AffinityLevel = "low" | "neutral" | "high";

export type AffinityProfile = {
  survey: AffinityLevel;
  science: AffinityLevel;
  commerce: AffinityLevel;
  power: AffinityLevel;
  extraction: AffinityLevel;
};

export type ExplorationState =
  | "unknown"
  | "detected"
  | "surveying"
  | "surveyed";

export type ClaimState = "unclaimed" | "claimed";

export type TutorialStatus =
  | "active"
  | "completed"
  | "skipped";

export type TutorialState = {
  status: TutorialStatus;
  currentStepId: TutorialStepId | null;
}

export type ResearchProjectState = {
  id: ResearchProjectId;
  completedRank: number;
  progress: number;

  // Temporary compatibility field.
  // The ranked lifecycle will replace this.
  isCompleted: boolean;
};

export type StarSystem = {
  id: StarSystemId;
  name: string;
  coord: HexCoord;

  starVisual: StarVisual;
  affinities: AffinityProfile;

  supportSlotCount: number;

  explorationState: ExplorationState;
  claimState: ClaimState;

  isHome: boolean;
  hasGradCommand: boolean;

  surveyRequirement: number;

  hazardId: string | null;
  modifierIds: string[];

  primaryOutpostId: PrimaryOutpostId | null;
  primaryOutpostLevel: number;
  supportBuildingIds: SupportBuildingId[];
};

export type StarMapState = {
  radius: number;
  homeSystemId: StarSystemId;
  systemIds: StarSystemId[];
  systemsById: Record<StarSystemId, StarSystem>;
};

export type ResourceState = {
  credits: number;
  science: number;
  materials: number;
};

export type ResearchState = {
  activeProjectId: ResearchProjectId | null;
  projectsById: Record<ResearchProjectId, ResearchProjectState>;
};

export type InfluenceState = {
  lifetimeInfluence: number;
  totalResets: number;
}

export type ActiveSurveyState = {
  systemId: StarSystemId;
  progress: number;
  requiredProgress: number;
  isFirstFreeSurvey: boolean;
};

export type ExplorationRunState = {
  firstFreeSurveyAvailable: boolean;
  activeSurvey: ActiveSurveyState | null;
};

export type GameState = {
  version: GameVersion;
  seed: number;

  resources: ResourceState;
  exploration: ExplorationRunState;
  research: ResearchState;
  influence: InfluenceState;
  tutorial: TutorialState;
  map: StarMapState;

  selectedSystemId: StarSystemId | null;
};