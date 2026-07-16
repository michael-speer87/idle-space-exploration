import type { GameState, StarSystemId } from "../types";
import {
  getExtractionStorageCapacity,
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

export type OutpostClaimOption = {
  outpostId: PrimaryOutpostId;
  creditCost: number;
  canClaim: boolean;
  blockedReason: string | null;
};

export type PrimaryOutpostUpgradeOption = {
  canUpgrade: boolean;
  creditCost: number;
  currentLevel: number;
  nextLevel: number;
  blockedReason: string | null;
};

export type PrimaryOutpostDecommissionPreview = {
  canDecommission: boolean;
  supportBuildingsRemoved: number;
  materialCapacityLost: number;
  materialOverflowLost: number;
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
          primaryOutpostLevel: 1,
        },
      },
    },
  };
}

export function getOutpostClaimCreditCost(
  state: GameState,
  outpostId: PrimaryOutpostId,
): number {
  const ownedCount = getClaimedPrimaryOutpostCount(state, outpostId);

  const outpost = PRIMARY_OUTPOSTS[outpostId];

  return Math.ceil(
    outpost.claimCreditCost *
      Math.pow(outpost.claimCreditCostGrowthRate, ownedCount),
  );
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

  if (system.primaryOutpostId !== null) {
    return "System already has a Primary Outpost.";
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

export function getClaimedPrimaryOutpostCount(
  state: GameState,
  outpostId: PrimaryOutpostId,
): number {
  return state.map.systemIds.filter((systemId) => {
    const system = state.map.systemsById[systemId];

    return (
      system.claimState === "claimed" &&
      system.primaryOutpostId === outpostId
    );
  }).length;
}

export function getPrimaryOutpostUpgradeOption(
  state: GameState,
  systemId: StarSystemId,
): PrimaryOutpostUpgradeOption {
  const system = state.map.systemsById[systemId];

  if (!system) {
    return {
      canUpgrade: false,
      creditCost: 0,
      currentLevel: 0,
      nextLevel: 0,
      blockedReason: "System does not exist.",
    };
  }

  const currentLevel = getPrimaryOutpostLevel(system.primaryOutpostLevel);
  const nextLevel = currentLevel + 1;
  const creditCost = getPrimaryOutpostUpgradeCreditCost(state, systemId);
  const blockedReason = getPrimaryOutpostUpgradeBlockedReason(
    state,
    systemId,
    creditCost,
  );

  return {
    canUpgrade: blockedReason === null,
    creditCost,
    currentLevel,
    nextLevel,
    blockedReason,
  };
}

export function upgradePrimaryOutpost(
  state: GameState,
  systemId: StarSystemId,
): GameState {
  const upgradeOption = getPrimaryOutpostUpgradeOption(state, systemId);

  if (!upgradeOption.canUpgrade) {
    return state;
  }

  const system = state.map.systemsById[systemId];

  return {
    ...state,

    resources: {
      ...state.resources,
      credits: state.resources.credits - upgradeOption.creditCost,
    },

    map: {
      ...state.map,
      systemsById: {
        ...state.map.systemsById,
        [systemId]: {
          ...system,
          primaryOutpostLevel: upgradeOption.nextLevel,
        },
      },
    },
  };
}

export function getPrimaryOutpostDecommissionPreview(
  state: GameState,
  systemId: StarSystemId,
): PrimaryOutpostDecommissionPreview {
  const system = state.map.systemsById[systemId];

  if (!system) {
    return createBlockedDecommissionPreview(
      "System does not exist.",
    );
  }

  if (system.isHome || system.hasGradCommand) {
    return createBlockedDecommissionPreview(
      "GRaD Command cannot be decommissioned.",
    );
  }

  if (
    system.claimState !== "claimed" ||
    system.primaryOutpostId === null
  ) {
    return createBlockedDecommissionPreview(
      "This system has no Primary Outpost.",
    );
  }

  const materialCapacityLost =
    system.primaryOutpostId === "extraction_rig"
      ? getExtractionStorageCapacity(
          system.primaryOutpostLevel,
        )
      : 0;

  const currentMaterialCapacity =
    calculateRates(state).materialCapacity;

  const nextMaterialCapacity = Math.max(
    0,
    currentMaterialCapacity - materialCapacityLost,
  );

  const materialOverflowLost = Math.max(
    0,
    state.resources.materials -
      nextMaterialCapacity,
  );

  return {
    canDecommission: true,
    supportBuildingsRemoved:
      system.supportBuildingIds.length,
    materialCapacityLost,
    materialOverflowLost,
    blockedReason: null,
  };
}

export function decommissionPrimaryOutpost(
  state: GameState,
  systemId: StarSystemId,
): GameState {
  const preview =
    getPrimaryOutpostDecommissionPreview(
      state,
      systemId,
    );

  if (!preview.canDecommission) {
    return state;
  }

  const system = state.map.systemsById[systemId];

  const currentMaterialCapacity =
    calculateRates(state).materialCapacity;

  const nextMaterialCapacity = Math.max(
    0,
    currentMaterialCapacity -
      preview.materialCapacityLost,
  );

  return {
    ...state,

    resources: {
      ...state.resources,

      materials: Math.min(
        state.resources.materials,
        nextMaterialCapacity,
      ),
    },

    map: {
      ...state.map,

      systemsById: {
        ...state.map.systemsById,

        [systemId]: {
          ...system,

          /*
           * The system remains claimed, but its local
           * infrastructure is completely removed.
           */
          primaryOutpostId: null,
          primaryOutpostLevel: 0,
          supportBuildingIds: [],
        },
      },
    },
  };
}

function createBlockedDecommissionPreview(
  blockedReason: string,
): PrimaryOutpostDecommissionPreview {
  return {
    canDecommission: false,
    supportBuildingsRemoved: 0,
    materialCapacityLost: 0,
    materialOverflowLost: 0,
    blockedReason,
  };
}

export function getPrimaryOutpostUpgradeCreditCost(
  state: GameState,
  systemId: StarSystemId,
): number {
  const system = state.map.systemsById[systemId];

  if (!system || system.primaryOutpostId === null) {
    return 0;
  }

  const outpost = PRIMARY_OUTPOSTS[system.primaryOutpostId];
  const currentLevel = getPrimaryOutpostLevel(system.primaryOutpostLevel);

  return Math.ceil(
    outpost.upgradeCreditCost *
      Math.pow(outpost.upgradeCreditCostGrowthRate, currentLevel - 1),
  );
}

export function getPrimaryOutpostLevel(level: number | undefined): number {
  return level ?? 0;
}

function getPrimaryOutpostUpgradeBlockedReason(
  state: GameState,
  systemId: StarSystemId,
  creditCost: number,
): string | null {
  const system = state.map.systemsById[systemId];

  if (!system) {
    return "System does not exist.";
  }

  if (system.primaryOutpostId === null) {
    return "Claim this system with an outpost first.";
  }

  if (system.claimState !== "claimed") {
    return "System must be claimed first.";
  }

  if (state.resources.credits < creditCost) {
    return `Requires ${creditCost.toFixed(0)} Credits.`;
  }

  return null;
}