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
import { ResearchDrawer } from "./components/ResearchDrawer";
import { DevAdminPanel } from "./components/DevAdminPanel";

const GAME_VERSION_LABEL = "v0.1";

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
  const [isResearchDrawerOpen, setIsResearchDrawerOpen] = useState(true);

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

  const handleToggleResearchDrawer = useCallback(() => {
    setIsResearchDrawerOpen((current) => !current);
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
        <div className="map-header">
          <div className="map-title-row">
            <h1>Idle Space Exploration</h1>
            <span className="version-badge" title="MVP Candidate v0.1">
              {GAME_VERSION_LABEL}
            </span>
          </div>

          <p>
            Seed {gameState.seed} · {gameState.map.systemIds.length} systems
          </p>
        </div>

        <ResourceBar
          credits={gameState.resources.credits}
          science={gameState.resources.science}
          rates={rates}
        />

        <ResearchDrawer
          isOpen={isResearchDrawerOpen}
          onToggle={handleToggleResearchDrawer}
        >
          <ResearchPanel
            research={gameState.research}
            startableProjectIds={startableResearchProjectIds}
            science={gameState.resources.science}
            researchSpeedPerSecond={rates.researchSpeedPerSecond}
            onStartResearch={handleStartResearch}
          />
        </ResearchDrawer>

        <SaveControls
          gameState={gameState}
          onSave={handleSaveGame}
          onResetGame={handleResetGame}
        />

        <MapLegend />

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

function formatOutputBonus(multiplier: number): string {
  const bonusPercent = Math.round((multiplier - 1) * 100);

  return `+${bonusPercent}% output`
}

export default App;