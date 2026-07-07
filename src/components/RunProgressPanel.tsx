import type { RunObjectiveProgress } from "../game/systems/progressionSystem";

type RunProgressPanelProps = {
  progress: RunObjectiveProgress;
};

export function RunProgressPanel({ progress }: RunProgressPanelProps) {
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

      <p
        className={
          progress.isInfluenceResetReady
            ? "run-progress-ready"
            : "panel-note"
        }
      >
        {progress.isInfluenceResetReady
          ? "Influence reset authorization ready."
          : "Influence reset locked."}
      </p>
    </div>
  );
}