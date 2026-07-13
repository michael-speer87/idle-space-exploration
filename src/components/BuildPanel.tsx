import {
  PRIMARY_OUTPOSTS,
  type PrimaryOutpostDefinition,
  type PrimaryOutpostId,
} from "../game/config/outposts";
import type {
  OutpostClaimOption,
  PrimaryOutpostUpgradeOption,
} from "../game/systems/outpostSystem";
import type {
  AffinityLevel,
  StarSystem,
} from "../game/types";
import { Section } from "./ui/Section";

type BuildPanelProps = {
  system: StarSystem | null;
  outpostClaimOptions: OutpostClaimOption[];
  primaryOutpostUpgradeOption: PrimaryOutpostUpgradeOption;
  onClaimOutpost: (outpostId: PrimaryOutpostId) => void;
  onUpgradePrimaryOutpost: () => void;
};

export function BuildPanel({
  system,
  outpostClaimOptions,
  primaryOutpostUpgradeOption,
  onClaimOutpost,
  onUpgradePrimaryOutpost,
}: BuildPanelProps) {
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

  return (
    <div className="grid gap-4">
      <BuildStatusSummary
        systemName={system.name}
        status={
          currentOutpost === null
            ? "Ready to Claim"
            : `${currentOutpost.name} • Level ${system.primaryOutpostLevel}`
        }
        supportSlots={system.supportSlotCount}
      />

      {system.claimState === "unclaimed" && (
        <Section
          title="Available Primary Outposts"
          divider={false}
        >
          <div className="grid gap-3">
            <p className="m-0 text-xs leading-relaxed text-ise-text-muted">
              Select a specialization to claim this system. The chosen
              Primary Outpost defines the system’s main role.
            </p>

            {outpostClaimOptions.map((option) => {
              const outpost = PRIMARY_OUTPOSTS[option.outpostId];
              const affinity = system.affinities[outpost.category];

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
                  actionLabel={`Establish ${outpost.name}`}
                  disabled={!option.canClaim}
                  blockedReason={option.blockedReason}
                  onAction={() => onClaimOutpost(option.outpostId)}
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
            affinity={system.affinities[currentOutpost.category]}
            currentLevel={system.primaryOutpostLevel}
            upgradeOption={primaryOutpostUpgradeOption}
            onUpgrade={onUpgradePrimaryOutpost}
          />
        </Section>
      )}

      <Section title="System Capacity">
        <div
          className="
            grid grid-cols-2 gap-2
            rounded-control border border-ise-border
            bg-ise-background/60 p-2
          "
        >
          <BuildMetric
            label="Support Slots"
            value={system.supportSlotCount.toString()}
          />

          <BuildMetric
            label="Claim Status"
            value={system.claimState}
          />

          <BuildMetric
            label="Primary Outpost"
            value={currentOutpost?.name ?? "None"}
          />

          <BuildMetric
            label="Outpost Level"
            value={
              currentOutpost === null
                ? "0"
                : system.primaryOutpostLevel.toString()
            }
          />
        </div>

        <p className="mt-3 mb-0 text-xs leading-relaxed text-ise-text-subtle">
          Support Building management will use this workspace in a later
          development milestone.
        </p>
      </Section>
    </div>
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
  actionLabel: string;
  disabled: boolean;
  blockedReason: string | null;
  onAction: () => void;
};

function BuildOutpostCard({
  outpost,
  affinity,
  costLabel,
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
  onUpgrade: () => void;
};

function CurrentOutpostCard({
  outpost,
  affinity,
  currentLevel,
  upgradeOption,
  onUpgrade,
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
        ${
          tone === "success"
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