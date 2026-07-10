import type { RunStatsSummary } from "../game/systems/runStatsSystem";
import { Panel } from "./ui/Panel";

type RunStatsPanelProps = {
  stats: RunStatsSummary;
};

export function RunStatsPanel({ stats }: RunStatsPanelProps) {
  return (
    <Panel
      title="Run Statistics"
      subtitle={`${stats.claimedSystems} of ${stats.totalSystems} systems claimed`}
    >
      <div className="grid gap-1.5">
        <StatRow label="Seed" value={stats.seed.toString()} />
        <StatRow label="Save Version" value={stats.saveVersion.toString()} />
        <StatRow label="Total Systems" value={stats.totalSystems.toString()} />
        <StatRow
          label="Claimed Systems"
          value={stats.claimedSystems.toString()}
        />

        <StatDivider label="Outposts" />

        <StatRow
          label="Survey Arrays"
          value={stats.outpostCountsById.survey_array.toString()}
        />
        <StatRow
          label="Commerce Hubs"
          value={stats.outpostCountsById.commerce_hub.toString()}
        />
        <StatRow
          label="Science Stations"
          value={stats.outpostCountsById.science_station.toString()}
        />
        <StatRow
          label="Power Relays"
          value={stats.outpostCountsById.power_relay.toString()}
        />
        <StatRow
          label="Extraction Rigs"
          value={stats.outpostCountsById.extraction_rig.toString()}
        />
        <StatRow
          label="Total Outpost Levels"
          value={stats.totalOutpostLevels.toString()}
        />

        <StatDivider label="Exploration" />

        <StatRow
          label="Unknown Systems"
          value={stats.unknownSystems.toString()}
        />
        <StatRow
          label="Detected Systems"
          value={stats.detectedSystems.toString()}
        />
        <StatRow
          label="Surveying Systems"
          value={stats.surveyingSystems.toString()}
        />
        <StatRow
          label="Surveyed Systems"
          value={stats.surveyedSystems.toString()}
        />

        <StatDivider label="Progression" />

        <StatRow
          label="Lifetime Influence"
          value={stats.lifetimeInfluence.toString()}
        />
        <StatRow label="Total Resets" value={stats.totalResets.toString()} />

        <StatDivider label="Current Activity" />

        <StatRow label="Active Survey" value={stats.activeSurveyLabel} />
        <StatRow
          label="Survey Progress"
          value={stats.activeSurveyProgressLabel}
        />
        
        <StatRow label="Active Research" value={stats.activeResearchLabel} />
        <StatRow
          label="Research Progress"
          value={stats.activeResearchProgressLabel}
        />
      </div>
    </Panel>
  );
}

type StatRowProps = {
  label: string;
  value: string;
};

function StatRow({ label, value }: StatRowProps) {
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
        className="
          min-w-0 truncate text-right
          font-semibold tabular-nums text-ise-text
        "
        title={value}
      >
        {value}
      </strong>
    </div>
  );
}

type StatDividerProps = {
  label: string;
};

function StatDivider({ label }: StatDividerProps) {
  return (
    <div
      className="
        mt-2 border-b border-ise-border
        px-2 pb-1
        text-[0.65rem] font-semibold uppercase
        tracking-[0.09em] text-ise-text-subtle
      "
    >
      {label}
    </div>
  );
}