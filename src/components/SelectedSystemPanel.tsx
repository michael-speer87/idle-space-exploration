import type {
  ActiveSurveyState,
  AffinityProfile,
  GameState,
  StarSystem
} from "../game/types";
import {
  PRIMARY_OUTPOSTS,
  type PrimaryOutpostId,
} from "../game/config/outposts"
import type { OutpostClaimOption, PrimaryOutpostUpgradeOption } from "../game/systems/outpostSystem";
import { getSurveyRequirementForSystem } from "../game/systems/explorationSystem";
import { formatDuration } from "../game/utils/formatDuration";
import { Panel } from "./ui/Panel";
import { Section } from "./ui/Section";
import { ProgressBar } from "./ui/ProgressBar";

type SelectedSystemPanelProps = {
  gameState: GameState;
  system: StarSystem | null;
  activeSurvey: ActiveSurveyState | null;
  canBeginSurvey: boolean;
  outpostClaimOptions: OutpostClaimOption[];
  firstFreeSurveyAvailable: boolean;
  primaryOutpostUpgradeOption: PrimaryOutpostUpgradeOption;
  onUpgradePrimaryOutpost: () => void;
  onBeginSurvey: () => void;
  onClaimOutpost: (outpostId: PrimaryOutpostId) => void;
};

export function SelectedSystemPanel({
  gameState,
  system,
  activeSurvey,
  canBeginSurvey,
  outpostClaimOptions,
  firstFreeSurveyAvailable,
  primaryOutpostUpgradeOption,
  onUpgradePrimaryOutpost,
  onBeginSurvey,
  onClaimOutpost,
}: SelectedSystemPanelProps) {
  if (system === null) {
    return (
      <Panel
        title="Selected System"
        subtitle="No system selected"
      >
        <div
          className="
          rounded-control border border-dashed border-ise-border
          bg-ise-background/45 px-4 py-6 text-center
        "
        >
          <p className="m-0 text-sm text-ise-text-muted">
            Select a star system on the map to inspect it.
          </p>
        </div>
      </Panel>
    );
  }

  const surveyRequirement =
    activeSurvey !== null
      ? activeSurvey.requiredProgress
      : getSurveyRequirementForSystem(gameState, system.id);

  const surveyProgress =
    activeSurvey !== null
      ? Math.round((activeSurvey.progress / surveyRequirement) * 100)
      : system.explorationState === "surveyed"
        ? 100
        : 0;

  const surveySecondsRemaining =
    activeSurvey !== null && activeSurvey.speedPerSecond > 0
      ? (activeSurvey.requiredProgress - activeSurvey.progress) /
      activeSurvey.speedPerSecond
      : null;

  const surveyEtaLabel =
    surveySecondsRemaining !== null
      ? formatDuration(surveySecondsRemaining)
      : "Not surveying"

  const isSurveyed = system.explorationState === "surveyed";

  return (
    <Panel
      title={system.name}
      subtitle={system.isHome ? "Home System" : "Star System"}
      rightSlot={
        <span
          className={`
          rounded-full border px-2 py-0.5
          text-[0.65rem] font-semibold uppercase tracking-[0.08em]
          ${system.explorationState === "surveyed"
              ? "border-ise-success/35 bg-ise-success/10 text-ise-success"
              : system.explorationState === "surveying"
                ? "border-ise-info/35 bg-ise-info/10 text-ise-info"
                : "border-ise-border bg-ise-background/60 text-ise-text-muted"
            }
        `}
        >
          {system.explorationState}
        </span>
      }
    >
      <div className="grid gap-4">
        <Section title="System Details" divider={false}>
          <dl>
            <PanelRow label="ID" value={system.id} />

            <PanelRow
              label="Coordinates"
              value={`q: ${system.coord.q}, r: ${system.coord.r}`}
            />

            <PanelRow label="Star" value={system.starVisual} />

            <PanelRow
              label="Exploration"
              value={system.explorationState}
            />

            <PanelRow label="Claim" value={system.claimState} />

            <PanelRow
              label="Survey Requirement"
              value={surveyRequirement.toString()}
            />
          </dl>
        </Section>

        <Section title="Survey">
          <div className="grid gap-3">
            <div
              className="
                rounded-control border border-ise-border
                bg-ise-background/60 p-3
              "
            >
              <ProgressBar
                value={surveyProgress}
                ariaLabel={`Survey progress for ${system.name}`}
                colorClassName={
                  system.explorationState === "surveyed"
                    ? "bg-ise-success"
                    : "bg-ise-accent"
                }
                label={
                  <>
                    <span className="font-medium text-ise-text-muted">
                      {activeSurvey !== null
                        ? "Surveying..."
                        : system.explorationState === "surveyed"
                          ? "Survey Complete"
                          : "Survey Progress"}
                    </span>

                    <strong className="tabular-nums text-ise-text">
                      {surveyProgress}%
                    </strong>
                  </>
                }
              />

              <div
                className="
                  mt-3 flex items-center justify-between gap-3
                  text-xs
                "
              >
                <span className="text-ise-text-muted">Estimated Time</span>

                <strong className="tabular-nums text-ise-text">
                  {surveyEtaLabel}
                </strong>
              </div>
            </div>

            {activeSurvey === null && canBeginSurvey && (
              <button
                className="
                  w-full rounded-control
                  border border-ise-accent/40
                  bg-ise-accent-muted px-3 py-2.5
                  text-sm font-semibold text-ise-accent-hover
                  transition-colors
                  hover:bg-ise-accent/25
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-ise-accent
                "
                type="button"
                onClick={onBeginSurvey}
              >
                Begin Survey
              </button>
            )}

            {activeSurvey !== null && (
              <p
                className="
                  m-0 rounded-control
                  border border-ise-info/30
                  bg-ise-info/10 p-3
                  text-xs leading-relaxed text-ise-info
                "
              >
                Survey operation in progress.
              </p>
            )}

            {activeSurvey === null &&
              !canBeginSurvey &&
              system.explorationState === "detected" &&
              !firstFreeSurveyAvailable && (
                <p
                  className="
                    m-0 rounded-control
                    border border-ise-border
                    bg-ise-void/45 p-3
                    text-xs leading-relaxed text-ise-text-muted
                  "
                >
                  Further surveys require EP infrastructure.
                </p>
              )}

            {system.explorationState === "unknown" && (
              <p
                className="
                  m-0 rounded-control
                  border border-ise-warning/30
                  bg-ise-warning/10 p-3
                  text-xs leading-relaxed text-ise-warning
                "
              >
                Survey a neighboring system to detect this location.
              </p>
            )}

            {system.explorationState === "surveyed" && (
              <p
                className="
                  m-0 rounded-control
                  border border-ise-success/30
                  bg-ise-success/10 p-3
                  text-xs leading-relaxed text-ise-success
                "
              >
                Survey complete. System data and outpost potential are available.
              </p>
            )}
          </div>
        </Section>

        <Section title="Outpost Potential">
          {!isSurveyed ? (
            <div
              className="
        rounded-control border border-dashed border-ise-border
        bg-ise-background/45 px-4 py-5 text-center
      "
            >
              <p className="m-0 text-xs leading-relaxed text-ise-text-muted">
                Survey this system to reveal support slots and construction options.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              <div
                className="
          grid grid-cols-2 gap-2
          rounded-control border border-ise-border
          bg-ise-background/60 p-2
        "
              >
                <OutpostSummary
                  label="Support Slots"
                  value={system.supportSlotCount.toString()}
                />

                <OutpostSummary
                  label="Primary Outpost"
                  value={
                    system.primaryOutpostId === null
                      ? "Unclaimed"
                      : PRIMARY_OUTPOSTS[system.primaryOutpostId].name
                  }
                />

                {system.primaryOutpostId !== null && (
                  <OutpostSummary
                    label="Outpost Level"
                    value={system.primaryOutpostLevel.toString()}
                  />
                )}

                <OutpostSummary
                  label="Claim Status"
                  value={system.claimState}
                />
              </div>

              {system.claimState === "unclaimed" && (
                <div className="grid gap-2">
                  <p className="m-0 text-xs leading-relaxed text-ise-text-muted">
                    Select a primary outpost to claim this system.
                  </p>

                  {outpostClaimOptions.map((option) => {
                    const outpost = PRIMARY_OUTPOSTS[option.outpostId];

                    return (
                      <OutpostActionCard
                        key={option.outpostId}
                        title={outpost.name}
                        detail={
                          option.creditCost === 0
                            ? "No credit cost"
                            : `${option.creditCost.toFixed(0)} Credits`
                        }
                        actionLabel={`Claim with ${outpost.name}`}
                        disabled={!option.canClaim}
                        blockedReason={option.blockedReason}
                        onAction={() => onClaimOutpost(option.outpostId)}
                      />
                    );
                  })}
                </div>
              )}

              {system.primaryOutpostId !== null && (
                <OutpostActionCard
                  title={PRIMARY_OUTPOSTS[system.primaryOutpostId].name}
                  detail={`Current level ${system.primaryOutpostLevel}`}
                  actionLabel={`Upgrade to Level ${primaryOutpostUpgradeOption.nextLevel}`}
                  actionCost={`${primaryOutpostUpgradeOption.creditCost.toFixed(0)} Credits`}
                  disabled={!primaryOutpostUpgradeOption.canUpgrade}
                  blockedReason={primaryOutpostUpgradeOption.blockedReason}
                  onAction={onUpgradePrimaryOutpost}
                  accent="success"
                />
              )}
            </div>
          )}
        </Section>

        {isSurveyed && (
          <Section title="Affinities">
            <AffinityGrid affinities={system.affinities} />
          </Section>
        )}

        {system.hasGradCommand && (
          <p
            className="
            m-0 rounded-control
            border border-ise-success/35
            bg-ise-success/10 p-3
            text-xs font-medium text-ise-success
          "
          >
            GRaD Command established.
          </p>
        )}
      </div>
    </Panel>
  );
}

type PanelRowProps = {
  label: string;
  value: string;
};

function PanelRow({ label, value }: PanelRowProps) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

type OutpostSummaryProps = {
  label: string;
  value: string;
};

function OutpostSummary({
  label,
  value,
}: OutpostSummaryProps) {
  return (
    <div
      className="
        min-w-0 rounded-control
        px-2 py-1.5
        hover:bg-ise-surface-hover/50
      "
    >
      <span
        className="
          block text-[0.65rem] font-semibold uppercase
          tracking-[0.08em] text-ise-text-subtle
        "
      >
        {label}
      </span>

      <strong
        className="
          mt-0.5 block truncate
          text-xs font-semibold capitalize text-ise-text
        "
        title={value}
      >
        {value}
      </strong>
    </div>
  );
}

type OutpostActionCardProps = {
  title: string;
  detail: string;
  actionLabel: string;
  actionCost?: string;
  disabled: boolean;
  blockedReason: string | null;
  onAction: () => void;
  accent?: "primary" | "success";
};

function OutpostActionCard({
  title,
  detail,
  actionLabel,
  actionCost,
  disabled,
  blockedReason,
  onAction,
  accent = "primary",
}: OutpostActionCardProps) {
  const activeClasses =
    accent === "success"
      ? `
          border-ise-success/40 bg-ise-success/10
          text-ise-success hover:bg-ise-success/20
          focus-visible:outline-ise-success
        `
      : `
          border-ise-accent/40 bg-ise-accent-muted
          text-ise-accent-hover hover:bg-ise-accent/25
          focus-visible:outline-ise-accent
        `;

  return (
    <article
      className="
        rounded-control border border-ise-border
        bg-ise-background/60 p-3
      "
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="m-0 truncate text-sm font-semibold text-ise-text">
            {title}
          </h4>

          <p className="mt-1 mb-0 text-xs text-ise-text-muted">
            {detail}
          </p>
        </div>

        {actionCost && (
          <span
            className="
              shrink-0 rounded-full border border-ise-credits/30
              bg-ise-credits/10 px-2 py-0.5
              text-[0.65rem] font-semibold text-ise-credits
            "
          >
            {actionCost}
          </span>
        )}
      </div>

      <button
        className={`
          w-full rounded-control border px-3 py-2.5
          text-sm font-semibold transition-colors
          focus-visible:outline-2 focus-visible:outline-offset-2
          disabled:cursor-not-allowed disabled:border-ise-border
          disabled:bg-ise-void/60 disabled:text-ise-text-subtle
          ${activeClasses}
        `}
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

type AffinityGridProps = {
  affinities: AffinityProfile;
};

type AffinityLevel = AffinityProfile[keyof AffinityProfile];

function AffinityGrid({ affinities }: AffinityGridProps) {
  const affinityEntries = Object.entries(affinities) as Array<[keyof AffinityProfile, AffinityLevel]>;

  return (
    <div className="grid grid-cols-2 gap-2">
      {affinityEntries.map(([name, level]) => (
        <AffinityCard
          key={String(name)}
          name={formatAffinityName(String(name))}
          level={level}
        />
      ))}
    </div>
  )
}

type AffinityCardProps = {
  name: string;
  level: AffinityLevel;
};

function AffinityCard({
  name,
  level,
}: AffinityCardProps) {
  const levelClasses = getAffinityLevelClasses(level);

  return (
    <div
      className="
        min-w-0 rounded-control
        border border-ise-border
        bg-ise-background/60 p-2.5
        transition-colors
        hover:border-ise-border-strong
        hover:bg-ise-surface-hover/50
      "
    >
      <span
        className="
          block truncate
          text-xs font-medium text-ise-text-muted
        "
        title={name}
      >
        {name}
      </span>

      <span
        className={`
          mt-1 inline-flex rounded-full border
          px-2 py-0.5
          text-[0.65rem] font-semibold uppercase
          tracking-[0.08em]
          ${levelClasses}
        `}
      >
        {level}
      </span>
    </div>
  );
}

function getAffinityLevelClasses(level: AffinityLevel): string {
  switch (level) {
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

function formatAffinityName(name: string): string {
  return name
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}