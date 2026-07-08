import type { RunStatsSummary } from "../game/systems/runStatsSystem";

type RunStatsPanelProps = {
  stats: RunStatsSummary;
};

export function RunStatsPanel({ stats }: RunStatsPanelProps) {
  return (
    <div className="run-stats-panel">
      <h2>Run Stats</h2>

      <div className="run-stats-grid">
        <StatRow label="Seed" value={stats.seed.toString()} />
        <StatRow label="Save Version" value={stats.saveVersion.toString()} />
        <StatRow label="Total Systems" value={stats.totalSystems.toString()} />
        <StatRow
          label="Claimed Systems"
          value={stats.claimedSystems.toString()}
        />
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

        <StatRow
          label="Lifetime Influence"
          value={stats.lifetimeInfluence.toString()}
        />
        <StatRow label="Total Resets" value={stats.totalResets.toString()} />

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
    </div>
  );
}

type StatRowProps = {
  label: string;
  value: string;
};

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="run-stat-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}