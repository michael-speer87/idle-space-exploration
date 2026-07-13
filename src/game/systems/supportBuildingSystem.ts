import {
  SUPPORT_BUILDINGS,
  SUPPORT_BUILDING_IDS,
  type SupportBuildingId,
} from "../config/supportBuildings";
import type { GameState, StarSystemId } from "../types";
import { isResearchCompleted } from "./researchSystem";

export type SupportBuildingBuildOption = {
  supportBuildingId: SupportBuildingId;
  creditCost: number;
  canBuild: boolean;
  blockedReason: string | null;
};

export function getSupportBuildingBuildOptions(
  state: GameState,
  systemId: StarSystemId,
): SupportBuildingBuildOption[] {
  const system = state.map.systemsById[systemId];

  if (!system || system.primaryOutpostId === null) {
    return [];
  }

  return SUPPORT_BUILDING_IDS
    .filter((supportBuildingId) => {
      return (
        SUPPORT_BUILDINGS[supportBuildingId].requiredPrimaryOutpostId ===
        system.primaryOutpostId
      );
    })
    .map((supportBuildingId) => {
      const building = SUPPORT_BUILDINGS[supportBuildingId];

      const blockedReason = getSupportBuildingBuildBlockedReason(
        state,
        systemId,
        supportBuildingId,
      );

      return {
        supportBuildingId,
        creditCost: building.creditCost,
        canBuild: blockedReason === null,
        blockedReason,
      };
    });
}

export function getAvailableSupportSlotCount(
  state: GameState,
  systemId: StarSystemId,
): number {
  const system = state.map.systemsById[systemId];

  if (!system) {
    return 0;
  }

  return Math.max(
    0,
    system.supportSlotCount - system.supportBuildingIds.length,
  );
}

export function canBuildSupportBuilding(
  state: GameState,
  systemId: StarSystemId,
  supportBuildingId: SupportBuildingId,
): boolean {
  return (
    getSupportBuildingBuildBlockedReason(
      state,
      systemId,
      supportBuildingId,
    ) === null
  );
}

export function buildSupportBuilding(
  state: GameState,
  systemId: StarSystemId,
  supportBuildingId: SupportBuildingId,
): GameState {
  if (!canBuildSupportBuilding(state, systemId, supportBuildingId)) {
    return state;
  }

  const system = state.map.systemsById[systemId];
  const building = SUPPORT_BUILDINGS[supportBuildingId];

  return {
    ...state,

    resources: {
      ...state.resources,
      credits: state.resources.credits - building.creditCost,
    },

    map: {
      ...state.map,
      systemsById: {
        ...state.map.systemsById,

        [systemId]: {
          ...system,

          supportBuildingIds: [
            ...system.supportBuildingIds,
            supportBuildingId,
          ],
        },
      },
    },
  };
}

function getSupportBuildingBuildBlockedReason(
  state: GameState,
  systemId: StarSystemId,
  supportBuildingId: SupportBuildingId,
): string | null {
  const system = state.map.systemsById[systemId];
  const building = SUPPORT_BUILDINGS[supportBuildingId];

  if (!system) {
    return "System does not exist.";
  }

  if (!building) {
    return "This Support Building is not available.";
  }

  if (system.claimState !== "claimed") {
    return "Claim this system first.";
  }

  if (system.primaryOutpostId === null) {
    return "Establish a Primary Outpost first.";
  }

  if (system.primaryOutpostId !== building.requiredPrimaryOutpostId) {
    return "This Support Building is incompatible with the current Primary Outpost.";
  }

  if (!isResearchCompleted(state, building.unlockResearchId)) {
    return "Complete the required Research first.";
  }

  if (getAvailableSupportSlotCount(state, systemId) <= 0) {
    return "No Support Building slots are available.";
  }

  if (state.resources.credits < building.creditCost) {
    return `Requires ${building.creditCost.toFixed(0)} Credits.`;
  }

  return null;
}