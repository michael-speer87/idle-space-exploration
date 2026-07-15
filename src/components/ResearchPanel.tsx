import {
  RESEARCH_PROJECTS,
  type ResearchProjectId,
} from "../game/config/research";
import type { ResearchState } from "../game/types";
import { formatDuration } from "../game/utils/formatDuration";
import { ProgressBar } from "./ui/ProgressBar";
import { Section } from "./ui/Section";
import { ResearchWeb } from "./research/ResearchWeb";
import { useState, useEffect } from "react";
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
  ] = useState<ResearchProjectId | null>(
    research.activeProjectId ??
    startableProjectIds[0] ??
    null,
  );

  useEffect(() => {
    if (research.activeProjectId === null) {
      return;
    }

    setSelectedProjectId(research.activeProjectId);
  }, [research.activeProjectId]);

  const selectedProjectCanStart =
    selectedProjectId !== null &&
    startableProjectIds.includes(selectedProjectId);

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
        onSelect={(projectId) => {
          setSelectedProjectId(projectId);
        }}
      />

      <Section title="Research Viewport">
        <div
          className="
            min-h-80 rounded-panel
            border border-ise-border
            bg-ise-background/45 p-3
          "
          aria-label="Research project viewport"
        >
          <ResearchWeb
            research={research}
            startableProjectIds={startableProjectIds}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
          <ResearchProjectDetailCard
            projectId={selectedProjectId}
            research={research}
            canStart={selectedProjectCanStart}
            science={science}
            researchSpeedPerSecond={researchSpeedPerSecond}
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

type ResearchProjectDetailCardProps = {
  projectId: ResearchProjectId | null;
  research: ResearchState;
  canStart: boolean;
  science: number;
  researchSpeedPerSecond: number;
  onStartResearch: (
    projectId: ResearchProjectId,
  ) => void;
};

function ResearchProjectDetailCard({
  projectId,
  research,
  canStart,
  science,
  researchSpeedPerSecond,
  onStartResearch,
}: ResearchProjectDetailCardProps) {
  if (projectId === null) {
    return (
      <div
        className="
          mt-4 rounded-panel
          border border-dashed border-ise-border
          bg-ise-background/45
          px-4 py-6 text-center
        "
      >
        <p className="m-0 text-sm font-medium text-ise-text-muted">
          Select a Research node
        </p>

        <p
          className="
            mt-2 mb-0 text-xs
            leading-relaxed text-ise-text-subtle
          "
        >
          Choose a node in the Research Web to inspect its
          requirements, effects, and current progress.
        </p>
      </div>
    );
  }

  const project = RESEARCH_PROJECTS[projectId];
  const projectState =
    research.projectsById[projectId];

  if (!project || !projectState) {
    return null;
  }

  const isCompleted = projectState.isCompleted;
  const isActive =
    research.activeProjectId === projectId;

  const progressPercent = calculateProgressPercent(
    projectState.progress,
    project.scienceCost,
  );

  const remainingScience = Math.max(
    0,
    project.scienceCost - projectState.progress,
  );

  const estimatedSeconds =
    remainingScience > 0 &&
      researchSpeedPerSecond > 0
      ? remainingScience / researchSpeedPerSecond
      : null;

  const estimatedTimeLabel = isCompleted
    ? "Complete"
    : estimatedSeconds !== null
      ? formatDuration(estimatedSeconds)
      : "Research paused";

  const stateLabel = isCompleted
    ? "Completed"
    : isActive
      ? "Active"
      : canStart
        ? "Available"
        : "Locked";

  const actionLabel = isCompleted
    ? "Completed"
    : isActive
      ? "Researching"
      : canStart
        ? research.activeProjectId !== null
          ? "Switch Research"
          : "Start Research"
        : "Locked";

  return (
    <article
      className={`
        mt-4 rounded-panel border p-4
        ${isCompleted
          ? `
                border-ise-success/35
                bg-ise-success/10
              `
          : isActive
            ? `
                  border-ise-accent/45
                  bg-ise-accent-muted/50
                `
            : canStart
              ? `
                    border-ise-info/35
                    bg-ise-surface
                  `
              : `
                    border-ise-border
                    bg-ise-background/60
                  `
        }
      `}
    >
      <div
        className="
          flex items-start
          justify-between gap-3
        "
      >
        <div className="min-w-0">
          <span
            className="
              text-[0.6rem] font-semibold
              uppercase tracking-[0.09em]
              text-ise-text-subtle
            "
          >
            Selected Research
          </span>

          <h3
            className="
              mt-1 mb-0 text-base
              font-semibold text-ise-text
            "
          >
            {project.name}
          </h3>
        </div>

        <ResearchStateBadge
          label={stateLabel}
          isCompleted={isCompleted}
          isActive={isActive}
          canStart={canStart}
        />
      </div>

      <p
        className="
          mt-3 mb-0 text-xs
          leading-relaxed text-ise-text-muted
        "
      >
        {project.description}
      </p>

      {project.prerequisiteIds.length > 0 && (
        <div
          className="
            mt-3 rounded-control
            border border-ise-border
            bg-ise-background/60 p-2.5
            text-xs leading-relaxed
          "
        >
          <span className="text-ise-text-subtle">
            Prerequisite:{" "}
          </span>

          <span className="font-medium text-ise-text">
            {formatPrerequisites(
              project.prerequisiteIds,
            )}
          </span>
        </div>
      )}

      <div className="mt-4">
        <ProgressBar
          value={progressPercent}
          ariaLabel={`Research progress for ${project.name}`}
          colorClassName={
            isCompleted
              ? "bg-ise-success"
              : "bg-ise-accent"
          }
          label={
            <>
              <span className="text-ise-text-muted">
                Progress
              </span>

              <strong
                className="
                  tabular-nums text-ise-text
                "
              >
                {projectState.progress.toFixed(1)} /{" "}
                {project.scienceCost.toFixed(0)}
              </strong>
            </>
          }
        />
      </div>

      <div
        className="
          mt-4 grid grid-cols-2 gap-2
          rounded-control border border-ise-border
          bg-ise-background/55 p-2
        "
      >
        <ResearchMetric
          label="Science Cost"
          value={project.scienceCost.toFixed(0)}
          valueClassName="text-ise-science"
        />

        <ResearchMetric
          label="Remaining"
          value={remainingScience.toFixed(1)}
          valueClassName="text-ise-science"
        />

        <ResearchMetric
          label="Stored Science"
          value={science.toFixed(1)}
          valueClassName="text-ise-science"
        />

        <ResearchMetric
          label="Estimated Time"
          value={estimatedTimeLabel}
          valueClassName="text-ise-accent-hover"
        />
      </div>

      <button
        className={`
          mt-4 w-full rounded-control
          border px-3 py-2.5
          text-xs font-semibold
          transition-colors
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-ise-accent
          ${isCompleted || isActive || !canStart
            ? `
                  cursor-not-allowed
                  border-ise-border
                  bg-ise-void/60
                  text-ise-text-subtle
                `
            : `
                  border-ise-accent/40
                  bg-ise-accent-muted
                  text-ise-accent-hover
                  hover:bg-ise-accent/25
                `
          }
        `}
        type="button"
        disabled={
          isCompleted ||
          isActive ||
          !canStart
        }
        onClick={() =>
          onStartResearch(projectId)
        }
      >
        {actionLabel}
      </button>
    </article>
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

type ResearchStateBadgeProps = {
  label: string;
  isCompleted: boolean;
  isActive: boolean;
  canStart: boolean;
};

function ResearchStateBadge({
  label,
  isCompleted,
  isActive,
  canStart,
}: ResearchStateBadgeProps) {
  const stateClasses = isCompleted
    ? `
        border-ise-success/35
        bg-ise-success/10
        text-ise-success
      `
    : isActive
      ? `
          border-ise-accent/35
          bg-ise-accent/10
          text-ise-accent-hover
        `
      : canStart
        ? `
            border-ise-info/35
            bg-ise-info/10
            text-ise-info
          `
        : `
            border-ise-border
            bg-ise-background/70
            text-ise-text-subtle
          `;

  return (
    <span
      className={`
        shrink-0 rounded-full border
        px-2 py-0.5
        text-[0.6rem] font-semibold uppercase
        tracking-[0.08em]
        ${stateClasses}
      `}
    >
      {label}
    </span>
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

function formatPrerequisites(
  prerequisiteIds: ResearchProjectId[],
): string {
  return prerequisiteIds
    .map((projectId) => RESEARCH_PROJECTS[projectId].name)
    .join(", ");
}