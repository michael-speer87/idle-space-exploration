import type { InfluenceResetPreview } from "../game/systems/influenceSystem";
import type { RunObjectiveProgress } from "../game/systems/progressionSystem";

type RunProgressPanelProps = {
  progress: RunObjectiveProgress;
  resetPreview: InfluenceResetPreview;
  onPerformInfluenceReset: () => void;
};

export function RunProgressPanel({ 
  progress,
  resetPreview,
  onPerformInfluenceReset, 
}: RunProgressPanelProps) {
  return (
    <div className="run-progress-panel">
      <h2>Run Objective</h2>

      <p className="run-progress-status">
        Claim systems to authorize the first Influence reset.
      </p>

      <div className="survey-progress">
        <div className="survey-progress-label">
          <span>Claimed Systems</span>
          <strong>
            {progress.claimedSystemCount} / {progress.claimedSystemRequirement}
          </strong>
        </div>

        <div className="survey-progress-bar">
          <div
            className="survey-progress-fill"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="influence-summary">
        <p>
          Lifetime Influence:{" "}
          <strong>{resetPreview.currentLifetimeInfluence}</strong>
        </p>

        <p>
          Current Bonus:{" "}
          <strong>
            {formatMultiplierBonus(resetPreview.currentOutputMultiplier)}
          </strong>
        </p>

        {resetPreview.canReset && (
          <p>
            Reset Gain: <strong>+{resetPreview.influenceGain}</strong>
          </p>
        )}
      </div>

      {progress.isInfluenceResetReady ? (
        <button
          className="primary-action-button"
          type="button"
          onClick={onPerformInfluenceReset}
        >
          Perform Influence Reset
        </button>
      ) : (
        <p className="panel-note">
          {resetPreview.blockedReason ?? "Influence reset locked."}
        </p>
      )}
    </div>
  );
}

function formatMultiplierBonus(multiplier: number): string {
  const bonusPercent = Math.round((multiplier - 1) * 100);
  
  return `+${bonusPercent}% output`;
}