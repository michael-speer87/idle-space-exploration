import {
  useReducer,
  type ReactNode,
} from "react";
import type { GameState } from "./types";
import { createNewGame } from "./createNewGame";
import { gameReducer } from "./gameReducer";
import { loadGame } from "./save/saveSystem";
import {
  GameDispatchContext,
  GameStateContext,
} from "./gameHooks";

type GameProviderProps = {
  children: ReactNode;
};

export function GameProvider({ children }: GameProviderProps) {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialGameState,
  );

  return (
    <GameStateContext.Provider value={gameState}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}

function createInitialGameState(): GameState {
  const loadResult = loadGame();

  if (loadResult.status === "loaded") {
    return loadResult.gameState;
  }

  if (loadResult.status === "corrupted") {
    console.warn(
      `Corrupted save detected and preserved at localStorage key: ${loadResult.backupKey}`,
    );
  }

  return createNewGame(12345);
}