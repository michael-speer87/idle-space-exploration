import type {
  AffinityLevel,
  AffinityProfile,
  HexCoord,
  StarMapState,
  StarSystem,
} from "../types";
import { getHexCoordsInRadius, getHexDistance, getHexId } from "./hexCoords";
import { getStarVisualForSystem } from "../config/systemRarity";
import { createSeededRandom, pickOne } from "./seededRandom";
import { createUniqueSystemName } from "../config/systemNames";

type GenerateHexMapOptions = {
  seed: number;
  radius: number;
};

const AFFINITY_KEYS = [
  "survey",
  "science",
  "commerce",
  "power",
  "extraction",
] as const satisfies readonly (keyof AffinityProfile)[];

const HIGH_AFFINITY_CHANCE = 0.35;

const NON_HIGH_AFFINITY_LEVELS: readonly AffinityLevel[] = [
  "low",
  "neutral",
  "neutral",
  "neutral",
];

export function generateHexMap(options: GenerateHexMapOptions): StarMapState {
  const random = createSeededRandom(options.seed);
  const coords = getHexCoordsInRadius(options.radius);

  const systemsById: StarMapState["systemsById"] = {};
  const systemIds: string[] = [];

  const usedSystemNames = new Set<string>([
    "Solace Prime",
  ]);

  for (const coord of coords) {
    const system = createStarSystem(coord, random, usedSystemNames);

    systemsById[system.id] = system;
    systemIds.push(system.id);
  }

  const homeSystemId = getHexId({ q: 0, r: 0 });
  const homeSystem = systemsById[homeSystemId];

  systemsById[homeSystemId] = {
    ...homeSystem,
    name: "Solace Prime",
    starVisual: "yellow",
    affinities: {
      survey: "neutral",
      science: "neutral",
      commerce: "neutral",
      power: "neutral",
      extraction: "neutral",
    },
    supportSlotCount: 1,
    explorationState: "surveyed",
    claimState: "claimed",
    isHome: true,
    hasGradCommand: true,
    surveyRequirement: 0,
    hazardId: null,
    modifierIds: [],
    primaryOutpostId: null,
    primaryOutpostLevel: 0,
    supportBuildingIds: [],
  };

  return {
    radius: options.radius,
    homeSystemId,
    systemIds,
    systemsById,
  };
}

function createStarSystem(
  coord: HexCoord,
  random: () => number,
  usedSystemNames: Set<string>,
): StarSystem {
  const id = getHexId(coord);
  const distanceFromHome = getHexDistance(coord);

  const affinities = createAffinityProfile(random);
  const supportSlotCount = createSupportSlotCount(random);

  return {
    id,
    name: 
      distanceFromHome === 0
        ? "Solace Prime"
        : createUniqueSystemName(random, usedSystemNames), 
    coord,

    starVisual: getStarVisualForSystem(
      affinities,
      supportSlotCount,
    ),
    affinities,

    supportSlotCount,

    explorationState: distanceFromHome <= 1 ? "detected" : "unknown",
    claimState: "unclaimed",

    isHome: false,
    hasGradCommand: false,

    surveyRequirement: 0,

    hazardId: null,
    modifierIds: [],

    primaryOutpostId: null,
    primaryOutpostLevel: 0,
    supportBuildingIds: [],
  };
}

function createAffinityProfile(random: () => number): AffinityProfile {
  const highAffinity =
    random() < HIGH_AFFINITY_CHANCE ? pickOne(random, AFFINITY_KEYS) : null;

  const profile: AffinityProfile = {
    survey: "neutral",
    science: "neutral",
    commerce: "neutral",
    power: "neutral",
    extraction: "neutral",
  };

  for (const affinityKey of AFFINITY_KEYS) {
    profile[affinityKey] =
      affinityKey === highAffinity
        ? "high"
        : pickOne(random, NON_HIGH_AFFINITY_LEVELS);
  }

  return profile;
}

function createSupportSlotCount(random: () => number): number {
  const roll = random();

  if (roll < 0.5) return 1;
  if (roll < 0.8) return 2;
  if (roll < 0.95) return 3;

  return 4;
}