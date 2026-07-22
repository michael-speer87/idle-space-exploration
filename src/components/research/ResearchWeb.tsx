import {
  RESEARCH_PROGRAMS,
  type ResearchPrerequisite,
  type ResearchProjectId,
} from "../../game/config/research";
import type { ResearchState } from "../../game/types";
import {
  RESEARCH_WEB_CENTER,
  RESEARCH_WEB_CONNECTIONS,
  RESEARCH_WEB_LAYOUT,
  RESEARCH_WEB_PROJECT_IDS,
  type ResearchDirectorate,
  type ResearchNodeKind,
  type ResearchWebNodeLayout,
  type ResearchWebPointId,
} from "./researchWebLayout";
import { ResearchNodeIcon } from "./ResearchNodeIcon";
import { useEffect, useRef } from "react";

const RESEARCH_DIRECTORATE_LABELS:
  Array<{
    directorate: ResearchDirectorate;
    x: number;
    y: number;
  }> = [
    {
      directorate: "exploration",
      x: 50,
      y: 29,
    },
    {
      directorate: "industrial",
      x: 76,
      y: 50,
    },
    {
      directorate: "systems",
      x: 24,
      y: 50,
    },
    {
      directorate: "command",
      x: 50,
      y: 90,
    },
  ];

type ResearchWebProps = {
  research: ResearchState;
  startableProjectIds: ResearchProjectId[];
  selectedProjectId: ResearchProjectId | null;
  onSelectProject: (projectId: ResearchProjectId) => void;
  onDismissProject: () => void;
  onStartResearch: (projectId: ResearchProjectId) => void;
};

export function ResearchWeb({
  research,
  startableProjectIds,
  selectedProjectId,
  onSelectProject,
  onDismissProject,
  onStartResearch,
}: ResearchWebProps) {
  const startableProjectIdSet = new Set(startableProjectIds);

  const webRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleDocumentPointerDown(
      event: PointerEvent,
    ) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (webRootRef.current?.contains(target)) {
        return;
      }

      onDismissProject();
    }

    function handleDocumentKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onDismissProject();
      }
    }

    document.addEventListener(
      "pointerdown",
      handleDocumentPointerDown,
    );

    document.addEventListener(
      "keydown",
      handleDocumentKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleDocumentPointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleDocumentKeyDown,
      );
    };
  }, [onDismissProject]);

  return (
    <div
      ref={webRootRef}
      className="pb-2"
      onPointerDown={(event) => {
        const target = event.target;

        if (
          target instanceof Element &&
          target.closest("[data-research-node]")
        ) {
          return;
        }

        onDismissProject();
      }}
    >
      <div
        className="
          relative mx-auto
          h-[clamp(32rem,68vh,44rem)]
          w-full
          overflow-visible rounded-panel
          border border-ise-border
          bg-ise-void/55
        "
        role="group"
        aria-label="Research directorate web"
      >
        <ResearchConnectionLayer
          research={research}
          startableProjectIdSet={startableProjectIdSet}
        />

        <ResearchCore />

        {RESEARCH_DIRECTORATE_LABELS.map(
          ({ directorate, x, y }) => (
            <ResearchDirectorateLabel
              key={directorate}
              directorate={directorate}
              x={x}
              y={y}
            />
          ),
        )}

        {RESEARCH_WEB_PROJECT_IDS.map((projectId) => {
          const layout = getNodeLayout(projectId);

          const program =
            RESEARCH_PROGRAMS[projectId];

          const programState =
            research.projectsById[projectId];

          if (
            layout === null ||
            programState === undefined
          ) {
            return null;
          }

          const totalRanks =
            program.ranks.length;

          const completedRank = Math.min(
            totalRanks,
            Math.max(
              0,
              Math.floor(
                programState.completedRank,
              ),
            ),
          );

          const nextRank =
            program.ranks[completedRank] ?? null;

          const displayedRank =
            nextRank ??
            program.ranks[totalRanks - 1] ??
            null;

          if (displayedRank === null) {
            return null;
          }

          const nextRankNumber =
            nextRank !== null
              ? completedRank + 1
              : null;

          const isMastered =
            completedRank >= totalRanks;

          const progressPercent =
            nextRank !== null
              ? calculateProgressPercent(
                programState.progress,
                nextRank.scienceCost,
              )
              : 100;

          return (
            <ResearchNodeButton
              key={projectId}
              projectId={projectId}
              directorate={layout.directorate}
              kind={layout.kind}
              x={layout.x}
              y={layout.y}
              name={program.name}
              description={displayedRank.description}
              scienceCost={
                nextRank?.scienceCost ?? null
              }
              prerequisites={
                program.prerequisites
              }
              completedRank={completedRank}
              totalRanks={totalRanks}
              nextRankNumber={nextRankNumber}
              progressPercent={progressPercent}
              isMastered={isMastered}
              isActive={
                research.activeProjectId ===
                projectId
              }
              canStart={
                startableProjectIdSet.has(
                  projectId,
                )
              }
              isSelected={
                selectedProjectId === projectId
              }
              hasActiveResearch={
                research.activeProjectId !== null
              }
              onSelect={onSelectProject}
              onStartResearch={onStartResearch}
              onDismiss={onDismissProject}
            />
          )
        })}
      </div>

      <ResearchWebKey />
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

        const targetProgram =
          RESEARCH_PROGRAMS[connection.to];

        const targetState =
          research.projectsById[
          connection.to
          ];

        const isMastered =
          targetState !== undefined &&
          targetState.completedRank >=
          targetProgram.ranks.length;

        const isActive =
          research.activeProjectId ===
          connection.to;

        const canStart =
          startableProjectIdSet.has(
            connection.to,
          );

        const lineClassName = isMastered
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
              isMastered || isActive || canStart
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

type ResearchDirectorateLabelProps = {
  directorate: ResearchDirectorate;
  x: number;
  y: number;
};

function ResearchDirectorateLabel({
  directorate,
  x,
  y,
}: ResearchDirectorateLabelProps) {
  return (
    <span
      className="
        pointer-events-none absolute z-10
        -translate-x-1/2 -translate-y-1/2
        rounded-full border border-ise-border
        bg-ise-void/85 px-2 py-0.5
        text-[0.55rem] font-semibold uppercase
        tracking-[0.09em] text-ise-text-muted
        backdrop-blur-sm
      "
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      aria-hidden="true"
    >
      {formatDirectorateName(directorate)}
    </span>
  );
}

function ResearchWebKey() {
  return (
    <div
      className="
        mt-2 flex flex-wrap items-center
        justify-center gap-x-4 gap-y-1
        rounded-control border border-ise-border
        bg-ise-background/45 px-3 py-2
        text-[0.6rem] text-ise-text-muted
      "
      aria-label="Research node type key"
    >
      <ResearchWebKeyItem
        symbol="◆"
        label="Foundation"
      />

      <ResearchWebKeyItem
        symbol="▦"
        label="Infrastructure"
      />

      <ResearchWebKeyItem
        symbol="↗"
        label="Performance"
      />
    </div>
  );
}

type ResearchWebKeyItemProps = {
  symbol: string;
  label: string;
};

function ResearchWebKeyItem({
  symbol,
  label,
}: ResearchWebKeyItemProps) {
  return (
    <span className="flex items-center gap-1.5">
      <strong
        className="
          text-xs font-bold
          text-ise-accent-hover
        "
        aria-hidden="true"
      >
        {symbol}
      </strong>

      <span>{label}</span>
    </span>
  );
}

type ResearchNodeButtonProps = {
  projectId: ResearchProjectId;
  directorate: ResearchDirectorate;
  kind: ResearchNodeKind;
  x: number;
  y: number;
  name: string;
  description: string;
  scienceCost: number | null;
  prerequisites: ResearchPrerequisite[];
  completedRank: number;
  totalRanks: number;
  nextRankNumber: number | null;
  progressPercent: number;
  isMastered: boolean;
  isActive: boolean;
  canStart: boolean;
  isSelected: boolean;
  hasActiveResearch: boolean;
  onSelect: (projectId: ResearchProjectId) => void;
  onStartResearch: (projectId: ResearchProjectId) => void;
  onDismiss: () => void;
};

function ResearchNodeButton({
  projectId,
  directorate,
  kind,
  x,
  y,
  name,
  description,
  scienceCost,
  prerequisites,
  completedRank,
  totalRanks,
  nextRankNumber,
  progressPercent,
  isMastered,
  isActive,
  canStart,
  isSelected,
  hasActiveResearch,
  onSelect,
  onStartResearch,
  onDismiss,
}: ResearchNodeButtonProps) {
  const stateLabel = isMastered
    ? "Mastered"
    : isActive
      ? "Active"
      : canStart
        ? "Available"
        : "Locked";

  const rankLabel =
    isMastered
      ? `Rank ${totalRanks} of ${totalRanks}`
      : nextRankNumber !== null
        ? `Rank ${nextRankNumber} of ${totalRanks}`
        : null;

  const stateClassName = isMastered
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
      data-research-node
      className={`
        group absolute
        -translate-x-1/2 -translate-y-1/2
        ${isSelected ? "z-50" : "z-20"}
      `}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      <button
        className={`
          relative z-10
          flex items-center justify-center
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
        aria-label={
          isActive && rankLabel !== null
            ? `${name}: ${rankLabel}, ${progressPercent}% complete`
            : rankLabel !== null
              ? `${name}: ${stateLabel}, ${rankLabel}`
              : `${name}: ${stateLabel}`
        }
        aria-pressed={isSelected}
        onClick={() => {
          if (isSelected) {
            onDismiss();
            return;
          }

          onSelect(projectId);
        }}
      >
        <ResearchNodeIcon
          directorate={directorate}
          kind={kind}
        />

        {isActive && !isMastered && (
          <ActiveResearchProgressRing
            progressPercent={progressPercent}
          />
        )}

        {isMastered && (
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

        {totalRanks > 1 && !isMastered && (
          <span
            className="
              absolute -bottom-1 -right-1
              flex min-h-4 min-w-4
              items-center justify-center
              rounded-full
              border border-ise-border-strong
              bg-ise-void px-1
              text-[0.5rem] font-semibold
              tabular-nums text-ise-text-muted
            "
            aria-hidden="true"
          >
            {completedRank}/{totalRanks}
          </span>
        )}
      </button>

      <ResearchNodeTooltip
        projectId={projectId}
        name={name}
        description={description}
        scienceCost={scienceCost}
        prerequisites={prerequisites}
        completedRank={completedRank}
        totalRanks={totalRanks}
        nextRankNumber={nextRankNumber}
        progressPercent={progressPercent}
        stateLabel={stateLabel}
        directorate={directorate}
        kind={kind}
        canStart={canStart}
        isActive={isActive}
        isMastered={isMastered}
        isSelected={isSelected}
        hasActiveResearch={hasActiveResearch}
        verticalClassName={
          tooltipVerticalClassName
        }
        horizontalClassName={
          tooltipHorizontalClassName
        }
        onStartResearch={onStartResearch}
      />
    </div>
  );
}

type ActiveResearchProgressRingProps = {
  progressPercent: number;
};

function ActiveResearchProgressRing({
  progressPercent,
}: ActiveResearchProgressRingProps) {
  const clampedProgress = Math.max(
    0,
    Math.min(100, progressPercent),
  );

  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  const dashOffset =
    circumference *
    (1 - clampedProgress / 100);

  return (
    <svg
      className="
        pointer-events-none
        absolute -inset-1.5
        h-[calc(100%+12px)]
        w-[calc(100%+12px)]
        -rotate-90
      "
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        className="text-ise-accent/20"
      />

      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        className="
          text-ise-accent
          transition-all duration-300
        "
      />
    </svg>
  );
}

type ResearchNodeTooltipProps = {
  projectId: ResearchProjectId;
  name: string;
  description: string;
  scienceCost: number | null;
  prerequisites: ResearchPrerequisite[];
  completedRank: number;
  totalRanks: number;
  nextRankNumber: number | null;
  progressPercent: number;
  stateLabel: string;
  directorate: ResearchDirectorate;
  kind: ResearchNodeKind;
  canStart: boolean;
  isActive: boolean;
  isMastered: boolean;
  isSelected: boolean;
  hasActiveResearch: boolean;
  verticalClassName: string;
  horizontalClassName: string;
  onStartResearch:
  (projectId: ResearchProjectId) => void;
};

function ResearchNodeTooltip({
  projectId,
  name,
  description,
  scienceCost,
  prerequisites,
  completedRank,
  totalRanks,
  nextRankNumber,
  progressPercent,
  stateLabel,
  directorate,
  kind,
  canStart,
  isActive,
  isMastered,
  isSelected,
  hasActiveResearch,
  verticalClassName,
  horizontalClassName,
  onStartResearch,
}: ResearchNodeTooltipProps) {

  const actionLabel = isMastered
    ? "Program Mastered"
    : isActive
      ? nextRankNumber !== null
        ? `Researching Rank ${nextRankNumber}`
        : "Currently Researching"
      : !canStart
        ? "Research Locked"
        : hasActiveResearch
          ? nextRankNumber !== null
            ? `Switch to Rank ${nextRankNumber}`
            : "Switch Research"
          : nextRankNumber !== null
            ? `Research Rank ${nextRankNumber}`
            : "Start Research";

  return (
    <div
      className={`
        pointer-events-auto absolute z-40
        w-56 rounded-control
        border border-ise-border-strong
        bg-ise-surface p-3
        text-left shadow-xl

        transition-opacity duration-150

        ${isSelected
          ? "visible opacity-100"
          : "invisible opacity-0"
        }

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

      <div className="mb-2 flex flex-wrap gap-1">
        <span
          className="
      rounded-full border border-ise-border
      bg-ise-background/70 px-1.5 py-0.5
      text-[0.55rem] font-semibold uppercase
      tracking-[0.06em] text-ise-text-muted
    "
        >
          {formatDirectorateName(directorate)}
        </span>

        <span
          className="
      rounded-full border border-ise-border
      bg-ise-background/70 px-1.5 py-0.5
      text-[0.55rem] font-semibold uppercase
      tracking-[0.06em] text-ise-text-muted
    "
        >
          {formatNodeKindName(kind)}
        </span>

        <span
          className="
    rounded-full border
    border-ise-accent/30
    bg-ise-accent/10
    px-1.5 py-0.5
    text-[0.55rem] font-semibold
    uppercase tracking-[0.06em]
    text-ise-accent-hover
  "
        >
          {isMastered
            ? `${totalRanks}/${totalRanks} Ranks`
            : nextRankNumber !== null
              ? `Rank ${nextRankNumber}/${totalRanks}`
              : `${completedRank}/${totalRanks} Ranks`}
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
          label="Completed Ranks"
          value={`${completedRank}/${totalRanks}`}
          valueClassName="text-ise-success"
        />

        {scienceCost !== null && (
          <TooltipMetric
            label="Next Rank Cost"
            value={scienceCost.toFixed(0)}
            valueClassName="text-ise-science"
          />
        )}

        {(progressPercent > 0 || stateLabel === "Active") && (
          <TooltipMetric
            label="Progress"
            value={`${progressPercent}%`}
            valueClassName="text-ise-accent-hover"
          />
        )}

        {prerequisites.length > 0 && (
          <div className="leading-relaxed">
            <span className="text-ise-text-subtle">
              Requires:{" "}
            </span>

            <span className="text-ise-text-muted">
              {formatPrerequisiteNames(prerequisites)}
            </span>
          </div>
        )}
      </div>
      <button
        className={`
          mt-3 w-full rounded-control
          border px-3 py-2
          text-[0.65rem] font-semibold
          transition-colors
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-ise-accent

          ${isMastered || isActive || !canStart
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
          isMastered ||
          isActive ||
          !canStart
        }
        onClick={(event) => {
          event.stopPropagation();
          onStartResearch(projectId);
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function formatNodeKindName(
  kind: ResearchNodeKind,
): string {
  switch (kind) {
    case "foundation":
      return "Foundation";

    case "infrastructure":
      return "Infrastructure";

    case "performance":
      return "Performance";
  }
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
  prerequisites: ResearchPrerequisite[],
): string {
  return prerequisites
    .map(
      ({
        programId,
        requiredRank,
      }) =>
        `${RESEARCH_PROGRAMS[programId]
          .name
        } Rank ${requiredRank}`,
    )
    .join(", ");
}

function formatDirectorateName(
  directorate: ResearchDirectorate,
): string {
  switch (directorate) {
    case "exploration":
      return "Exploration";

    case "industrial":
      return "Industrial";

    case "systems":
      return "Systems";

    case "command":
      return "Command";
  }
}