import type {
  ActiveSurveyState,
  AffinityProfile,
  GameState,
  StarSystem
} from "../game/types";
import { getExtractionStorageCapacity, PRIMARY_OUTPOSTS } from "../game/config/outposts"
import {
  SYSTEM_RARITIES,
  getSystemQualityScore,
  getSystemRarityFromStarVisual,
  type SystemRarity,
} from "../game/config/systemRarity";
import { getSurveyRequirementForSystem, getActiveSurveySpeed, } from "../game/systems/explorationSystem";
import { formatDuration } from "../game/utils/formatDuration";
import { Panel } from "./ui/Panel";
import { Section } from "./ui/Section";
import { ProgressBar } from "./ui/ProgressBar";
import {
  getSystemSurveyReport,
  type SystemSurveyReport,
} from "../game/content/systemSurveyReports";
import { getCommerceThroughput, getExtractionOutput, type CalculatedRates } from "../game/systems/rateSystem";
import { getInfluenceOutputMultiplier } from "../game/systems/influenceSystem";
import { formatNumber, formatRate } from "../game/utils/formatNumber";

type SelectedSystemPanelProps = {
  gameState: GameState;
  rates: CalculatedRates;
  system: StarSystem | null;
  activeSurvey: ActiveSurveyState | null;
  canBeginSurvey: boolean;
  firstFreeSurveyAvailable: boolean;
  onBeginSurvey: () => void;
  onOpenBuild: () => void;
};

export function SelectedSystemPanel({
  gameState,
  rates,
  system,
  activeSurvey,
  canBeginSurvey,
  firstFreeSurveyAvailable,
  onBeginSurvey,
  onOpenBuild
}: SelectedSystemPanelProps) {
  if (system === null) {
    return (
      <Panel
        title="Selected System"
        subtitle="No system selected"
      >
        <div
          className="
          rounded-control border border-dashed border-ise-border
          bg-ise-background/45 px-4 py-6 text-center
        "
        >
          <p className="m-0 text-sm text-ise-text-muted">
            Select a star system on the map to inspect it.
          </p>
        </div>
      </Panel>
    );
  }

  const surveyRequirement =
    activeSurvey !== null
      ? activeSurvey.requiredProgress
      : getSurveyRequirementForSystem(gameState, system.id);

  const surveyProgress =
    activeSurvey !== null
      ? Math.round((activeSurvey.progress / surveyRequirement) * 100)
      : system.explorationState === "surveyed"
        ? 100
        : 0;

  const activeSurveySpeed =
    activeSurvey !== null
      ? getActiveSurveySpeed(gameState)
      : 0;

  const surveyEtaLabel =
    activeSurvey === null
      ? "Not surveying"
      : activeSurveySpeed <= 0
        ? "Paused: No EP"
        : formatDuration(
          (
            activeSurvey.requiredProgress -
            activeSurvey.progress
          ) / activeSurveySpeed,
        );

  const isSurveyed = system.explorationState === "surveyed";
  const isRarityKnown = system.explorationState !== "unknown";

  const systemRarityId = getSystemRarityFromStarVisual(
    system.starVisual,
  );

  const systemRarity = SYSTEM_RARITIES[systemRarityId];

  const systemQualityScore = getSystemQualityScore(
    system.affinities,
    system.supportSlotCount,
  );

  const surveyReport = isSurveyed
    ? getSystemSurveyReport(system)
    : null;

  const currentOutpost =
    system.primaryOutpostId !== null
      ? PRIMARY_OUTPOSTS[system.primaryOutpostId]
      : null;

  const currentOutpostTitle =
    system.hasGradCommand
      ? "GRaD Command"
      : currentOutpost?.name ?? "No Primary Outpost";

  const currentOutpostDetail =
    system.hasGradCommand
      ? "Home System command complex"
      : currentOutpost !== null
        ? `level ${system.primaryOutpostLevel}`
        : isSurveyed
          ? "System ready to claim"
          : "Survey required before construction";

  const influenceOutputMultiplier =
    getInfluenceOutputMultiplier(gameState);

  const selectedExtractionProduction =
    currentOutpost?.category === "extraction"
      ? getExtractionOutput(gameState, system) *
      rates.productionEfficiency *
      influenceOutputMultiplier
      : 0;

  const selectedExtractionStorage =
    currentOutpost?.category === "extraction"
      ? getExtractionStorageCapacity(
        system.primaryOutpostLevel,
      )
      : 0;

  const selectedCommerceThroughput =
    currentOutpost?.category === "commerce"
      ? getCommerceThroughput(gameState, system) *
      rates.productionEfficiency *
      influenceOutputMultiplier
      : 0;

  const materialStorageIsFull =
    rates.materialCapacity > 0 &&
    gameState.resources.materials >=
    rates.materialCapacity - 0.01;

  const extractionStatus =
    getExtractionStatus({
      materialStorageIsFull,
      productionEfficiency: rates.productionEfficiency,
      actualProduction:
        rates.materialProductionPerSecond,
      potentialProduction:
        rates.potentialMaterialProductionPerSecond,
      materialSales:
        rates.materialSalesPerSecond,
    });

  const commerceStatus =
    getCommerceStatus({
      productionEfficiency: rates.productionEfficiency,
      actualSales: rates.materialSalesPerSecond,
      salesThroughput:
        rates.materialSalesThroughputPerSecond,
    });

  return (
    <Panel
      title={system.name}
      subtitle={system.isHome ? "Home System" : "Star System"}
      rightSlot={
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {surveyReport !== null && (
            <SurveyReportPopover
              key={system.id}
              systemName={system.name}
              report={surveyReport}
            />
          )}

          {isRarityKnown && (
            <SystemRarityBadge rarity={systemRarityId} />
          )}

          <span
            className={`
              rounded-full border px-2 py-0.5
              text-[0.65rem] font-semibold uppercase
              tracking-[0.08em]
              ${system.explorationState === "surveyed"
                ? "border-ise-success/35 bg-ise-success/10 text-ise-success"
                : system.explorationState === "surveying"
                  ? "border-ise-info/35 bg-ise-info/10 text-ise-info"
                  : "border-ise-border bg-ise-background/60 text-ise-text-muted"
              }
            `}
          >
            {system.explorationState}
          </span>
        </div>
      }
    >
      <div className="grid gap-4">
        <Section title="System Data" divider={false}>
          <div className="grid gap-3">
            <div
              className="
                grid grid-cols-2 gap-2 rounded-control
                border border-ise-border
                bg-ise-background/60 p-2
              "
            >
              <SystemMetric
                label="Survey Requirement"
                value={`${surveyRequirement} EP`}
              />

              <SystemMetric
                label="System Rarity"
                value={
                  isRarityKnown
                    ? systemRarity.name
                    : "Undetermined"
                }
              />

              {isSurveyed && (
                <>
                  <SystemMetric
                    label="Quality Score"
                    value={systemQualityScore.toString()}
                  />

                  <SystemMetric
                    label="Support Slots"
                    value={system.supportSlotCount.toString()}
                  />
                </>
              )}
            </div>

            {isSurveyed && (
              <div className="border-t border-ise-border pt-3">
                <h3
                  className="
                    mt-0 mb-2
                    text-[0.65rem] font-semibold uppercase
                    tracking-[0.09em] text-ise-text-subtle
                  "
                >
                  Affinities
                </h3>

                <AffinityGrid affinities={system.affinities} />
              </div>
            )}
          </div>
        </Section>

        <Section title="Survey">
          <div className="grid gap-3">
            <div
              className="
                rounded-control border border-ise-border
                bg-ise-background/60 p-3
              "
            >
              <ProgressBar
                value={surveyProgress}
                ariaLabel={`Survey progress for ${system.name}`}
                colorClassName={
                  system.explorationState === "surveyed"
                    ? "bg-ise-success"
                    : "bg-ise-accent"
                }
                label={
                  <>
                    <span className="font-medium text-ise-text-muted">
                      {activeSurvey !== null
                        ? "Surveying..."
                        : system.explorationState === "surveyed"
                          ? "Survey Complete"
                          : "Survey Progress"}
                    </span>

                    <strong className="tabular-nums text-ise-text">
                      {surveyProgress}%
                    </strong>
                  </>
                }
              />

              <div
                className="
                  mt-3 flex items-center justify-between gap-3
                  text-xs
                "
              >
                <span className="text-ise-text-muted">Estimated Time</span>

                <strong className="tabular-nums text-ise-text">
                  {surveyEtaLabel}
                </strong>
              </div>
            </div>

            {activeSurvey === null && canBeginSurvey && (
              <button
                className="
                  w-full rounded-control
                  border border-ise-accent/40
                  bg-ise-accent-muted px-3 py-2.5
                  text-sm font-semibold text-ise-accent-hover
                  transition-colors
                  hover:bg-ise-accent/25
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-ise-accent
                "
                type="button"
                onClick={onBeginSurvey}
              >
                Begin Survey
              </button>
            )}

            {activeSurvey !== null && (
              <p
                className="
                  m-0 rounded-control
                  border border-ise-info/30
                  bg-ise-info/10 p-3
                  text-xs leading-relaxed text-ise-info
                "
              >
                Survey operation in progress.
              </p>
            )}

            {activeSurvey === null &&
              !canBeginSurvey &&
              system.explorationState === "detected" &&
              !firstFreeSurveyAvailable && (
                <p
                  className="
                    m-0 rounded-control
                    border border-ise-border
                    bg-ise-void/45 p-3
                    text-xs leading-relaxed text-ise-text-muted
                  "
                >
                  Further surveys require EP infrastructure.
                </p>
              )}

            {system.explorationState === "unknown" && (
              <p
                className="
                  m-0 rounded-control
                  border border-ise-warning/30
                  bg-ise-warning/10 p-3
                  text-xs leading-relaxed text-ise-warning
                "
              >
                Survey a neighboring system to detect this location.
              </p>
            )}

            {system.explorationState === "surveyed" && (
              <p
                className="
                  m-0 rounded-control
                  border border-ise-success/30
                  bg-ise-success/10 p-3
                  text-xs leading-relaxed text-ise-success
                "
              >
                Survey complete. System data and outpost potential are available.
              </p>
            )}
          </div>
        </Section>

        <Section title="Current Outpost">
          <div className="grid gap-3">
            <div
              className="
                rounded-control border border-ise-border
                bg-ise-background/60 p-3
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span
                    className="
                      block text-[0.65rem] font-semibold uppercase
                      tracking-[0.08em] text-ise-text-subtle
                    "
                  >
                    {system.hasGradCommand
                      ? "Command Installation"
                      : "Primary Outpost"}
                  </span>

                  <strong
                    className="
              mt-1 block truncate text-sm
              font-semibold text-ise-text
            "
                    title={currentOutpostTitle}
                  >
                    {currentOutpostTitle}
                  </strong>

                  <span className="mt-1 block text-xs text-ise-text-muted">
                    {currentOutpostDetail}
                  </span>
                </div>

                <OutpostStateBadge
                  hasGradCommand={system.hasGradCommand}
                  hasOutpost={currentOutpost !== null}
                  isSurveyed={isSurveyed}
                />
              </div>
            </div>

            {!system.hasGradCommand && (
              <button
                className="
                  w-full rounded-control border
                  border-ise-accent/40
                  bg-ise-accent-muted px-3 py-2.5
                  text-sm font-semibold text-ise-accent-hover
                  transition-colors
                  hover:bg-ise-accent/25
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-ise-accent
                  disabled:cursor-not-allowed
                  disabled:border-ise-border
                  disabled:bg-ise-void/60
                  disabled:text-ise-text-subtle
                "
                type="button"
                disabled={!isSurveyed}
                onClick={onOpenBuild}
              >
                {!isSurveyed
                  ? "Survey Required"
                  : currentOutpost === null
                    ? "Choose Primary Outpost"
                    : "Manage Outpost"}
              </button>
            )}
          </div>
        </Section>

        {currentOutpost?.category === "extraction" && (
          <Section title="Material Network">
            <div className="grid gap-3">
              <div
                className="
          grid grid-cols-2 gap-2
          rounded-control border border-ise-border
          bg-ise-background/60 p-2
        "
              >
                <SystemMetric
                  label="Production Potential"
                  value={`${formatRate(
                    selectedExtractionProduction,
                  )} Materials/sec`}
                />

                <SystemMetric
                  label="Storage Provided"
                  value={`${formatNumber(
                    selectedExtractionStorage,
                  )} Materials`}
                />

                <SystemMetric
                  label="Network Storage"
                  value={`${formatNumber(
                    gameState.resources.materials,
                    {
                      maximumFractionDigits: 1,
                    },
                  )} / ${formatNumber(
                    rates.materialCapacity,
                  )}`}
                />

                <SystemMetric
                  label="Network Production"
                  value={`${formatRate(
                    rates.materialProductionPerSecond,
                  )} Materials/sec`}
                />
              </div>

              <EconomyStatus
                status={extractionStatus}
                tone={
                  extractionStatus === "Paused: Storage Full"
                    ? "warning"
                    : extractionStatus ===
                      "Limited by Commerce"
                      ? "warning"
                      : rates.productionEfficiency < 1
                        ? "warning"
                        : "success"
                }
              />
            </div>
          </Section>
        )}

        {currentOutpost?.category === "commerce" && (
          <Section title="Trade Operations">
            <div className="grid gap-3">
              <div
                className="
          grid grid-cols-2 gap-2
          rounded-control border border-ise-border
          bg-ise-background/60 p-2
        "
              >
                <SystemMetric
                  label="System Throughput"
                  value={`${formatRate(
                    selectedCommerceThroughput,
                  )} Materials/sec`}
                />

                <SystemMetric
                  label="Network Sales"
                  value={`${formatRate(
                    rates.materialSalesPerSecond,
                  )} Materials/sec`}
                />

                <SystemMetric
                  label="Material Value"
                  value={`${formatNumber(
                    rates.creditsPerMaterial,
                  )} Credit each`}
                />

                <SystemMetric
                  label="Trade Income"
                  value={`${formatRate(
                    rates.creditsPerSecond,
                  )} Credits/sec`}
                />
              </div>

              <EconomyStatus
                status={commerceStatus}
                tone={
                  commerceStatus === "Selling at Capacity"
                    ? "success"
                    : commerceStatus ===
                      "Waiting for Materials"
                      ? "neutral"
                      : "warning"
                }
              />
            </div>
          </Section>
        )}
      </div>
    </Panel>
  );
}

type SurveyReportPopoverProps = {
  systemName: string;
  report: SystemSurveyReport;
};

function SurveyReportPopover({
  systemName,
  report,
}: SurveyReportPopoverProps) {
  return (
    <details className="group relative">
      <summary
        className="
          flex h-6 w-6 cursor-pointer
          list-none items-center justify-center
          rounded-full border border-ise-info/40
          bg-ise-info/10
          text-xs font-bold text-ise-info
          transition-colors
          hover:bg-ise-info/20
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-ise-info
          [&::-webkit-details-marker]:hidden
        "
        title="Open GRaD survey report"
        aria-label={`Open survey report for ${systemName}`}
      >
        i
      </summary>

      <article
        className="
          absolute top-full left-0 z-40 mt-2
          w-52 max-w-[calc(100vw-2rem)]
          max-h-[clac(100vh-6rem)] overflow-y-auto
          rounded-panel border border-ise-border-strong
          bg-ise-surface p-3
          shadow-xl
        "
      >
        <div className="mb-3 border-b border-ise-border pb-2">
          <span
            className="
              block text-[0.6rem] font-semibold uppercase
              tracking-[0.09em] text-ise-info
            "
          >
            GRaD Survey Report
          </span>

          <strong className="mt-1 block text-sm text-ise-text">
            {systemName}
          </strong>
        </div>

        <p className="
            mt-0 mb-2 text-xs
            leading-relaxed text-ise-text-muted
          "
        >
          {report.overview}
        </p>

        <p className="
          mt-0 mb-3 text-xs
          leading-relaxed text-ise-text-muted
          "
        >
          {report.infrastructure}
        </p>

        <div
          className="
            rounded-control border border-ise-accent/25
            bg-ise-accent-muted p-2.5
          "
        >
          <span
            className="
              block text-[0.6rem] font-semibold uppercase
              tracking-[0.08em] text-ise-text-subtle
            "
          >
            Recommended Development
          </span>

          <strong
            className="
              mt-1 block text-xs
              font-semibold text-ise-accent-hover
            "
          >
            {report.recommendationTitle}
          </strong>

          <p
            className="
              mt-1 mb-0 text-xs
              leading-relaxed text-ise-text-muted
            "
          >
            {report.recommendationDetail}
          </p>
        </div>
      </article>
    </details>
  );
}

type SystemRarityBadgeProps = {
  rarity: SystemRarity;
};

function SystemRarityBadge({
  rarity,
}: SystemRarityBadgeProps) {
  const definition = SYSTEM_RARITIES[rarity];

  return (
    <span
      className={`
        rounded-full border px-2 py-0.5
        text-[0.65rem] font-semibold uppercase
        tracking-[0.08em]
        ${getSystemRarityClasses(rarity)}
      `}
    >
      {definition.name}
    </span>
  );
}

function getSystemRarityClasses(
  rarity: SystemRarity,
): string {
  switch (rarity) {
    case "ultra_rare":
      return "border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff8d8d]";

    case "very_rare":
      return "border-[#7ab7ff]/40 bg-[#7ab7ff]/10 text-[#9bcbff]";

    case "rare":
      return "border-[#f4f7ff]/35 bg-[#f4f7ff]/10 text-[#f4f7ff]";

    case "uncommon":
      return "border-[#ffa24c]/40 bg-[#ffa24c]/10 text-[#ffb873]";

    case "common":
    default:
      return "border-[#ffdf7a]/40 bg-[#ffdf7a]/10 text-[#ffe69e]";
  }
}

type SystemMetricProps = {
  label: string;
  value: string;
};

function SystemMetric({
  label,
  value,
}: SystemMetricProps) {
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
        className="
          mt-0.5 block truncate
          text-xs font-semibold tabular-nums
          text-ise-text
        "
        title={value}
      >
        {value}
      </strong>
    </div>
  );
}

type EconomyStatusTone =
  | "success"
  | "warning"
  | "neutral";

type EconomyStatusProps = {
  status: string;
  tone: EconomyStatusTone;
};

function EconomyStatus({
  status,
  tone,
}: EconomyStatusProps) {
  const toneClasses =
    tone === "success"
      ? `
        border-ise-success/30
        bg-ise-success/10
        text-ise-success
      `
      : tone === "warning"
        ? `
          border-ise-warning/30
          bg-ise-warning/10
          text-ise-warning
        `
        : `
          border-ise-border
          bg-ise-void/45
          text-ise-text-muted
        `;

  return (
    <div
      className={`
        flex items-center justify-between gap-3
        rounded-control border px-3 py-2.5
        text-xs
        ${toneClasses}
      `}
    >
      <span className="font-medium">
        Operational Status
      </span>

      <strong className="text-right font-semibold">
        {status}
      </strong>
    </div>
  );
}

type ExtractionStatusInput = {
  materialStorageIsFull: boolean;
  productionEfficiency: number;
  actualProduction: number;
  potentialProduction: number;
  materialSales: number;
};

function getExtractionStatus({
  materialStorageIsFull,
  productionEfficiency,
  actualProduction,
  potentialProduction,
  materialSales,
}: ExtractionStatusInput): string {
  if (
    materialStorageIsFull &&
    materialSales <= 0
  ) {
    return "Paused: Storage Full";
  }

  if (
    materialStorageIsFull &&
    actualProduction <
    potentialProduction - 0.01
  ) {
    return "Limited by Commerce";
  }

  if (productionEfficiency < 1) {
    return "Reduced by Energy Shortage";
  }

  return "Producing";
}

type CommerceStatusInput = {
  productionEfficiency: number;
  actualSales: number;
  salesThroughput: number;
};

function getCommerceStatus({
  productionEfficiency,
  actualSales,
  salesThroughput,
}: CommerceStatusInput): string {
  if (actualSales <= 0) {
    return "Waiting for Materials";
  }

  if (productionEfficiency < 1) {
    return "Reduced by Energy Shortage";
  }

  if (actualSales < salesThroughput - 0.01) {
    return "Limited by Supply";
  }

  return "Selling at Capacity";
}

type OutpostStateBadgeProps = {
  hasGradCommand: boolean;
  hasOutpost: boolean;
  isSurveyed: boolean;
};

function OutpostStateBadge({
  hasGradCommand,
  hasOutpost,
  isSurveyed,
}: OutpostStateBadgeProps) {
  const label = hasGradCommand
    ? "Operational"
    : hasOutpost
      ? "Claimed"
      : isSurveyed
        ? "Available"
        : "Locked";

  const classes = hasGradCommand || hasOutpost
    ? `
        border-ise-success/35
        bg-ise-success/10
        text-ise-success
      `
    : isSurveyed
      ? `
          border-ise-info/35
          bg-ise-info/10
          text-ise-info
        `
      : `
          border-ise-border
          bg-ise-void/60
          text-ise-text-subtle
        `;

  return (
    <span
      className={`
        shrink-0 rounded-full border
        px-2 py-0.5
        text-[0.6rem] font-semibold uppercase
        tracking-[0.08em]
        ${classes}
      `}
    >
      {label}
    </span>
  );
}

type AffinityGridProps = {
  affinities: AffinityProfile;
};

type AffinityLevel = AffinityProfile[keyof AffinityProfile];

function AffinityGrid({ affinities }: AffinityGridProps) {
  const affinityEntries = Object.entries(affinities) as Array<[keyof AffinityProfile, AffinityLevel]>;

  return (
    <div className="grid grid-cols-2 gap-2">
      {affinityEntries.map(([name, level]) => (
        <AffinityCard
          key={String(name)}
          name={formatAffinityName(String(name))}
          level={level}
        />
      ))}
    </div>
  )
}

type AffinityCardProps = {
  name: string;
  level: AffinityLevel;
};

function AffinityCard({
  name,
  level,
}: AffinityCardProps) {
  const levelClasses = getAffinityLevelClasses(level);

  return (
    <div
      className="
        min-w-0 rounded-control
        border border-ise-border
        bg-ise-background/60 p-2.5
        transition-colors
        hover:border-ise-border-strong
        hover:bg-ise-surface-hover/50
      "
    >
      <span
        className="
          block truncate
          text-xs font-medium text-ise-text-muted
        "
        title={name}
      >
        {name}
      </span>

      <span
        className={`
          mt-1 inline-flex rounded-full border
          px-2 py-0.5
          text-[0.65rem] font-semibold uppercase
          tracking-[0.08em]
          ${levelClasses}
        `}
      >
        {level}
      </span>
    </div>
  );
}

function getAffinityLevelClasses(level: AffinityLevel): string {
  switch (level) {
    case "high":
      return `
        border-ise-success/35
        bg-ise-success/10
        text-ise-success
      `;

    case "low":
      return `
        border-ise-danger/35
        bg-ise-danger/10
        text-ise-danger
      `;

    case "neutral":
    default:
      return `
        border-ise-border-strong
        bg-ise-surface-raised
        text-ise-text-muted
      `;
  }
}

function formatAffinityName(name: string): string {
  return name
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}