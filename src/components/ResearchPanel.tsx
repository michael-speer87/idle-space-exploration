import {
  RESEARCH_PROJECTS,
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
  researchSpeedPerSecond: number;
  onStartResearch: (projectId: ResearchProjectId) => void;
};

export function ResearchPanel({
  research,
  startableProjectIds,
  science,
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

  const activeProject =
    research.activeProjectId !== null
      ? RESEARCH_PROJECTS[research.activeProjectId]
      : null;

  const activeProjectState =
    research.activeProjectId !== null
      ? research.projectsById[research.activeProjectId]
      : null;

  const activeProgressPercent =
    activeProject !== null && activeProjectState !== null
      ? calculateProgressPercent(
        activeProjectState.progress,
        activeProject.scienceCost,
      )
      : 0;

  const activeResearchSecondsRemaining =
    activeProject !== null &&
      activeProjectState !== null &&
      researchSpeedPerSecond > 0
      ? Math.max(
        0,
        (activeProject.scienceCost - activeProjectState.progress) /
        researchSpeedPerSecond,
      )
      : null;

  const activeResearchEtaLabel =
    activeResearchSecondsRemaining !== null
      ? formatDuration(activeResearchSecondsRemaining)
      : researchSpeedPerSecond <= 0 && activeProject !== null
        ? "Research paused"
        : "No active research";

  const completedProjectCount =
    RESEARCH_WEB_PROJECT_IDS.filter(
      (projectId) =>
        research.projectsById[projectId]?.isCompleted === true,
    ).length;

  return (
    <div className="grid gap-4">
      <ResearchStatusSummary
        science={science}
        researchSpeedPerSecond={researchSpeedPerSecond}
        completedProjectCount={completedProjectCount}
        totalProjectCount={RESEARCH_WEB_PROJECT_IDS.length}
      />

      <ActiveResearchStrip
        projectId={research.activeProjectId}
        projectName={activeProject?.name ?? null}
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
  researchSpeedPerSecond: number;
  completedProjectCount: number;
  totalProjectCount: number;
};

function ResearchStatusSummary({
  science,
  researchSpeedPerSecond,
  completedProjectCount,
  totalProjectCount,
}: ResearchStatusSummaryProps) {
  return (
    <div
      className="
        grid grid-cols-3 gap-2
        rounded-panel border border-ise-border
        bg-ise-surface p-2
      "
    >
      <ResearchMetric
        label="Science"
        value={science.toFixed(1)}
        valueClassName="text-ise-science"
      />

      <ResearchMetric
        label="Research Speed"
        value={`${researchSpeedPerSecond.toFixed(2)}/sec`}
        valueClassName="text-ise-accent-hover"
      />

      <ResearchMetric
        label="Completed"
        value={`${completedProjectCount}/${totalProjectCount}`}
        valueClassName="text-ise-success"
      />
    </div>
  );
}

type ActiveResearchStripProps = {
  projectId: ResearchProjectId | null;
  projectName: string | null;
  progressPercent: number;
  etaLabel: string;
  onSelect: (projectId: ResearchProjectId) => void;
};

function ActiveResearchStrip({
  projectId,
  projectName,
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
            No active project
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
      aria-label={`View active Research: ${projectName}`}
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

          <strong
            className="
              mt-0.5 block truncate
              text-xs font-semibold text-ise-text
            "
            title={projectName}
          >
            {projectName}
          </strong>
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
        ariaLabel={`Research progress for ${projectName}`}
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