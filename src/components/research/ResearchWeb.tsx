import {
    RESEARCH_PROJECTS,
    type ResearchProjectId,
} from "../../game/config/research";
import type { ResearchState } from "../../game/types";
import {
    RESEARCH_WEB_CENTER,
    RESEARCH_WEB_CONNECTIONS,
    RESEARCH_WEB_LAYOUT,
    RESEARCH_WEB_PROJECT_IDS,
    type ResearchDiscipline,
    type ResearchNodeKind,
    type ResearchWebNodeLayout,
    type ResearchWebPointId,
} from "./researchWebLayout";
import { ResearchNodeIcon } from "./ResearchNodeIcon";

type ResearchWebProps = {
    research: ResearchState;
    startableProjectIds: ResearchProjectId[];
    selectedProjectId: ResearchProjectId | null;
    onSelectProject: (projectId: ResearchProjectId) => void;
};

export function ResearchWeb({
    research,
    startableProjectIds,
    selectedProjectId,
    onSelectProject,
}: ResearchWebProps) {
    const startableProjectIdSet = new Set(startableProjectIds);

    return (
        <div className="overflow-x-auto pb-2">
            <div
                className="
          relative mx-auto
          min-h-130 min-w-105
          overflow-hidden rounded-panel
          border border-ise-border
          bg-ise-void/55
        "
                role="group"
                aria-label="Research technology web"
            >
                <ResearchConnectionLayer
                    research={research}
                    startableProjectIdSet={startableProjectIdSet}
                />

                <ResearchCore />

                {RESEARCH_WEB_PROJECT_IDS.map((projectId) => {
                    const layout = getNodeLayout(projectId);
                    const project = RESEARCH_PROJECTS[projectId];
                    const projectState = research.projectsById[projectId];

                    if (layout === null || projectState === undefined) {
                        return null;
                    }

                    const progressPercent = calculateProgressPercent(
                        projectState.progress,
                        project.scienceCost,
                    );

                    return (
                        <ResearchNodeButton
                            key={projectId}
                            projectId={projectId}
                            discipline={layout.discipline}
                            kind={layout.kind}
                            x={layout.x}
                            y={layout.y}
                            name={project.name}
                            description={project.description}
                            scienceCost={project.scienceCost}
                            prerequisiteIds={project.prerequisiteIds}
                            progressPercent={progressPercent}
                            isCompleted={projectState.isCompleted}
                            isActive={research.activeProjectId === projectId}
                            canStart={startableProjectIdSet.has(projectId)}
                            isSelected={selectedProjectId === projectId}
                            onSelect={onSelectProject}
                        />
                    )
                })}
            </div>
        </div>
    );
}

type ResearchConnectionLayerProps = {
    research: ResearchState;
    startableProjectIdSet: Set<ResearchProjectId>;
};

function ResearchConnectionLayer({
    research,
    startableProjectIdSet,
}: ResearchConnectionLayerProps) {
    return (
        <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            {RESEARCH_WEB_CONNECTIONS.map((connection) => {
                const from = getWebPoint(connection.from);
                const to = getWebPoint(connection.to);

                if (from === null || to === null) {
                    return null;
                }

                const targetState = research.projectsById[connection.to];
                const isCompleted = targetState?.isCompleted === true;
                const isActive = research.activeProjectId === connection.to;
                const canStart = startableProjectIdSet.has(connection.to);

                const lineClassName = isCompleted
                    ? "text-ise-success"
                    : isActive
                        ? "text-ise-accent"
                        : canStart
                            ? "text-ise-info"
                            : "text-ise-border";

                return (
                    <line
                        key={`${connection.from}-${connection.to}`}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="currentColor"
                        strokeWidth={isActive ? 2 : 1.25}
                        strokeDasharray={
                            isCompleted || isActive || canStart
                                ? undefined
                                : "3 3"
                        }
                        vectorEffect="non-scaling-stroke"
                        className={lineClassName}
                    />
                );
            })}
        </svg>
    );
}

function getNodeLayout(
    projectId: ResearchProjectId,
): ResearchWebNodeLayout | null {
    const layoutByProjectId = RESEARCH_WEB_LAYOUT as Partial<
        Record<ResearchProjectId, ResearchWebNodeLayout>
    >;

    return layoutByProjectId[projectId] ?? null;
}

function getWebPoint(
    pointId: ResearchWebPointId,
): { x: number; y: number } | null {
    if (pointId === "research_core") {
        return RESEARCH_WEB_CENTER;
    }

    return getNodeLayout(pointId);
}

function ResearchCore() {
    return (
        <div
            className="
        absolute z-10
        flex h-20 w-20
        -translate-x-1/2 -translate-y-1/2
        flex-col items-center justify-center
        rounded-full
        border-2 border-ise-accent/50
        bg-ise-accent-muted
        text-center
        shadow-[0_0_24px_rgba(56,189,248,0.15)]
      "
            style={{
                left: `${RESEARCH_WEB_CENTER.x}%`,
                top: `${RESEARCH_WEB_CENTER.y}%`,
            }}
        >
            <strong className="text-xs font-bold tracking-wide text-ise-accent-hover">
                GRaD
            </strong>

            <span
                className="
          mt-0.5 text-[0.55rem]
          font-semibold uppercase
          tracking-[0.08em]
          text-ise-text-muted
        "
            >
                Research Core
            </span>
        </div>
    );
}

type ResearchNodeButtonProps = {
  projectId: ResearchProjectId;
  discipline: ResearchDiscipline;
  kind: ResearchNodeKind;
  x: number;
  y: number;
  name: string;
  description: string;
  scienceCost: number;
  prerequisiteIds: ResearchProjectId[];
  progressPercent: number;
  isCompleted: boolean;
  isActive: boolean;
  canStart: boolean;
  isSelected: boolean;
  onSelect: (projectId: ResearchProjectId) => void;
};

function ResearchNodeButton({
  projectId,
  discipline,
  kind,
  x,
  y,
  name,
  description,
  scienceCost,
  prerequisiteIds,
  progressPercent,
  isCompleted,
  isActive,
  canStart,
  isSelected,
  onSelect,
}: ResearchNodeButtonProps) {
  const stateLabel = isCompleted
    ? "Completed"
    : isActive
      ? "Active"
      : canStart
        ? "Available"
        : "Locked";

  const stateClassName = isCompleted
    ? `
        border-ise-success
        bg-ise-success/20
        text-ise-success
      `
    : isActive
      ? `
          border-ise-accent
          bg-ise-accent/20
          text-ise-accent-hover
          shadow-[0_0_18px_rgba(56,189,248,0.3)]
        `
      : canStart
        ? `
            border-ise-info/70
            bg-ise-info/15
            text-ise-info
          `
        : `
            border-ise-border
            bg-ise-background/80
            text-ise-text-subtle
            opacity-70
          `;

  const sizeClassName =
    kind === "foundation"
      ? "h-14 w-14"
      : "h-11 w-11";

  const selectedClassName = isSelected
    ? `
        ring-2 ring-ise-warning
        ring-offset-2 ring-offset-ise-void
      `
    : "";

  const tooltipVerticalClassName =
    y >= 65
      ? "bottom-[calc(100%+0.5rem)]"
      : "top-[calc(100%+0.5rem)]";

  const tooltipHorizontalClassName =
    x <= 20
      ? "left-0"
      : x >= 80
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      className="
        group absolute z-20
        -translate-x-1/2 -translate-y-1/2
      "
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      <button
        className={`
          relative flex items-center justify-center
          rounded-full border-2
          text-[0.65rem] font-bold
          tracking-wide
          transition-all
          hover:scale-105
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-ise-accent
          ${sizeClassName}
          ${stateClassName}
          ${selectedClassName}
        `}
        type="button"
        aria-label={`${name}: ${stateLabel}`}
        aria-pressed={isSelected}
        onClick={() => onSelect(projectId)}
      >
        <ResearchNodeIcon
          discipline={discipline}
          kind={kind}
        />

        {isActive && (
          <span
            className="
              absolute -inset-1.25
              rounded-full border
              border-ise-accent/50
            "
            aria-hidden="true"
          />
        )}

        {isCompleted && (
          <span
            className="
              absolute -right-1 -top-1
              flex h-4 w-4 items-center justify-center
              rounded-full border border-ise-success
              bg-ise-void text-[0.55rem]
              text-ise-success
            "
            aria-hidden="true"
          >
            ✓
          </span>
        )}
      </button>

      <ResearchNodeTooltip
        name={name}
        description={description}
        scienceCost={scienceCost}
        prerequisiteIds={prerequisiteIds}
        progressPercent={progressPercent}
        stateLabel={stateLabel}
        verticalClassName={tooltipVerticalClassName}
        horizontalClassName={tooltipHorizontalClassName}
      />
    </div>
  );
}

type ResearchNodeTooltipProps = {
  name: string;
  description: string;
  scienceCost: number;
  prerequisiteIds: ResearchProjectId[];
  progressPercent: number;
  stateLabel: string;
  verticalClassName: string;
  horizontalClassName: string;
};

function ResearchNodeTooltip({
  name,
  description,
  scienceCost,
  prerequisiteIds,
  progressPercent,
  stateLabel,
  verticalClassName,
  horizontalClassName,
}: ResearchNodeTooltipProps) {
  return (
    <div
      className={`
        pointer-events-none absolute z-50
        w-56 rounded-control
        border border-ise-border-strong
        bg-ise-surface p-3
        text-left shadow-xl

        invisible opacity-0
        transition-opacity duration-150

        group-hover:visible
        group-hover:opacity-100
        group-focus-within:visible
        group-focus-within:opacity-100

        ${verticalClassName}
        ${horizontalClassName}
      `}
      role="tooltip"
    >
      <div
        className="
          mb-2 flex items-start
          justify-between gap-2
        "
      >
        <strong
          className="
            text-xs font-semibold
            leading-tight text-ise-text
          "
        >
          {name}
        </strong>

        <span
          className="
            shrink-0 rounded-full
            border border-ise-border
            bg-ise-background/70
            px-1.5 py-0.5
            text-[0.55rem] font-semibold
            uppercase tracking-[0.06em]
            text-ise-text-muted
          "
        >
          {stateLabel}
        </span>
      </div>

      <p
        className="
          mt-0 mb-2 text-[0.65rem]
          leading-relaxed text-ise-text-muted
        "
      >
        {description}
      </p>

      <div
        className="
          grid gap-1 border-t
          border-ise-border pt-2
          text-[0.65rem]
        "
      >
        <TooltipMetric
          label="Science Cost"
          value={scienceCost.toFixed(0)}
          valueClassName="text-ise-science"
        />

        {(progressPercent > 0 || stateLabel === "Active") && (
          <TooltipMetric
            label="Progress"
            value={`${progressPercent}%`}
            valueClassName="text-ise-accent-hover"
          />
        )}

        {prerequisiteIds.length > 0 && (
          <div className="leading-relaxed">
            <span className="text-ise-text-subtle">
              Requires:{" "}
            </span>

            <span className="text-ise-text-muted">
              {formatPrerequisiteNames(prerequisiteIds)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

type TooltipMetricProps = {
  label: string;
  value: string;
  valueClassName: string;
};

function TooltipMetric({
  label,
  value,
  valueClassName,
}: TooltipMetricProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ise-text-subtle">
        {label}
      </span>

      <strong
        className={`
          tabular-nums
          ${valueClassName}
        `}
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
    Math.min(
      100,
      Math.round(
        (progress / scienceCost) * 100,
      ),
    ),
  );
}

function formatPrerequisiteNames(
  prerequisiteIds: ResearchProjectId[],
): string {
  return prerequisiteIds
    .map(
      (projectId) =>
        RESEARCH_PROJECTS[projectId].name,
    )
    .join(", ");
}