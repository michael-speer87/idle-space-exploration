import type { InfluenceResetPreview } from "../game/systems/influenceSystem";
import type { RunObjectiveProgress } from "../game/systems/progressionSystem";
import { Panel } from "./ui/Panel";

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
    <Panel
      title="Run Objective"
      subtitle="Claim systems to authorize an Influence reset."
      rightSlot={
        progress.isInfluenceResetReady ? (
          <span className="font-semibold text-ise-success">Ready</span>
        ) : (
          <span className="tabular-nums">
            {progress.claimedSystemCount}/{progress.claimedSystemRequirement}
          </span>
        )
      }
    >
      <div className="grid gap-4">
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3 text-xs">
            <span className="text-ise-text-muted">Claimed Systems</span>

            <strong className="tabular-nums text-ise-text">
              {progress.isInfluenceResetReady
                ? `${progress.claimedSystemCount} claimed`
                : `${progress.claimedSystemCount} / ${progress.claimedSystemRequirement}`}
            </strong>
          </div>

          <div
            className="
              h-2 overflow-hidden rounded-full
              border border-ise-border
              bg-ise-void
            "
            role="progressbar"
            aria-label="Claimed systems progress"
            aria-valuemin={0}
            aria-valuemax={progress.claimedSystemRequirement}
            aria-valuenow={Math.min(
              progress.claimedSystemCount,
              progress.claimedSystemRequirement,
            )}
          >
            <div
              className={`
                h-full rounded-full transition-[width] duration-300
                ${progress.isInfluenceResetReady
                  ? "bg-ise-success"
                  : "bg-ise-accent"
                }
              `}
              style={{
                width: `${Math.min(progress.progressPercent, 100)}%`,
              }}
            />
          </div>
        </div>

        <div
          className="
            grid gap-1.5 rounded-control
            border border-ise-border
            bg-ise-background/60 p-2
          "
        >
          <InfluenceRow
            label="Lifetime Influence"
            value={resetPreview.currentLifetimeInfluence.toString()}
          />

          <InfluenceRow
            label="Total Resets"
            value={resetPreview.totalResets.toString()}
          />

          <InfluenceRow
            label="Expedition Funding"
            value={`${resetPreview.currentExpeditionFunding} Credits`}
          />

          <InfluenceRow
            label="Current Bonus"
            value={formatMultiplierBonus(
              resetPreview.currentOutputMultiplier,
            )}
          />

          <InfluenceRow
            label="Next Bonus"
            value={formatMultiplierBonus(resetPreview.nextOutputMultiplier)}
          />

          {resetPreview.canReset && (
            <>
              <InfluenceDivider />

              <InfluenceRow
                label="Reset Gain"
                value={`+${resetPreview.influenceGain} Influence`}
                emphasized
              />

              <InfluenceRow
                label="Next Expedition"
                value={`${resetPreview.nextExpeditionFunding} Credits`}
                emphasized
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
            <p
              className="
                m-0 rounded-control
                border border-ise-success/35
                bg-ise-success/10 p-3
                text-xs leading-relaxed text-ise-success
              "
            >
              Reset authorized. Claim more systems before resetting to gain
              additional Influence.
            </p>

            <button
              className="
                w-full rounded-control
                border border-ise-warning/40
                bg-ise-warning/15 px-3 py-2.5
                text-sm font-semibold text-ise-warning
                transition-colors
                hover:bg-ise-warning/25
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-ise-warning
              "
              type="button"
              onClick={onPerformInfluenceReset}
            >
              Perform Influence Reset
            </button>
          </>
        ) : (
          <p
            className="
              m-0 rounded-control
              border border-ise-border
              bg-ise-void/45 p-3
              text-xs leading-relaxed text-ise-text-muted
            "
          >
            {resetPreview.blockedReason ?? "Influence reset locked."}
          </p>
        )}
      </div>
    </Panel>
  );
}

type InfluenceRowProps = {
  label: string;
  value: string;
  emphasized?: boolean;
};

function InfluenceRow({
  label,
  value,
  emphasized = false,
}: InfluenceRowProps) {
  return (
    <div
      className="
        flex min-w-0 items-baseline justify-between gap-3
        rounded-control px-2 py-1
        text-xs
        hover:bg-ise-surface-hover/50
      "
    >
      <span className="min-w-0 text-ise-text-muted">{label}</span>

      <strong
        className={`
          min-w-0 truncate text-right font-semibold tabular-nums
          ${emphasized ? "text-ise-influence" : "text-ise-text"}
        `}
        title={value}
      >
        {value}
      </strong>
    </div>
  );
}

function InfluenceDivider() {
  return <div className="my-1 border-t border-ise-border" />;
}

function formatMultiplierBonus(multiplier: number): string {
  const bonusPercent = Math.round((multiplier - 1) * 100);

  return `+${bonusPercent}% output`;
}