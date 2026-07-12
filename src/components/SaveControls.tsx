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
  const [lastManualSaveTime, setLastManualSaveTime] =
    useState<string | null>(null);

  function handleSaveClick() {
    onSave();

    setLastManualSaveTime(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className="
          rounded-control border border-ise-accent/40
          bg-ise-accent-muted px-3 py-2
          text-xs font-semibold text-ise-accent-hover
          transition-colors
          hover:bg-ise-accent/25
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-ise-accent
        "
        type="button"
        onClick={handleSaveClick}
      >
        Save
      </button>

      <span
        className="
          min-w-20 text-right
          text-[0.65rem] leading-tight
          text-ise-text-subtle
        "
        aria-live="polite"
      >
        {lastManualSaveTime === null
          ? "Autosave: 30s"
          : `Saved ${lastManualSaveTime}`}
      </span>

      <details className="relative">
        <summary
          className="
            cursor-pointer list-none select-none
            rounded-control border border-ise-border
            bg-ise-background/60 px-3 py-2
            text-xs font-semibold text-ise-text-muted
            transition-colors
            hover:border-ise-border-strong
            hover:bg-ise-surface-hover
            hover:text-ise-text
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-ise-accent
            [&::-webkit-details-marker]:hidden
          "
        >
          Session
        </summary>

        <div
          className="
            absolute right-0 bottom-[calc(100%+0.75rem)] z-50
            w-64 rounded-panel
            border border-ise-border
            bg-ise-void/95 p-3
            shadow-panel backdrop-blur-md
          "
        >
          <div
            className="
              mb-3 flex items-start justify-between gap-3
              border-b border-ise-border pb-3
            "
          >
            <div>
              <h2 className="m-0 text-sm font-semibold text-ise-text">
                Session Controls
              </h2>

              <p className="mt-1 mb-0 text-xs text-ise-text-muted">
                Save management and run reset
              </p>
            </div>

            <span
              className="
                shrink-0 rounded-full
                border border-ise-border
                bg-ise-background/70 px-2 py-0.5
                text-[0.65rem] font-semibold
                text-ise-text-subtle
              "
            >
              Save v{gameState.version}
            </span>
          </div>

          <div
            className="
              mb-3 grid gap-1.5
              rounded-control border border-ise-border
              bg-ise-background/60 p-2
            "
          >
            <SessionStatusRow
              label="Autosave"
              value="Every 30 seconds"
            />

            <SessionStatusRow
              label="Manual Save"
              value={
                lastManualSaveTime === null
                  ? "Not saved this session"
                  : lastManualSaveTime
              }
            />
          </div>

          <button
            className="
              w-full rounded-control
              border border-ise-danger/40
              bg-ise-danger/10 px-3 py-2.5
              text-xs font-semibold text-ise-danger
              transition-colors
              hover:bg-ise-danger/20
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-ise-danger
            "
            type="button"
            onClick={onResetGame}
          >
            Start New Game
          </button>

          <p
            className="
              mt-2 mb-0 text-[0.65rem]
              leading-relaxed text-ise-text-subtle
            "
          >
            Starting a new game erases all current progression after
            confirmation.
          </p>
        </div>
      </details>
    </div>
  );
}

type SessionStatusRowProps = {
  label: string;
  value: string;
};

function SessionStatusRow({
  label,
  value,
}: SessionStatusRowProps) {
  return (
    <div
      className="
        flex items-baseline justify-between gap-3
        rounded-control px-2 py-1
        text-xs
        hover:bg-ise-surface-hover/50
      "
    >
      <span className="text-ise-text-muted">{label}</span>

      <strong
        className="
          truncate text-right font-semibold
          tabular-nums text-ise-text
        "
        title={value}
      >
        {value}
      </strong>
    </div>
  );
}