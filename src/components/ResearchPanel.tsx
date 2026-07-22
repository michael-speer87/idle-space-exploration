import {
  RESEARCH_PROGRAMS,
  type ResearchProjectId,
} from "../game/config/research";
import type { ResearchState } from "../game/types";
import { formatDuration } from "../game/utils/formatDuration";
import { ProgressBar } from "./ui/ProgressBar";
import { Section } from "./ui/Section";
import { ResearchWeb } from "./research/ResearchWeb";
import { useState, useCallback } from "react";
import { RESEARCH_WEB_PROJECT_IDS } from "./research/researchWebLayout";

type ResearchPanelProps = {
  research: ResearchState;
  startableProjectIds: ResearchProjectId[];
  science: number;
  sciencePerSecond: number;
  researchCapacityPerSecond: number;
  researchSpeedPerSecond: number;
  onStartResearch:
  (projectId: ResearchProjectId) => void;
};

export function ResearchPanel({
  research,
  startableProjectIds,
  science,
  sciencePerSecond,
  researchCapacityPerSecond,
  researchSpeedPerSecond,
  onStartResearch,
}: ResearchPanelProps) {

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState<ResearchProjectId | null>(null);

  const handleSelectProject = useCallback(
    (projectId: ResearchProjectId) => {
      setSelectedProjectId(projectId);
    },
    [],
  );

  const handleDismissProject = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  const activeProgram =
    research.activeProjectId !== null
      ? RESEARCH_PROGRAMS[
      research.activeProjectId
      ]
      : null;

  const activeProgramState =
    research.activeProjectId !== null
      ? research.projectsById[
      research.activeProjectId
      ]
      : null;

  const activeRank =
    activeProgram !== null &&
      activeProgramState !== null
      ? activeProgram.ranks[
      activeProgramState.completedRank
      ] ?? null
      : null;

  const activeRankNumber =
    activeRank !== null &&
      activeProgramState !== null
      ? activeProgramState.completedRank + 1
      : null;

  const activeRankLabel =
    activeProgram !== null &&
      activeRankNumber !== null
      ? `Rank ${activeRankNumber} of ${activeProgram.ranks.length}`
      : null;

  const activeProgressPercent =
    activeRank !== null &&
      activeProgramState !== null
      ? calculateProgressPercent(
        activeProgramState.progress,
        activeRank.scienceCost,
      )
      : 0;

  const activeResearchSecondsRemaining =
    activeRank !== null &&
      activeProgramState !== null &&
      researchSpeedPerSecond > 0
      ? Math.max(
        0,
        (
          activeRank.scienceCost -
          activeProgramState.progress
        ) / researchSpeedPerSecond,
      )
      : null;

  const activeResearchEtaLabel =
    activeResearchSecondsRemaining !== null
      ? formatDuration(
        activeResearchSecondsRemaining,
      )
      : activeProgram === null ||
        activeRank === null
        ? "No active research"
        : researchCapacityPerSecond <= 0
          ? "Paused: No Research Academy"
          : sciencePerSecond <= 0
            ? "Paused: No fresh Science"
            : "Research paused";

  const completedRankCount =
    RESEARCH_WEB_PROJECT_IDS.reduce(
      (total, projectId) => {
        const program =
          RESEARCH_PROGRAMS[projectId];

        const programState =
          research.projectsById[projectId];

        const completedRank =
          programState?.completedRank ?? 0;

        return (
          total +
          Math.min(
            program.ranks.length,
            Math.max(0, completedRank),
          )
        );
      },
      0,
    );

  const totalRankCount =
    RESEARCH_WEB_PROJECT_IDS.reduce(
      (total, projectId) =>
        total +
        RESEARCH_PROGRAMS[projectId]
          .ranks.length,
      0,
    );

  return (
    <div className="grid gap-4">
      <ResearchStatusSummary
        science={science}
        sciencePerSecond={sciencePerSecond}
        researchCapacityPerSecond={
          researchCapacityPerSecond
        }
        researchSpeedPerSecond={
          researchSpeedPerSecond
        }
        completedRankCount={
          completedRankCount
        }
        totalRankCount={
          totalRankCount
        }
      />

      <ActiveResearchStrip
        projectId={research.activeProjectId}
        projectName={activeProgram?.name ?? null}
        rankLabel={activeRankLabel}
        progressPercent={activeProgressPercent}
        etaLabel={activeResearchEtaLabel}
        onSelect={handleSelectProject}
      />
      <Section title="Research Viewport">
        <div
          className="
            min-h-0 rounded-panel
            border border-ise-border
            bg-ise-background/45 p-3
          "
          aria-label="Research project viewport"
        >
          <ResearchWeb
            research={research}
            startableProjectIds={startableProjectIds}
            selectedProjectId={selectedProjectId}
            onSelectProject={handleSelectProject}
            onDismissProject={handleDismissProject}
            onStartResearch={(projectId) => {
              setSelectedProjectId(projectId);
              onStartResearch(projectId);
            }}
          />
        </div>
      </Section>
    </div>
  );
}

type ResearchStatusSummaryProps = {
  science: number;
  sciencePerSecond: number;
  researchCapacityPerSecond: number;
  researchSpeedPerSecond: number;
  completedRankCount: number;
  totalRankCount: number;
};

function ResearchStatusSummary({
  science,
  sciencePerSecond,
  researchCapacityPerSecond,
  researchSpeedPerSecond,
  completedRankCount,
  totalRankCount,
}: ResearchStatusSummaryProps) {
  return (
    <div
      className="
        grid grid-cols-2 gap-2
        rounded-panel border border-ise-border
        bg-ise-surface p-2
        md:grid-cols-5
      "
    >
      <ResearchMetric
        label="Stored Science"
        value={science.toFixed(1)}
        valueClassName="text-ise-science"
      />

      <ResearchMetric
        label="Science Flow"
        value={`${sciencePerSecond.toFixed(2)}/sec`}
        valueClassName="text-ise-science"
      />

      <ResearchMetric
        label="Academy Capacity"
        value={`${researchCapacityPerSecond.toFixed(2)}/sec`}
        valueClassName="text-ise-accent-hover"
      />

      <ResearchMetric
        label="Research Rate"
        value={`${researchSpeedPerSecond.toFixed(2)}/sec`}
        valueClassName="text-ise-accent-hover"
      />

      <ResearchMetric
        label="Ranks Completed"
        value={`${completedRankCount}/${totalRankCount}`}
        valueClassName="text-ise-success"
      />
    </div>
  );
}

type ActiveResearchStripProps = {
  projectId: ResearchProjectId | null;
  projectName: string | null;
  rankLabel: string | null;
  progressPercent: number;
  etaLabel: string;
  onSelect: (projectId: ResearchProjectId) => void;
};

function ActiveResearchStrip({
  projectId,
  projectName,
  rankLabel,
  progressPercent,
  etaLabel,
  onSelect,
}: ActiveResearchStripProps) {
  if (projectId === null || projectName === null) {
    return (
      <div
        className="
          flex items-center justify-between gap-3
          rounded-panel border border-dashed border-ise-border
          bg-ise-background/45 px-3 py-2.5
        "
      >
        <div className="min-w-0">
          <span
            className="
              block text-[0.6rem] font-semibold uppercase
              tracking-[0.08em] text-ise-text-subtle
            "
          >
            Active Research
          </span>

          <strong
            className="
              mt-0.5 block text-xs font-semibold
              text-ise-text-muted
            "
          >
            No active program
          </strong>
        </div>

        <span
          className="
            shrink-0 text-[0.65rem]
            text-ise-text-subtle
          "
        >
          Select a node
        </span>
      </div>
    );
  }

  return (
    <button
      className="
        w-full rounded-panel
        border border-ise-accent/35
        bg-ise-accent-muted/35
        px-3 py-2.5 text-left
        transition-colors
        hover:border-ise-accent/55
        hover:bg-ise-accent-muted/55
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-ise-accent
      "
      type="button"
      onClick={() => onSelect(projectId)}
      aria-label={
        rankLabel !== null
          ? `View active Research: ${projectName}, ${rankLabel}`
          : `View active Research: ${projectName}`
      }
    >
      <div
        className="
          mb-2 flex items-center
          justify-between gap-3
        "
      >
        <div className="min-w-0">
          <span
            className="
              block text-[0.6rem] font-semibold uppercase
              tracking-[0.08em] text-ise-accent-hover
            "
          >
            Active Research
          </span>

          <div
            className="
              mt-0.5 flex min-w-0
              items-center gap-2
            "
          >
            <strong
              className="
                min-w-0 truncate
                text-xs font-semibold text-ise-text
              "
              title={projectName}
            >
              {projectName}
            </strong>

            {rankLabel !== null && (
              <span
                className="
                  shrink-0 rounded-full
                  border border-ise-accent/30
                  bg-ise-accent/10
                  px-1.5 py-0.5
                  text-[0.55rem] font-semibold
                  uppercase tracking-[0.06em]
                  text-ise-accent-hover
                "
              >
                {rankLabel}
              </span>
            )}
          </div>
        </div>

        <div
          className="
            flex shrink-0 items-center gap-2
            text-[0.65rem]
          "
        >
          <span className="tabular-nums text-ise-text-muted">
            {etaLabel}
          </span>

          <span
            className="
              rounded-full border border-ise-accent/35
              bg-ise-accent/10 px-2 py-0.5
              font-semibold tabular-nums
              text-ise-accent-hover
            "
          >
            {progressPercent}%
          </span>
        </div>
      </div>

      <ProgressBar
        value={progressPercent}
        height="sm"
        ariaLabel={
          rankLabel !== null
            ? `Research progress for ${projectName}, ${rankLabel}`
            : `Research progress for ${projectName}`
        }
      />

      <span
        className="
          mt-1.5 block text-right
          text-[0.6rem] font-medium
          text-ise-text-subtle
        "
      >
        Click to view details
      </span>
    </button>
  );
}

type ResearchMetricProps = {
  label: string;
  value: string;
  valueClassName: string;
};

function ResearchMetric({
  label,
  value,
  valueClassName,
}: ResearchMetricProps) {
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
          text-xs font-semibold tabular-nums
          ${valueClassName}
        `}
        title={value}
      >
        {value}
      </strong>
    </div>
  );
}

function calculateProgressPercent(
  progress: number,
  scienceCost: number,
): number {
  if (scienceCost <= 0) {
    return 100;
  }

  return Math.max(
    0,
    Math.min(100, Math.round((progress / scienceCost) * 100)),
  );
}