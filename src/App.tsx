import { useCallback } from "react";
import { GameProvider, useGameDispatch, useGameState } from "./game/GameContext";
import { SelectedSystemPanel } from "./components/SelectedSystemPanel";
import { StarMapCanvas } from "./components/StarMapCanvas";
import type { StarSystemId } from "./game/types";
import { MapLegend } from "./components/MapLegend";

function App() {
  return (
    <GameProvider>
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

  const handleSelectSystem = useCallback(
    (systemId: StarSystemId) => {
      dispatch({
        type: "selectSystem",
        systemId,
      });
    },
    [dispatch],
  );

  return (
    <main className="game-layout">
      <SelectedSystemPanel system={selectedSystem} />

      <section className="map-section">
        <div className="map-header">
          <h1>Idle Space Exploration</h1>
          <p>
            Seed {gameState.seed} · {gameState.map.systemIds.length} systems
          </p>
        </div>

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