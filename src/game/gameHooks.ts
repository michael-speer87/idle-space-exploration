import {
    createContext,
    useContext,
    type Dispatch,
} from "react";
import type { GameState } from "./types";
import type { GameAction } from "./gameReducer";

export const GameStateContext = createContext<GameState | null>(null);

export const GameDispatchContext =
  createContext<Dispatch<GameAction> | null>(null);

export function useGameState(): GameState {
  const gameState = useContext(GameStateContext);

  if (gameState === null) {
    throw new Error("useGameState must be used inside GameProvider.");
  }

  return gameState;
}

export function useGameDispatch(): Dispatch<GameAction> {
  const dispatch = useContext(GameDispatchContext);

  if (dispatch === null) {
    throw new Error("useGameDispatch must be used inside GameProvider.");
  }

  return dispatch;
}