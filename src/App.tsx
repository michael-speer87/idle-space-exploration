import { useCallback, useEffect, useRef, useState } from "react";
import { GameProvider } from "./game/GameContext";
import { useGameDispatch, useGameState } from "./game/gameHooks";
import { SelectedSystemPanel } from "./components/SelectedSystemPanel";
import {
  StarMapCanvas,
  type StarMapCameraHandle,
} from "./components/StarMapCanvas";
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
import { BuildPanel } from "./components/BuildPanel";
import packageJson from "../package.json";
import type { SupportBuildingId } from "./game/config/supportBuildings";
import { getSupportBuildingBuildOptions } from "./game/systems/supportBuildingSystem";

const GAME_VERSION_LABEL = `v${packageJson.version}`;

type MissionWorkspaceId = "research" | "build" | "dev";

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
  const starMapCameraRef = useRef<StarMapCameraHandle | null>(null);

  const [activeWorkspace, setActiveWorkspace] =
    useState<MissionWorkspaceId | null>(null);

  const isWorkspaceOpen = activeWorkspace !== null;

  const sessionDockRight =
    activeWorkspace === "research"
      ? "calc(min(52rem, calc(100vw-2rem)) + 1rem)"
      : activeWorkspace === "build" ||
        activeWorkspace === "dev"
        ? "calc(min(24rem, calc(100vw-2rem)) + 1rem)"
        : "1rem";

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

  const materialStoragePercent =
    rates.materialCapacity > 0
      ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (gameState.resources.materials /
              rates.materialCapacity) *
            100,
          ),
        ),
      )
      : 0;

  const outpostClaimOptions =
    selectedSystem !== null
      ? getOutpostClaimOptions(gameState, selectedSystem.id)
      : [];

  const supportBuildingBuildOptions =
    selectedSystem !== null
      ? getSupportBuildingBuildOptions(gameState, selectedSystem.id)
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

  const handleBuildSupportBuilding = useCallback(
    (supportBuildingId: SupportBuildingId) => {
      if (selectedSystem === null) {
        return;
      }

      dispatch({
        type: "buildSupportBuilding",
        systemId: selectedSystem.id,
        supportBuildingId,
      });
    },
    [dispatch, selectedSystem]
  );

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

  const handleShowBuildWorkspace = useCallback(() => {
    setActiveWorkspace("build");
  }, []);

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
          firstFreeSurveyAvailable={
            gameState.exploration.firstFreeSurveyAvailable
          }
          onBeginSurvey={handleBeginSurvey}
          onOpenBuild={handleShowBuildWorkspace}
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
          max-[1100px]:flex-col
          max-[1100px]:gap-3
        "
        >
          <div className="min-w-0 shrink-0 max-[1100px]:w-full">
            <div className="flex items-center gap-2">
              <h1 className="m-0 text-base font-semibold tracking-wide text-ise-text">
                Idle Space Exploration
              </h1>

              <span className="
                rounded-full border border-ise-accent/35
                bg-ise-accent-muted px-2 py-0.5
                text-[0.65rem] font-bold tracking-[0.08em]
                text-ise-accent-hover
              "
                title={`Idle Space Exploration ${GAME_VERSION_LABEL}`}
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
          absolute top-35 right-4 z-30
          grid gap-2

          transition-all duration-200 ease-out

          ${isWorkspaceOpen
            ? `
                pointer-events-none
                translate-x-[calc(100%+2rem)]
                opacity-0
              `
            : `
                pointer-events-auto
                translate-x-0
                opacity-100
              `
          }
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
          <div className="absolute inset-y-0 right-0 z-40">
            <MissionWorkspace
              title="Research"
              subtitle="GRaD Scientific Directorate"
              onClose={handleCloseWorkspace}
              className={`w-[min(52rem,calc(100vw-2rem))]`}
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
          <div className="absolute inset-y-0 right-0 z-40">
            <MissionWorkspace
              title="Build"
              subtitle={selectedSystem?.name ?? "No system selected"}
              onClose={handleCloseWorkspace}
              className={`w-[min(24rem,calc(100vw-2rem))]`}
            >
              <BuildPanel
                system={selectedSystem}
                outpostClaimOptions={outpostClaimOptions}
                primaryOutpostUpgradeOption={primaryOutpostUpgradeOption}
                supportBuildingBuildOptions={supportBuildingBuildOptions}
                onClaimOutpost={handleClaimOutpost}
                onUpgradePrimaryOutpost={handleUpgradePrimaryOutpost}
                onBuildSupportBuilding={handleBuildSupportBuilding}
              />
            </MissionWorkspace>
          </div>
        )}

        {import.meta.env.DEV && activeWorkspace === "dev" && (
          <div className="absolute inset-y-0 right-0 z-40">
            <MissionWorkspace
              title="Developer Console"
              subtitle="Local Development tools only"
              onClose={handleCloseWorkspace}
              className="w-[min(24rem,calc(100vw-2rem))]"
            >
              <DevAdminPanel />
            </MissionWorkspace>
          </div>
        )}

        <div className={`
          absolute bottom-4 z-30
          transition-[right] duration-200
        `}
          style={{ right: sessionDockRight }}
        >
          <Dock
            ariaLabel="Session utilities"
            orientation="horizontal"
          >
            <SaveControls
              gameState={gameState}
              onSave={handleSaveGame}
              onResetGame={handleResetGame}
            />

            {import.meta.env.DEV && (
              <button
                className={`
                  rounded-control border px-3 py-2
                  text-xs font-semibold tracking-wide
                  transition-colors
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-ise-warning
                  ${activeWorkspace === "dev"
                    ? `
                        border-ise-warning/50
                        bg-ise-warning/20
                        text-ise-warning
                      `
                    : `
                        border-ise-warning/30
                        bg-ise-warning/10
                        text-ise-warning
                        hover:bg-ise-warning/20
                      `
                  }
    `}
                type="button"
                aria-pressed={activeWorkspace === "dev"}
                title="Open developer console"
                onClick={() => handleOpenWorkspace("dev")}
              >
                DEV
              </button>
            )}
          </Dock>
        </div>


        <div className="absolute bottom-4 left-4 z-30">
          <Dock
            ariaLabel="Map utilities"
            className="w-56"
          >
            <MapLegend />

            <div
              className="
      grid grid-cols-[2.5rem_1fr_2.5rem] gap-2
      border-t border-ise-border pt-2
    "
            >
              <MapControlButton
                label="Zoom out"
                onClick={() => starMapCameraRef.current?.zoomOut()}
              >
                −
              </MapControlButton>

              <MapControlButton
                label="Center map"
                onClick={() => starMapCameraRef.current?.center()}
              >
                Center
              </MapControlButton>

              <MapControlButton
                label="Zoom in"
                onClick={() => starMapCameraRef.current?.zoomIn()}
              >
                +
              </MapControlButton>
            </div>
          </Dock>
        </div>

        <StarMapCanvas
          ref={starMapCameraRef}
          map={gameState.map}
          selectedSystemId={gameState.selectedSystemId}
          materialStoragePercent={materialStoragePercent}
          onSelectSystem={handleSelectSystem}
        />
      </section>
    </main>
  );
}

type MapControlButtonProps = {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
};

function MapControlButton({
  label,
  children,
  onClick,
}: MapControlButtonProps) {
  return (
    <button
      className="
        inline-flex min-h-9 items-center justify-center
        rounded-control border border-ise-border
        bg-ise-background/65 px-2
        text-xs font-semibold text-ise-text-muted
        transition-colors
        hover:border-ise-border-strong
        hover:bg-ise-surface-hover
        hover:text-ise-text
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-ise-accent
      "
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
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
        ${isActive
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

function formatOutputBonus(multiplier: number): string {
  const bonusPercent = Math.round((multiplier - 1) * 100);

  return `+${bonusPercent}% output`
}

export default App;