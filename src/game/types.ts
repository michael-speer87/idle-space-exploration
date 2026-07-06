import type { PrimaryOutpostId } from "./config/outposts";

export type GameVersion = 1;

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
  supportBuildingIds: string[];
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
};

export type ActiveSurveyState = {
  systemId: StarSystemId;
  progress: number;
  speedPerSecond: number;
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
  map: StarMapState;

  selectedSystemId: StarSystemId | null;
};