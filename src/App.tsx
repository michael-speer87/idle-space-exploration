import { useCallback, useEffect, useRef, useState } from "react";
import { GameProvider, useGameDispatch, useGameState } from "./game/GameContext";
import { SelectedSystemPanel } from "./components/SelectedSystemPanel";
import { StarMapCanvas } from "./components/StarMapCanvas";
import { MapLegend } from "./components/MapLegend";
import type { StarSystemId } from "./game/types";
import { canBeginSurvey } from "./game/systems/explorationSystem";
import { GameTicker } from "./game/GameTicker";
import { ResourceBar } from "./components/ResourceBar";
import { calculateRates } from "./game/systems/rateSystem";
import {
  getOutpostClaimOptions,
  getPrimaryOutpostUpgradeOption,
} from "./game/systems/outpostSystem";
import type { PrimaryOutpostId } from "./game/config/outposts";
import { ResearchPanel } from "./components/ResearchPanel";
import type { ResearchProjectId } from "./game/config/research";
import { getStartableResearchProjectIds } from "./game/systems/researchSystem";
import { GameAutosave } from "./game/GameAutosave";
import { SaveControls } from "./components/SaveControls";
import { saveGame, deleteSave } from "./game/save/saveSystem";
import { RunProgressPanel } from "./components/RunProgressPanel";
import { getRunObjectiveProgress } from "./game/systems/progressionSystem";
import { getInfluenceResetPreview } from "./game/systems/influenceSystem";
import { RunStatsPanel } from "./components/RunStatsPanel";
import { getRunStatsSummary } from "./game/systems/runStatsSystem";
import { DevAdminPanel } from "./components/DevAdminPanel";
import { MissionWorkspace } from "./components/ui/MissionWorkspace";
import { Dock } from "./components/ui/Dock";

const GAME_VERSION_LABEL = "v0.1";

type MissionWorkspaceId = "research" | "build";

function App() {
  return (
    <GameProvider>
      <GameTicker />
      <GameAutosave />
      <GameScreen />
    </GameProvider>
  );
}

function GameScreen() {
  const gameState = useGameState();
  const dispatch = useGameDispatch();
  const shouldSaveAfterNextStateChangeRef = useRef(false);
  const startableResearchProjectIds = getStartableResearchProjectIds(gameState);
  const runObjectiveProgress = getRunObjectiveProgress(gameState);
  const influenceResetPreview = getInfluenceResetPreview(gameState);
  const runStatsSummary = getRunStatsSummary(gameState);

  const [activeWorkspace, setActiveWorkspace] =
    useState<MissionWorkspaceId | null>(null);

  const selectedSystem = gameState.selectedSystemId
    ? gameState.map.systemsById[gameState.selectedSystemId]
    : null;


  const primaryOutpostUpgradeOption =
    selectedSystem !== null
      ? getPrimaryOutpostUpgradeOption(gameState, selectedSystem.id)
      : {
        canUpgrade: false,
        creditCost: 0,
        currentLevel: 0,
        nextLevel: 0,
        blockedReason: "No system selected",
      };

  const rates = calculateRates(gameState);

  const outpostClaimOptions =
    selectedSystem !== null
      ? getOutpostClaimOptions(gameState, selectedSystem.id)
      : [];

  const activeSurveyForSelectedSystem =
    selectedSystem !== null &&
      gameState.exploration.activeSurvey?.systemId === selectedSystem.id
      ? gameState.exploration.activeSurvey
      : null;

  const canBeginSurveyForSelectedSystem =
    selectedSystem !== null
      ? canBeginSurvey(gameState, selectedSystem.id)
      : false;

  const handleSelectSystem = useCallback(
    (systemId: StarSystemId) => {
      dispatch({
        type: "selectSystem",
        systemId,
      });
    },
    [dispatch],
  );

  const handleBeginSurvey = useCallback(() => {
    if (selectedSystem === null) {
      return;
    }

    dispatch({
      type: "beginSurvey",
      systemId: selectedSystem.id,
    });
  }, [dispatch, selectedSystem]);

  const handleClaimOutpost = useCallback(
    (outpostId: PrimaryOutpostId) => {
      if (selectedSystem === null) {
        return;
      }

      dispatch({
        type: "claimWithOutpost",
        systemId: selectedSystem.id,
        outpostId,
      });
    },
    [dispatch, selectedSystem]
  )

  const handleStartResearch = useCallback(
    (projectId: ResearchProjectId) => {
      dispatch({
        type: "startResearch",
        projectId,
      });
    },
    [dispatch],
  );

  const handleSaveGame = useCallback(() => {
    saveGame(gameState);
  }, [gameState]);

  const handleResetGame = useCallback(() => {
    const confirmed = window.confirm(
      "Start a new game? This will erase the current run, resources, research, Influence, and saved progress.",
    )

    if (!confirmed) {
      return;
    }

    deleteSave();
    shouldSaveAfterNextStateChangeRef.current = true;

    dispatch({
      type: "resetGame",
      seed: 12345,
    })
  }, [dispatch]);

  const handlePerformInfluenceReset = useCallback(() => {
    const confirmed = window.confirm(
      [
        "Perform Influence Reset?",
        "",
        `You will gain +${influenceResetPreview.influenceGain} Lifetime Influence.`,
        `Current bonus: ${formatOutputBonus(influenceResetPreview.currentOutputMultiplier)}`,
        `Next bonus: ${formatOutputBonus(influenceResetPreview.nextOutputMultiplier)}`,
        "",
        "This will restart the current map, resources, claims, outposts, and exploration progress.",
      ].join("\n"),
    );

    if (!confirmed) {
      return;
    }

    shouldSaveAfterNextStateChangeRef.current = true;

    dispatch({
      type: "performInfluenceReset"
    });
  }, [dispatch, influenceResetPreview]);

  const handleUpgradePrimaryOutpost = useCallback(() => {
    if (selectedSystem === null) {
      return;
    }

    dispatch({
      type: "upgradePrimaryOutpost",
      systemId: selectedSystem.id,
    });
  }, [dispatch, selectedSystem]);

  const handleOpenWorkspace = useCallback(
    (workspaceId: MissionWorkspaceId) => {
      setActiveWorkspace((current) =>
        current === workspaceId ? null : workspaceId,
      );
    },
    [],
  )

  const handleCloseWorkspace = useCallback(() => {
    setActiveWorkspace(null);
  }, []);

  useEffect(() => {
    if (!shouldSaveAfterNextStateChangeRef.current) {
      return;
    }

    saveGame(gameState);
    shouldSaveAfterNextStateChangeRef.current = false;
  }, [gameState]);

  return (
    <main className="
      grid min-h-screen
      grid-cols-[340px_minmax(0,1fr)]
      bg-ise-background
      text-ise-text
      "
    >
      <aside className="
        grid h-screen content-start gap-3.5 overflow-y-auto
        border-r border-ise-border
        bg-ise-void/85 p-3.5
        "
      >
        <SelectedSystemPanel
          gameState={gameState}
          system={selectedSystem}
          activeSurvey={activeSurveyForSelectedSystem}
          canBeginSurvey={canBeginSurveyForSelectedSystem}
          outpostClaimOptions={outpostClaimOptions}
          primaryOutpostUpgradeOption={primaryOutpostUpgradeOption}
          firstFreeSurveyAvailable={gameState.exploration.firstFreeSurveyAvailable}
          onBeginSurvey={handleBeginSurvey}
          onClaimOutpost={handleClaimOutpost}
          onUpgradePrimaryOutpost={handleUpgradePrimaryOutpost}
        />

        <RunProgressPanel
          progress={runObjectiveProgress}
          resetPreview={influenceResetPreview}
          onPerformInfluenceReset={handlePerformInfluenceReset}
        />

        <RunStatsPanel stats={runStatsSummary} />
      </aside>

      <section className="relative min-h-screen min-w-0 overflow-hidden">

        <header className="
          absolute inset-x-4 top-4 z-10
          flex items-start justify-between gap-4
          rounded-panel border border-ise-border
          bg-ise-void/90 p-3 shadow-panel
          backdrop-blur-md
        "
        >
          <div className="min-w-0 shrink-0">
            <div className="flex items-center gap-2">
              <h1 className="m-0 text-base font-semibold tracking-wide text-ise-text">
                Idle Space Exploration
              </h1>

              <span className="
                rounded-full border border-ise-accent/35
                b-ise-accent-muted px-2 py-0.5
                text-[0.65rem] font-bold tracking-[0.08em]
                text-ise-accent-hover
              "
                title="MVP Candidate v0.1"
              >
                {GAME_VERSION_LABEL}
              </span>
            </div>

            <p className="mt-1 mb-0 text-xs text-ise-text-muted">
              Home Cluster · Seed {gameState.seed} .{" "}
              {gameState.map.systemIds.length} systems
            </p>
          </div>

          <ResourceBar
            credits={gameState.resources.credits}
            science={gameState.resources.science}
            rates={rates}
          />
        </header>

        <nav className={`
          absolute top-28 z-30
          grid gap-2
          trasition-[right] duration-200
          ${activeWorkspace === null ? "right-4" : "right-[396px]"}
        `}
        >
          <WorkspaceLauncher
            label="Research"
            isActive={activeWorkspace === "research"}
            onClick={() => handleOpenWorkspace("research")}
          />

          <WorkspaceLauncher
            label="Build"
            isActive={activeWorkspace === "build"}
            onClick={() => handleOpenWorkspace("build")}
          />
        </nav>

        {activeWorkspace === "research" && (
          <div className="absolute inset-y-0 right-0 z-20">
            <MissionWorkspace
              title="Research"
              subtitle="GRaD Scientific Directorate"
              onClose={handleCloseWorkspace}
            >
              <ResearchPanel
                research={gameState.research}
                startableProjectIds={startableResearchProjectIds}
                science={gameState.resources.science}
                researchSpeedPerSecond={rates.researchSpeedPerSecond}
                onStartResearch={handleStartResearch}
              />
            </MissionWorkspace>
          </div>
        )}

        {activeWorkspace === "build" && (
          <div className="absolute inset-y-0 right-0 z-20">
            <MissionWorkspace
              title="Build"
              subtitle={selectedSystem?.name ?? "No system selected"}
              onClose={handleCloseWorkspace}
            >
              <BuildWorkspacePlaceholder
                hasSelectedSystem={selectedSystem !== null}
                selectedSystemName={selectedSystem?.name ?? null}
              />
            </MissionWorkspace>
          </div>
        )}

        <SaveControls
          gameState={gameState}
          onSave={handleSaveGame}
          onResetGame={handleResetGame}
        />

        <div className="absolute bottom-4 left-4 z-30">
          <Dock
            ariaLabel="Map utilities"
            className="w-56"
          >
            <MapLegend />
          </Dock>
        </div>

        {import.meta.env.DEV && <DevAdminPanel />}

        <StarMapCanvas
          map={gameState.map}
          selectedSystemId={gameState.selectedSystemId}
          onSelectSystem={handleSelectSystem}
        />
      </section>
    </main>
  );
}

type WorkspaceLauncherProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function WorkspaceLauncher({
  label,
  isActive,
  onClick,
}: WorkspaceLauncherProps) {
  return (
    <button
      className={`
        min-w-24 rounded-control border
        px-3 py-2 text-left
        text-xs font-semibold tracking-wide
        shadow-control
        backdrop-blur-md
        transition-colors
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-ise-accent
        ${
          isActive
            ? `
                border-ise-accent/50
                bg-ise-accent-muted
                text-ise-accent-hover
              `
            : `
                border-ise-border
                bg-ise-void/90
                text-ise-text-muted
                hover:border-ise-border-strong
                hover:bg-ise-surface-hover
                hover:text-ise-text
              `
        }
      `}
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

type BuildWorkspacePlaceholderProps = {
  hasSelectedSystem: boolean;
  selectedSystemName: string | null;
};

function BuildWorkspacePlaceholder({
  hasSelectedSystem,
  selectedSystemName,
}: BuildWorkspacePlaceholderProps) {
  return (
    <div className="grid gap-4">
      <div
        className="
          rounded-panel border border-dashed border-ise-border
          bg-ise-surface p-5 text-center
        "
      >
        <h3 className="m-0 text-sm font-semibold text-ise-text">
          Build Workspace
        </h3>

        <p className="mt-2 mb-0 text-xs leading-relaxed text-ise-text-muted">
          {hasSelectedSystem
            ? `Construction controls for ${selectedSystemName} will move here in a future UI milestone.`
            : "Select a surveyed system to inspect its future construction options."}
        </p>
      </div>

      <p className="m-0 text-xs leading-relaxed text-ise-text-subtle">
        Outpost claim, upgrade, and replacement controls remain in Selected
        System until the Build workspace migration is complete.
      </p>
    </div>
  );
}

function formatOutputBonus(multiplier: number): string {
  const bonusPercent = Math.round((multiplier - 1) * 100);

  return `+${bonusPercent}% output`
}

export default App;