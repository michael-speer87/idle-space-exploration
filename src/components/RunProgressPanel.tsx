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
        Claim systems to authorize an Influence reset.
      </p>

      <div className="survey-progress">
        <div className="survey-progress-label">
          <span>Claimed Systems</span>
          <strong>
            {progress.claimedSystemCount}
            {progress.isInfluenceResetReady
              ? " claimed"
              : ` / ${progress.claimedSystemRequirement}`}
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
        <InfluenceRow
          label="Lifetime Influence"
          value={resetPreview.currentLifetimeInfluence.toString()}
        />

        <InfluenceRow
          label="Total Resets"
          value={resetPreview.totalResets.toString()}
        />

        <InfluenceRow
          label="Current Bonus"
          value={formatMultiplierBonus(resetPreview.currentOutputMultiplier)}
        />

        <InfluenceRow
          label="Next Bonus"
          value={formatMultiplierBonus(resetPreview.nextOutputMultiplier)}
        />

        {resetPreview.canReset && (
          <>
            <InfluenceRow
              label="Reset Gain"
              value={`+${resetPreview.influenceGain} Influence`}
            />

            <InfluenceRow
              label="Next Influence"
              value={`${resetPreview.claimedSystemsNeededForNextInfluence} more claims`}
            />
          </>
        )}
      </div>

      {progress.isInfluenceResetReady ? (
        <>
          <p className="run-progress-ready">
            Reset authorized. Claim more systems before resetting to gain more
            Influence.
          </p>

          <button
            className="primary-action-button"
            type="button"
            onClick={onPerformInfluenceReset}
          >
            Perform Influence Reset
          </button>
        </>
      ) : (
        <p className="panel-note">
          {resetPreview.blockedReason ?? "Influence reset locked."}
        </p>
      )}
    </div>
  );
}

type InfluenceRowProps = {
  label: string;
  value: string;
};

function InfluenceRow({ label, value }: InfluenceRowProps) {
  return (
    <div className="influence-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>

  )
}

function formatMultiplierBonus(multiplier: number): string {
  const bonusPercent = Math.round((multiplier - 1) * 100);

  return `+${bonusPercent}% output`;
}