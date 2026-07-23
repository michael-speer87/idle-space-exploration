import { useState } from "react";
import {
  PRIMARY_OUTPOSTS,
  type PrimaryOutpostDefinition,
  type PrimaryOutpostId,
} from "../game/config/outposts";
import { RESEARCH_PROGRAMS } from "../game/config/research";
import {
  SUPPORT_BUILDINGS,
  type SupportBuildingDefinition,
  type SupportBuildingId,
} from "../game/config/supportBuildings";
import type {
  OutpostClaimOption,
  PrimaryOutpostDecommissionPreview,
  PrimaryOutpostUpgradeOption,
} from "../game/systems/outpostSystem";
import type { SupportBuildingBuildOption } from "../game/systems/supportBuildingSystem";
import type {
  AffinityLevel,
  StarSystem,
} from "../game/types";
import { Section } from "./ui/Section";


type BuildTab = "primary" | "support";

type BuildPanelProps = {
  system: StarSystem | null;
  outpostClaimOptions: OutpostClaimOption[];
  primaryOutpostUpgradeOption:
  PrimaryOutpostUpgradeOption;
  primaryOutpostDecommissionPreview:
  PrimaryOutpostDecommissionPreview;
  supportBuildingBuildOptions:
  SupportBuildingBuildOption[];
  onClaimOutpost: (
    outpostId: PrimaryOutpostId,
  ) => void;
  onUpgradePrimaryOutpost: () => void;
  onDecommissionPrimaryOutpost: () => void;
  onBuildSupportBuilding: (
    supportBuildingId: SupportBuildingId,
  ) => void;
};

export function BuildPanel({
  system,
  outpostClaimOptions,
  primaryOutpostUpgradeOption,
  primaryOutpostDecommissionPreview,
  supportBuildingBuildOptions,
  onClaimOutpost,
  onUpgradePrimaryOutpost,
  onDecommissionPrimaryOutpost,
  onBuildSupportBuilding,
}: BuildPanelProps) {
  const [activeTab, setActiveTab] =
    useState<BuildTab>("primary");

  if (system === null) {
    return (
      <BuildEmptyState
        title="No System Selected"
        description="Select a surveyed system on the galaxy map to inspect its construction options."
      />
    );
  }

  if (system.isHome) {
    return (
      <div className="grid gap-4">
        <BuildStatusSummary
          systemName={system.name}
          status="GRaD Command"
          supportSlots={system.supportSlotCount}
        />

        <BuildEmptyState
          title="GRaD Command Established"
          description="The Home System is occupied by GRaD Command and cannot receive a standard Primary Outpost."
          tone="success"
        />
      </div>
    );
  }

  if (system.explorationState !== "surveyed") {
    return (
      <div className="grid gap-4">
        <BuildStatusSummary
          systemName={system.name}
          status="Survey Required"
          supportSlots={null}
        />

        <BuildEmptyState
          title="Construction Data Unavailable"
          description="Complete the system survey to reveal its affinities, support capacity, and available Primary Outposts."
        />
      </div>
    );
  }

  const currentOutpost =
    system.primaryOutpostId !== null
      ? PRIMARY_OUTPOSTS[system.primaryOutpostId]
      : null;

  const occupiedSupportSlots =
    system.supportBuildingIds.length;

  const availableSupportSlots = Math.max(
    0,
    system.supportSlotCount - occupiedSupportSlots,
  );

  return (
    <div className="grid gap-4">
      <BuildStatusSummary
        systemName={system.name}
        status={
          currentOutpost === null
            ? system.claimState === "claimed"
              ? "Claimed • Outpost Vacant"
              : "Ready to Claim"
            : `${currentOutpost.name} • Level ${system.primaryOutpostLevel}`
        }
        supportSlots={system.supportSlotCount}
      />

      <BuildTabs
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div
        id="build-primary-panel"
        role="tabpanel"
        aria-labelledby="build-primary-tab"
        className="grid gap-4"
        hidden={activeTab !== "primary"}
      >
        {currentOutpost === null && (
          <Section
            title="Available Primary Outposts"
            divider={false}
          >
            <div className="grid gap-3">
              <p className="m-0 text-xs leading-relaxed text-ise-text-muted">
                {system.claimState === "claimed"
                  ? "This claimed system has no active Primary Outpost. Select a new specialization to restore local operations."
                  : "Select a specialization to claim this system. The chosen Primary Outpost defines the system’s main role."}
              </p>

              {outpostClaimOptions.map((option) => {
                const outpost =
                  PRIMARY_OUTPOSTS[option.outpostId];
                const affinity =
                  system.affinities[outpost.affinityKey];

                const unlockResearch = option.unlockRequirement !== null
                  ? RESEARCH_PROGRAMS[option.unlockRequirement.programId]
                  : null;

                const unlockResearchLabel =
                  unlockResearch !== null &&
                    option.unlockRequirement !== null
                    ? `${unlockResearch.name} Rank ${option.unlockRequirement
                      .requiredRank
                    }`
                    : null;

                return (
                  <BuildOutpostCard
                    key={option.outpostId}
                    outpost={outpost}
                    affinity={affinity}
                    costLabel={
                      option.creditCost === 0
                        ? "Free"
                        : `${option.creditCost.toFixed(0)} Credits`
                    }
                    unlockResearchLabel={
                      unlockResearchLabel
                    }
                    actionLabel={`Establish ${outpost.name}`}
                    disabled={!option.canClaim}
                    blockedReason={
                      option.blockedReason
                    }
                    onAction={() =>
                      onClaimOutpost(
                        option.outpostId,
                      )
                    }
                  />
                );
              })}
            </div>
          </Section>
        )}

        {currentOutpost !== null && (
          <Section
            title="Current Primary Outpost"
            divider={false}
          >
            <CurrentOutpostCard
              outpost={currentOutpost}
              affinity={
                system.affinities[currentOutpost.affinityKey]
              }
              currentLevel={system.primaryOutpostLevel}
              upgradeOption={primaryOutpostUpgradeOption}
              decommissionPreview={primaryOutpostDecommissionPreview}
              onUpgrade={onUpgradePrimaryOutpost}
              onDecommission={onDecommissionPrimaryOutpost}
            />
          </Section>
        )}
      </div>

      <div
        id="build-support-panel"
        role="tabpanel"
        aria-labelledby="build-support-tab"
        className="grid gap-4"
        hidden={activeTab !== "support"}
      >
        {currentOutpost === null ||
          system.claimState !== "claimed" ? (
          <BuildEmptyState
            title="Support Buildings Locked"
            description="Claim this system and establish a Primary Outpost before installing Support Buildings."
          />
        ) : (
          <Section
            title="Support Buildings"
            divider={false}
          >
            <div className="grid gap-3">
              <p className="m-0 text-xs leading-relaxed text-ise-text-muted">
                Install local infrastructure to strengthen this
                system’s Primary Outpost. Each installation occupies
                one support slot.
              </p>

              <div
                className="
                  grid grid-cols-2 gap-2
                  rounded-control border border-ise-border
                  bg-ise-background/60 p-2
                "
              >
                <BuildMetric
                  label="Slots Occupied"
                  value={`${occupiedSupportSlots} / ${system.supportSlotCount}`}
                />

                <BuildMetric
                  label="Slots Available"
                  value={availableSupportSlots.toString()}
                />
              </div>

              <SupportSlotGrid
                supportBuildingIds={
                  system.supportBuildingIds
                }
                supportSlotCount={system.supportSlotCount}
              />

              {supportBuildingBuildOptions.map((option) => {
                const building =
                  SUPPORT_BUILDINGS[
                  option.supportBuildingId
                  ];

                const installedCount =
                  system.supportBuildingIds.filter(
                    (buildingId) =>
                      buildingId === building.id,
                  ).length;

                return (
                  <SupportBuildingCard
                    key={option.supportBuildingId}
                    building={building}
                    installedCount={installedCount}
                    option={option}
                    onBuild={() =>
                      onBuildSupportBuilding(building.id)
                    }
                  />
                );
              })}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

type BuildTabsProps = {
  activeTab: BuildTab;
  onChange: (tab: BuildTab) => void;
};

function BuildTabs({
  activeTab,
  onChange,
}: BuildTabsProps) {
  return (
    <div
      className="
        grid grid-cols-2 gap-1
        rounded-panel border border-ise-border
        bg-ise-background/70 p-1
      "
      role="tablist"
      aria-label="Build workspace sections"
    >
      <BuildTabButton
        id="build-primary-tab"
        controls="build-primary-panel"
        label="Primary Outpost"
        active={activeTab === "primary"}
        onClick={() => onChange("primary")}
      />

      <BuildTabButton
        id="build-support-tab"
        controls="build-support-panel"
        label="Support Buildings"
        active={activeTab === "support"}
        onClick={() => onChange("support")}
      />
    </div>
  );
}

type BuildTabButtonProps = {
  id: string;
  controls: string;
  label: string;
  active: boolean;
  onClick: () => void;
};

function BuildTabButton({
  id,
  controls,
  label,
  active,
  onClick,
}: BuildTabButtonProps) {
  return (
    <button
      id={id}
      className={`
        rounded-control border px-3 py-2
        text-xs font-semibold
        transition-colors
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-ise-accent
        ${active
          ? `
                border-ise-accent/50
                bg-ise-accent-muted
                text-ise-accent-hover
              `
          : `
                border-transparent
                bg-transparent
                text-ise-text-muted
                hover:border-ise-border
                hover:bg-ise-surface
                hover:text-ise-text
              `
        }
      `}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

type BuildStatusSummaryProps = {
  systemName: string;
  status: string;
  supportSlots: number | null;
};

function BuildStatusSummary({
  systemName,
  status,
  supportSlots,
}: BuildStatusSummaryProps) {
  return (
    <div
      className="
        rounded-panel border border-ise-border
        bg-ise-surface p-3
      "
    >
      <span
        className="
          text-[0.65rem] font-semibold uppercase
          tracking-[0.09em] text-ise-text-subtle
        "
      >
        Construction Target
      </span>

      <div className="mt-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 truncate text-sm font-semibold text-ise-text">
            {systemName}
          </h3>

          <p className="mt-1 mb-0 text-xs text-ise-text-muted">
            {status}
          </p>
        </div>

        {supportSlots !== null && (
          <span
            className="
              shrink-0 rounded-full
              border border-ise-border
              bg-ise-background/70 px-2 py-0.5
              text-[0.65rem] font-semibold tabular-nums
              text-ise-text-muted
            "
          >
            {supportSlots} slots
          </span>
        )}
      </div>
    </div>
  );
}

type BuildOutpostCardProps = {
  outpost: PrimaryOutpostDefinition;
  affinity: AffinityLevel;
  costLabel: string;
  unlockResearchLabel: string | null;
  actionLabel: string;
  disabled: boolean;
  blockedReason: string | null;
  onAction: () => void;
};

function BuildOutpostCard({
  outpost,
  affinity,
  costLabel,
  unlockResearchLabel,
  actionLabel,
  disabled,
  blockedReason,
  onAction,
}: BuildOutpostCardProps) {
  return (
    <article
      className="
        rounded-panel border border-ise-border
        bg-ise-surface p-3
        transition-colors
        hover:border-ise-border-strong
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 text-sm font-semibold text-ise-text">
            {outpost.name}
          </h3>

          <p className="mt-1 mb-0 text-xs leading-relaxed text-ise-text-muted">
            {outpost.description}
          </p>
        </div>

        <AffinityBadge affinity={affinity} />
      </div>

      <div
        className="
          mt-3 grid grid-cols-2 gap-2
          rounded-control border border-ise-border
          bg-ise-background/55 p-2
        "
      >
        <BuildMetric
          label="Claim Cost"
          value={costLabel}
          valueClassName="text-ise-credits"
        />

        <BuildMetric
          label="Energy"
          value={getOutpostEnergyLabel(outpost)}
          valueClassName={
            outpost.usesEnergy
              ? "text-ise-energy"
              : "text-ise-success"
          }
        />

        {unlockResearchLabel !== null && (
          <div
            className="
              mt-2 rounded-control
              border border-ise-border
              bg-ise-background/55 p-2
            "
          >
            <BuildMetric
              label="Required Research"
              value={unlockResearchLabel}
              valueClassName="text-ise-science"
            />
          </div>
        )}
      </div>

      <button
        className="
          mt-3 w-full rounded-control
          border border-ise-accent/40
          bg-ise-accent-muted px-3 py-2.5
          text-xs font-semibold text-ise-accent-hover
          transition-colors
          hover:bg-ise-accent/25
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-ise-accent
          disabled:cursor-not-allowed
          disabled:border-ise-border
          disabled:bg-ise-void/60
          disabled:text-ise-text-subtle
        "
        type="button"
        disabled={disabled}
        onClick={onAction}
      >
        {actionLabel}
      </button>

      {disabled && blockedReason !== null && (
        <p
          className="
            mt-2 mb-0 rounded-control
            border border-ise-warning/25
            bg-ise-warning/10 p-2
            text-xs leading-relaxed text-ise-warning
          "
        >
          {blockedReason}
        </p>
      )}
    </article>
  );
}

type CurrentOutpostCardProps = {
  outpost: PrimaryOutpostDefinition;
  affinity: AffinityLevel;
  currentLevel: number;
  upgradeOption: PrimaryOutpostUpgradeOption;
  decommissionPreview:
  PrimaryOutpostDecommissionPreview;
  onUpgrade: () => void;
  onDecommission: () => void;
};

function CurrentOutpostCard({
  outpost,
  affinity,
  currentLevel,
  upgradeOption,
  decommissionPreview,
  onUpgrade,
  onDecommission,
}: CurrentOutpostCardProps) {
  return (
    <article
      className="
        rounded-panel border border-ise-success/30
        bg-ise-success/10 p-3
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className="
              text-[0.65rem] font-semibold uppercase
              tracking-[0.09em] text-ise-success
            "
          >
            Operational
          </span>

          <h3 className="mt-1 mb-0 text-sm font-semibold text-ise-text">
            {outpost.name}
          </h3>

          <p className="mt-1 mb-0 text-xs leading-relaxed text-ise-text-muted">
            {outpost.description}
          </p>
        </div>

        <AffinityBadge affinity={affinity} />
      </div>

      <div
        className="
          mt-3 grid grid-cols-2 gap-2
          rounded-control border border-ise-border
          bg-ise-background/55 p-2
        "
      >
        <BuildMetric
          label="Current Level"
          value={currentLevel.toString()}
        />

        <BuildMetric
          label="Next Level"
          value={upgradeOption.nextLevel.toString()}
        />

        <BuildMetric
          label="Upgrade Cost"
          value={`${upgradeOption.creditCost.toFixed(0)} Credits`}
          valueClassName="text-ise-credits"
        />

        <BuildMetric
          label="Energy Profile"
          value={getOutpostEnergyLabel(outpost)}
          valueClassName="text-ise-energy"
        />
      </div>

      <button
        className="
          mt-3 w-full rounded-control
          border border-ise-success/40
          bg-ise-success/10 px-3 py-2.5
          text-xs font-semibold text-ise-success
          transition-colors
          hover:bg-ise-success/20
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-ise-success
          disabled:cursor-not-allowed
          disabled:border-ise-border
          disabled:bg-ise-void/60
          disabled:text-ise-text-subtle
        "
        type="button"
        disabled={!upgradeOption.canUpgrade}
        onClick={onUpgrade}
      >
        Upgrade to Level {upgradeOption.nextLevel}
      </button>

      {!upgradeOption.canUpgrade &&
        upgradeOption.blockedReason !== null && (
          <p
            className="
              mt-2 mb-0 rounded-control
              border border-ise-warning/25
              bg-ise-warning/10 p-2
              text-xs leading-relaxed text-ise-warning
            "
          >
            {upgradeOption.blockedReason}
          </p>
        )}

      <div
        className="
    mt-4 rounded-control
    border border-ise-danger/30
    bg-ise-danger/10 p-3
  "
      >
        <strong
          className="
      block text-xs font-semibold
      text-ise-danger
    "
        >
          Decommission Outpost
        </strong>

        <p
          className="
      mt-1 mb-0 text-xs leading-relaxed
      text-ise-text-muted
    "
        >
          Remove this Primary Outpost and all installed
          Support Buildings. The system remains claimed,
          but no Credits are refunded.
        </p>

        {decommissionPreview.materialOverflowLost > 0 && (
          <p
            className="
        mt-2 mb-0 rounded-control
        border border-ise-danger/35
        bg-ise-danger/10 p-2
        text-xs font-semibold leading-relaxed
        text-ise-danger
      "
          >
            This will discard{" "}
            {decommissionPreview.materialOverflowLost.toFixed(
              1,
            )}{" "}
            Materials because the network will lose{" "}
            {decommissionPreview.materialCapacityLost.toFixed(
              0,
            )}{" "}
            storage capacity.
          </p>
        )}

        <button
          className="
      mt-3 w-full rounded-control
      border border-ise-danger/40
      bg-ise-danger/10 px-3 py-2.5
      text-xs font-semibold text-ise-danger
      transition-colors
      hover:bg-ise-danger/20
      focus-visible:outline-2
      focus-visible:outline-offset-2
      focus-visible:outline-ise-danger
      disabled:cursor-not-allowed
      disabled:border-ise-border
      disabled:bg-ise-void/60
      disabled:text-ise-text-subtle
    "
          type="button"
          disabled={!decommissionPreview.canDecommission}
          onClick={onDecommission}
        >
          Decommission {outpost.name}
        </button>

        {!decommissionPreview.canDecommission &&
          decommissionPreview.blockedReason !== null && (
            <p
              className="
          mt-2 mb-0 text-xs leading-relaxed
          text-ise-warning
        "
            >
              {decommissionPreview.blockedReason}
            </p>
          )}
      </div>
    </article>
  );
}

type SupportSlotGridProps = {
  supportBuildingIds: SupportBuildingId[];
  supportSlotCount: number;
};

function SupportSlotGrid({
  supportBuildingIds,
  supportSlotCount,
}: SupportSlotGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from(
        { length: supportSlotCount },
        (_, index) => {
          const supportBuildingId =
            supportBuildingIds[index];

          const building =
            supportBuildingId !== undefined
              ? SUPPORT_BUILDINGS[supportBuildingId]
              : null;

          return (
            <div
              className={`
                min-h-16 rounded-control border p-2.5
                ${building === null
                  ? `
                        border-dashed border-ise-border
                        bg-ise-background/40
                      `
                  : `
                        border-ise-success/30
                        bg-ise-success/10
                      `
                }
              `}
              key={`support-slot-${index}`}
            >
              <span
                className="
                  block text-[0.6rem] font-semibold uppercase
                  tracking-[0.08em] text-ise-text-subtle
                "
              >
                Slot {index + 1}
              </span>

              <strong
                className={`
                  mt-1 block text-xs font-semibold
                  ${building === null
                    ? "text-ise-text-subtle"
                    : "text-ise-success"
                  }
                `}
              >
                {building?.name ?? "Empty"}
              </strong>
            </div>
          );
        },
      )}
    </div>
  );
}

type SupportBuildingCardProps = {
  building: SupportBuildingDefinition;
  installedCount: number;
  option: SupportBuildingBuildOption;
  onBuild: () => void;
};

function SupportBuildingCard({
  building,
  installedCount,
  option,
  onBuild,
}: SupportBuildingCardProps) {
  const unlockResearch =
    option.unlockRequirement !== null
      ? RESEARCH_PROGRAMS[
      option.unlockRequirement
        .programId
      ]
      : null;

  const unlockResearchLabel =
    unlockResearch !== null &&
      option.unlockRequirement !== null
      ? `${unlockResearch.name} Rank ${option.unlockRequirement
        .requiredRank
      }`
      : "Available from start";

  const bonusPercent = Math.round(
    building.outputBonus * 100,
  );

  return (
    <article
      className="
        rounded-panel border border-ise-border
        bg-ise-surface p-3
        transition-colors
        hover:border-ise-border-strong
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 text-sm font-semibold text-ise-text">
            {building.name}
          </h3>

          <p className="mt-1 mb-0 text-xs leading-relaxed text-ise-text-muted">
            {building.description}
          </p>
        </div>

        <span
          className="
            shrink-0 rounded-full border border-ise-border
            bg-ise-background/70 px-2 py-0.5
            text-[0.6rem] font-semibold tabular-nums
            text-ise-text-muted
          "
        >
          {installedCount} installed
        </span>
      </div>

      <div
        className="
          mt-3 grid grid-cols-2 gap-2
          rounded-control border border-ise-border
          bg-ise-background/55 p-2
        "
      >
        <BuildMetric
          label="Local Bonus"
          value={`+${bonusPercent}% output`}
          valueClassName="text-ise-success"
        />

        <BuildMetric
          label="Build Cost"
          value={`${option.creditCost.toFixed(0)} Credits`}
          valueClassName="text-ise-credits"
        />

        <div className="col-span-2">
          <BuildMetric
            label="Required Research"
            value={unlockResearchLabel}
          />
        </div>
      </div>

      <button
        className="
          mt-3 w-full rounded-control
          border border-ise-accent/40
          bg-ise-accent-muted px-3 py-2.5
          text-xs font-semibold text-ise-accent-hover
          transition-colors
          hover:bg-ise-accent/25
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-ise-accent
          disabled:cursor-not-allowed
          disabled:border-ise-border
          disabled:bg-ise-void/60
          disabled:text-ise-text-subtle
        "
        type="button"
        disabled={!option.canBuild}
        onClick={onBuild}
      >
        Build {building.name}
      </button>

      {!option.canBuild &&
        option.blockedReason !== null && (
          <p
            className="
              mt-2 mb-0 rounded-control
              border border-ise-warning/25
              bg-ise-warning/10 p-2
              text-xs leading-relaxed text-ise-warning
            "
          >
            {option.blockedReason}
          </p>
        )}
    </article>
  );
}

type BuildMetricProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function BuildMetric({
  label,
  value,
  valueClassName = "text-ise-text",
}: BuildMetricProps) {
  return (
    <div
      className="
        min-w-0 rounded-control px-2 py-1.5
        hover:bg-ise-surface-hover/50
      "
    >
      <span
        className="
          block truncate text-[0.6rem]
          font-semibold uppercase tracking-[0.08em]
          text-ise-text-subtle
        "
      >
        {label}
      </span>

      <strong
        className={`
          mt-0.5 block truncate
          text-xs font-semibold capitalize tabular-nums
          ${valueClassName}
        `}
        title={value}
      >
        {value}
      </strong>
    </div>
  );
}

type AffinityBadgeProps = {
  affinity: AffinityLevel;
};

function AffinityBadge({
  affinity,
}: AffinityBadgeProps) {
  return (
    <span
      className={`
        shrink-0 rounded-full border
        px-2 py-0.5
        text-[0.6rem] font-semibold uppercase
        tracking-[0.08em]
        ${getAffinityClasses(affinity)}
      `}
    >
      {affinity}
    </span>
  );
}

type BuildEmptyStateProps = {
  title: string;
  description: string;
  tone?: "neutral" | "success";
};

function BuildEmptyState({
  title,
  description,
  tone = "neutral",
}: BuildEmptyStateProps) {
  return (
    <div
      className={`
        rounded-panel border border-dashed p-5 text-center
        ${tone === "success"
          ? `
                border-ise-success/35
                bg-ise-success/10
              `
          : `
                border-ise-border
                bg-ise-background/45
              `
        }
      `}
    >
      <h3 className="m-0 text-sm font-semibold text-ise-text">
        {title}
      </h3>

      <p className="mt-2 mb-0 text-xs leading-relaxed text-ise-text-muted">
        {description}
      </p>
    </div>
  );
}

function getAffinityClasses(
  affinity: AffinityLevel,
): string {
  switch (affinity) {
    case "high":
      return `
        border-ise-success/35
        bg-ise-success/10
        text-ise-success
      `;

    case "low":
      return `
        border-ise-danger/35
        bg-ise-danger/10
        text-ise-danger
      `;

    case "neutral":
    default:
      return `
        border-ise-border-strong
        bg-ise-surface-raised
        text-ise-text-muted
      `;
  }
}

function getOutpostEnergyLabel(
  outpost: PrimaryOutpostDefinition,
): string {
  if (!outpost.usesEnergy) {
    return `+${outpost.baseOutput} capacity`;
  }

  return `${outpost.baseEnergyUse} at Level 1`;
}