import { useCallback } from "react";
import { GameProvider, useGameDispatch, useGameState } from "./game/GameContext";
import { SelectedSystemPanel } from "./components/SelectedSystemPanel";
import { StarMapCanvas } from "./components/StarMapCanvas";
import { MapLegend } from "./components/MapLegend";
import type { StarSystemId } from "./game/types";
import { canBeginSurvey } from "./game/systems/explorationSystem";
import { GameTicker } from "./game/GameTicker";
import { ResourceBar } from "./components/ResourceBar";
import { calculateRates } from "./game/systems/rateSystem";
import { getOutpostClaimOptions } from "./game/systems/outpostSystem";
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
  const startableResearchProjectIds = getStartableResearchProjectIds(gameState);
  const runObjectiveProgress = getRunObjectiveProgress(gameState);
  const influenceResetPreview = getInfluenceResetPreview(gameState);

  const selectedSystem = gameState.selectedSystemId
    ? gameState.map.systemsById[gameState.selectedSystemId]
    : null;

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
    deleteSave();

    dispatch({
      type: "resetGame",
      seed: 12345,
    });
  }, [dispatch]);

  const handlePerformInfluenceReset = useCallback(() => {
    dispatch({
      type: "performInfluenceReset"
    });
  }, [dispatch]);

  return (
    <main className="game-layout">
      <SelectedSystemPanel
        system={selectedSystem}
        activeSurvey={activeSurveyForSelectedSystem}
        canBeginSurvey={canBeginSurveyForSelectedSystem}
        outpostClaimOptions={outpostClaimOptions}
        firstFreeSurveyAvailable={gameState.exploration.firstFreeSurveyAvailable}
        onBeginSurvey={handleBeginSurvey}
        onClaimOutpost={handleClaimOutpost}
      />

      <section className="map-section">
        <div className="map-header">
          <h1>Idle Space Exploration</h1>
          <p>
            Seed {gameState.seed} · {gameState.map.systemIds.length} systems
          </p>
        </div>

        <ResourceBar
          credits={gameState.resources.credits}
          science={gameState.resources.science}
          rates={rates}
        />

        <ResearchPanel
          research={gameState.research}
          startableProjectIds={startableResearchProjectIds}
          science={gameState.resources.science}
          onStartResearch={handleStartResearch}
        />

        <SaveControls
          gameState={gameState}
          onSave={handleSaveGame}
          onResetGame={handleResetGame}
        />

        <RunProgressPanel 
          progress={runObjectiveProgress} 
          resetPreview={influenceResetPreview}
          onPerformInfluenceReset={handlePerformInfluenceReset}  
        />

        <MapLegend />

        <StarMapCanvas
          map={gameState.map}
          selectedSystemId={gameState.selectedSystemId}
          onSelectSystem={handleSelectSystem}
        />
      </section>
    </main>
  );
}

export default App;