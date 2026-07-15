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

type ResearchWebProps = {
  research: ResearchState;
  startableProjectIds: ResearchProjectId[];
};

export function ResearchWeb({
  research,
  startableProjectIds,
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
        role="img"
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

          return (
            <ResearchNodeShell
              key={projectId}
              discipline={layout.discipline}
              kind={layout.kind}
              x={layout.x}
              y={layout.y}
              name={project.name}
              isCompleted={projectState.isCompleted}
              isActive={research.activeProjectId === projectId}
              canStart={startableProjectIdSet.has(projectId)}
            />
          );
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

type ResearchNodeShellProps = {
  discipline: ResearchDiscipline;
  kind: ResearchNodeKind;
  x: number;
  y: number;
  name: string;
  isCompleted: boolean;
  isActive: boolean;
  canStart: boolean;
};

function ResearchNodeShell({
  discipline,
  kind,
  x,
  y,
  name,
  isCompleted,
  isActive,
  canStart,
}: ResearchNodeShellProps) {
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
    kind === "foundation" ? "h-14 w-14" : "h-11 w-11";

  return (
    <div
      className={`
        absolute z-20
        flex -translate-x-1/2 -translate-y-1/2
        items-center justify-center
        rounded-full border-2
        text-[0.65rem] font-bold
        tracking-wide
        transition-colors
        ${sizeClassName}
        ${stateClassName}
      `}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      title={`${name} - ${stateLabel}`}
      aria-label={`${name}: ${stateLabel}`}
    >
      {getDisciplineCode(discipline)}
    </div>
  );
}

function getDisciplineCode(
  discipline: ResearchDiscipline,
): string {
  switch (discipline) {
    case "survey":
      return "SV";

    case "commerce":
      return "CO";

    case "science":
      return "SC";

    case "power":
      return "PW";

    case "extraction":
      return "EX";
  }
}