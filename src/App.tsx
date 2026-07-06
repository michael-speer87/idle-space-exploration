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
import { canClaimWithOutpost } from "./game/systems/outpostSystem";

function App() {
  return (
    <GameProvider>
      <GameTicker />
      <GameScreen />
    </GameProvider>
  );
}

function GameScreen() {
  const gameState = useGameState();
  const dispatch = useGameDispatch();

  const selectedSystem = gameState.selectedSystemId
    ? gameState.map.systemsById[gameState.selectedSystemId]
    : null;

  const rates = calculateRates(gameState);

  const canClaimSurveyArrayForSelectedSystem = 
    selectedSystem !== null
      ? canClaimWithOutpost(gameState, selectedSystem.id, "survey_array")
      : false;

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

  const handleClaimSurveyArray = useCallback(() => {
    if (selectedSystem === null) {
      return;
    }

    dispatch({
      type: "claimWithOutpost",
      systemId: selectedSystem.id,
      outpostId: "survey_array",
    });
  }, [dispatch, selectedSystem]);

  return (
    <main className="game-layout">
      <SelectedSystemPanel
        system={selectedSystem}
        activeSurvey={activeSurveyForSelectedSystem}
        canBeginSurvey={canBeginSurveyForSelectedSystem}
        canClaimSurveyArray={canClaimSurveyArrayForSelectedSystem}
        firstFreeSurveyAvailable={gameState.exploration.firstFreeSurveyAvailable}
        onBeginSurvey={handleBeginSurvey}
        onClaimSurveyArray={handleClaimSurveyArray}
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