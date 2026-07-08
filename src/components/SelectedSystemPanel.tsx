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
import type { OutpostClaimOption } from "../game/systems/outpostSystem";
import { getSurveyRequirementForSystem } from "../game/systems/explorationSystem";

type SelectedSystemPanelProps = {
    gameState: GameState;
    system: StarSystem | null;
    activeSurvey: ActiveSurveyState | null;
    canBeginSurvey: boolean;
    outpostClaimOptions: OutpostClaimOption[];
    firstFreeSurveyAvailable: boolean;
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
    onBeginSurvey,
    onClaimOutpost,
}: SelectedSystemPanelProps) {
    if (system === null) {
        return (
            <aside className="system-panel">
                <h2>No System Selected</h2>
                <p>Select a star system to inspect it.</p>
            </aside>
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

    return (
        <aside className="system-panel">
            <p className="panel-kicker">
                {system.isHome ? "Home System" : "Star System"}
            </p>

            <h2>{system.name}</h2>

            <section className="panel-section">
                <h3>Status</h3>

                <dl>
                    <PanelRow label="ID" value={system.id} />
                    <PanelRow 
                        label="Coordinates"
                        value={`q: ${system.coord.q}, r: ${system.coord.r}`}
                    />
                    <PanelRow label="Star" value={system.starVisual} />
                    <PanelRow label="Exploration" value={system.explorationState} />
                    <PanelRow label="Claim" value={system.claimState} />
                    <PanelRow
                        label="Survey Requirement"
                        value={surveyRequirement.toString()}
                    />
                </dl>
            </section>
        <section className="panel-section">
        <h3>Survey</h3>

        <div className="survey-progress">
          <div className="survey-progress-label">
            <span>Progress</span>
            <strong>{surveyProgress}%</strong>
          </div>

          <div className="survey-progress-bar">
            <div
              className="survey-progress-fill"
              style={{ width: `${surveyProgress}%` }}
            />
          </div>
        </div>

        {activeSurvey !== null && (
          <p className="panel-note">Survey in progress...</p>
        )}

        {activeSurvey === null && canBeginSurvey && (
          <button
            className="primary-action-button"
            type="button"
            onClick={onBeginSurvey}
          >
            Begin First Free Survey
          </button>
        )}

        {activeSurvey === null &&
          !canBeginSurvey &&
          system.explorationState === "detected" &&
          !firstFreeSurveyAvailable && (
            <p className="panel-note">
              Further surveys require EP infrastructure. Coming in a later
              milestone.
            </p>
          )}

        {system.explorationState === "unknown" && (
          <p className="panel-note">
            This system is unknown. Survey nearby systems to detect it.
          </p>
        )}

        {system.explorationState === "surveyed" && (
          <p className="panel-note">Survey complete.</p>
        )}
      </section>

      <section className="panel-section">
        <h3>Outpost Potential</h3>

        <dl>
          
          {system.explorationState === "surveyed" &&
            system.claimState === "unclaimed" && (
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
                        { " . " }
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
        </dl>
      </section>

      <section className="panel-section">
        <h3>Affinities</h3>
        <AffinityGrid affinities={system.affinities} />
      </section>

      {system.hasGradCommand && (
        <p className="grad-command-note">GRaD Command established.</p>
      )}
    </aside>
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
                <div key={name} className={`affinity-pill affinity-#{level}`}>
                    <span>{name}: </span>
                    <strong>{level}</strong>
                </div>
            ))}
        </div>
    );
}