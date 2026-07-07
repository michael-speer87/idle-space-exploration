import { useState } from "react";
import type { GameState } from "../game/types";

type SaveControlsProps = {
  gameState: GameState;
  onSave: () => void;
  onResetGame: () => void;
};

export function SaveControls({
  gameState,
  onSave,
  onResetGame,
}: SaveControlsProps) {
  const [lastManualSaveTime, setLastManualSaveTime] = useState<string | null>(
    null,
  );

  function handleSaveClick() {
    onSave();
    setLastManualSaveTime(new Date().toLocaleTimeString());
  }

  return (
    <div className="save-controls">
      <h2>Save</h2>

      <p>
        Version <strong>{gameState.version}</strong>
      </p>

      <button
        className="secondary-action-button"
        type="button"
        onClick={handleSaveClick}
      >
        Save Game
      </button>

      <button
        className="danger-action-button"
        type="button"
        onClick={onResetGame}
      >
        Start New Game
      </button>

      {lastManualSaveTime !== null && (
        <p className="panel-note">Saved at {lastManualSaveTime}</p>
      )}

      <p className="panel-note">Autosaves every 30 seconds.</p>
    </div>
  );
}