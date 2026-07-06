import { useEffect, useRef } from "react";
import { useGameState } from "./GameContext";
import { saveGame } from "./save/saveSystem";

const AUTOSAVE_INTERVAL_MS = 30_000;

export function GameAutosave() {
  const gameState = useGameState();
  const latestGameStateRef = useRef(gameState);

  useEffect(() => {
    latestGameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      saveGame(latestGameStateRef.current);
    }, AUTOSAVE_INTERVAL_MS);

    function handleBeforeUnload() {
      saveGame(latestGameStateRef.current);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
}