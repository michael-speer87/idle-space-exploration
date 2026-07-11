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
          <h3>Outpost Potential</h3>

          {!isSurveyed ? (
            <p className="panel-note">
              Survey this system to reveal support slots and outpost potential.
            </p>
          ) : (
            <dl>
              {system.claimState === "unclaimed" && (
                <div className="outpost-action-list">
                  {outpostClaimOptions.map((option) => {
                    const outpost = PRIMARY_OUTPOSTS[option.outpostId];

                    return (
                      <div key={option.outpostId} className="outpost-action-card">
                        <button
                          className="primary-action-button"
                          type="button"
                          disabled={!option.canClaim}
                          onClick={() => onClaimOutpost(option.outpostId)}
                        >
                          Claim with {outpost.name}
                          {" . "}
                          {option.creditCost === 0
                            ? "Free"
                            : `${option.creditCost.toFixed(0)} Credits`}
                        </button>

                        {!option.canClaim && option.blockedReason !== null && (
                          <p className="outpost-blocked-reason">
                            {option.blockedReason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {system.primaryOutpostId !== null && (
                <div className="outpost-action-card">
                  <button
                    className="primary-action-button"
                    type="button"
                    disabled={!primaryOutpostUpgradeOption.canUpgrade}
                    onClick={onUpgradePrimaryOutpost}
                  >
                    Upgrade to Level {primaryOutpostUpgradeOption.nextLevel}
                    {" . "}
                    {primaryOutpostUpgradeOption.creditCost.toFixed(0)} Credits
                  </button>

                  {!primaryOutpostUpgradeOption.canUpgrade &&
                    primaryOutpostUpgradeOption.blockedReason !== null && (
                      <p className="outpost-blocked-reason">
                        {primaryOutpostUpgradeOption.blockedReason}
                      </p>
                    )}
                </div>
              )}

              <PanelRow
                label="Support Slots"
                value={system.supportSlotCount.toString()}
              />
              <PanelRow
                label="Primary Outpost"
                value={
                  system.primaryOutpostId === null
                    ? "None"
                    : PRIMARY_OUTPOSTS[system.primaryOutpostId].name
                }
              />
              <PanelRow
                label="Outpost Level"
                value={system.primaryOutpostLevel.toString()}
              />
            </dl>
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

type AffinityGridProps = {
  affinities: AffinityProfile;
};

function AffinityGrid({ affinities }: AffinityGridProps) {
  return (
    <div className="affinity-grid">
      {Object.entries(affinities).map(([name, level]) => (
        <div key={name} className={`affinity-pill affinity-${level}`}>
          <span>{name}: </span>
          <strong>{level}</strong>
        </div>
      ))}
    </div>
  );
}