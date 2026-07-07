import type { GameState, StarSystemId } from "../types";
import {
  PRIMARY_OUTPOSTS,
  type PrimaryOutpostId,
} from "../config/outposts";
import { calculateRates } from "./rateSystem";

export const CLAIMABLE_PRIMARY_OUTPOST_IDS: readonly PrimaryOutpostId[] = [
  "survey_array",
  "commerce_hub",
  "science_station",
  "power_relay",
  "extraction_rig",
];

const STARTER_FREE_OUTPOST_IDS: readonly PrimaryOutpostId[] = [
  "survey_array",
  "commerce_hub",
];

export type OutpostClaimOption = {
  outpostId: PrimaryOutpostId;
  creditCost: number;
  canClaim: boolean;
  blockedReason: string | null;
};

export function getOutpostClaimOptions(
  state: GameState,
  systemId: StarSystemId,
): OutpostClaimOption[] {
  return CLAIMABLE_PRIMARY_OUTPOST_IDS.map((outpostId) => {
    const creditCost = getOutpostClaimCreditCost(state, outpostId);
    const blockedReason = getOutpostClaimBlockedReason(
      state,
      systemId,
      outpostId,
      creditCost,
    );

    return {
      outpostId,
      creditCost,
      canClaim: blockedReason === null,
      blockedReason,
    };
  });
}

export function getClaimableOutpostIds(
  state: GameState,
  systemId: StarSystemId,
): PrimaryOutpostId[] {
  return getOutpostClaimOptions(state, systemId)
    .filter((option) => option.canClaim)
    .map((option) => option.outpostId);
}

export function canClaimWithOutpost(
  state: GameState,
  systemId: StarSystemId,
  outpostId: PrimaryOutpostId,
): boolean {
  return (
    getOutpostClaimBlockedReason(
      state,
      systemId,
      outpostId,
      getOutpostClaimCreditCost(state, outpostId),
    ) === null
  );
}

export function claimWithOutpost(
  state: GameState,
  systemId: StarSystemId,
  outpostId: PrimaryOutpostId,
): GameState {
  if (!canClaimWithOutpost(state, systemId, outpostId)) {
    return state;
  }

  const system = state.map.systemsById[systemId];
  const creditCost = getOutpostClaimCreditCost(state, outpostId);

  return {
    ...state,

    resources: {
      ...state.resources,
      credits: state.resources.credits - creditCost,
    },

    map: {
      ...state.map,
      systemsById: {
        ...state.map.systemsById,
        [systemId]: {
          ...system,
          claimState: "claimed",
          primaryOutpostId: outpostId,
        },
      },
    },
  };
}

export function getOutpostClaimCreditCost(
  state: GameState,
  outpostId: PrimaryOutpostId,
): number {
  const isStarterFreeOutpost = STARTER_FREE_OUTPOST_IDS.includes(outpostId);
  const hasAlreadyClaimedThisOutpost = hasClaimedPrimaryOutpost(
    state,
    outpostId,
  );

  if (isStarterFreeOutpost && !hasAlreadyClaimedThisOutpost) {
    return 0;
  }

  return PRIMARY_OUTPOSTS[outpostId].claimCreditCost;
}

function getOutpostClaimBlockedReason(
  state: GameState,
  systemId: StarSystemId,
  outpostId: PrimaryOutpostId,
  creditCost: number,
): string | null {
  const system = state.map.systemsById[systemId];

  if (!system) {
    return "System does not exist.";
  }

  if (!CLAIMABLE_PRIMARY_OUTPOST_IDS.includes(outpostId)) {
    return "This outpost is not available yet.";
  }

  if (system.isHome) {
    return "Home System already contains GRaD Command.";
  }

  if (system.explorationState !== "surveyed") {
    return "Survey this system first.";
  }

  if (system.claimState !== "unclaimed") {
    return "System is already claimed.";
  }

  if (system.primaryOutpostId !== null) {
    return "System already has a primary outpost.";
  }

  const rates = calculateRates(state);

  if (rates.epPerSecond <= 0 && outpostId !== "survey_array") {
    return "Build a Survey Array first.";
  }

  if (state.resources.credits < creditCost) {
    return `Requires ${creditCost.toFixed(0)} Credits.`;
  }

  return null;
}

function hasClaimedPrimaryOutpost(
  state: GameState,
  outpostId: PrimaryOutpostId,
): boolean {
  return state.map.systemIds.some((systemId) => {
    const system = state.map.systemsById[systemId];

    return (
      system.claimState === "claimed" &&
      system.primaryOutpostId === outpostId
    );
  });
}