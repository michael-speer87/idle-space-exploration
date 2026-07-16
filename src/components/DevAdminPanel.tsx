import type { ReactNode } from "react";
import {
  PRIMARY_OUTPOSTS,
  type PrimaryOutpostId,
} from "../game/config/outposts";
import {
  useGameDispatch,
  useGameState,
} from "../game/gameHooks";
import { Section } from "./ui/Section";

const DEV_CLAIM_OUTPOST_IDS: readonly PrimaryOutpostId[] = [
  "survey_array",
  "commerce_hub",
];

export function DevAdminPanel() {
  const gameState = useGameState();
  const dispatch = useGameDispatch();

  const selectedSystem = gameState.selectedSystemId
    ? gameState.map.systemsById[gameState.selectedSystemId]
    : null;

  const selectedSystemLabel =
    selectedSystem === null
      ? "No system selected"
      : `${selectedSystem.name} (${selectedSystem.explorationState})`;

  const canUseSelectedSystem =
    selectedSystem !== null && !selectedSystem.isHome;

  function addResources(credits: number, science: number) {
    dispatch({
      type: "devAddResources",
      credits,
      science,
    });
  }

  function surveySelectedSystem() {
    if (selectedSystem === null) {
      return;
    }

    dispatch({
      type: "devSurveySystem",
      systemId: selectedSystem.id,
    });
  }

  function claimSelectedSystem(outpostId: PrimaryOutpostId) {
    if (selectedSystem === null) {
      return;
    }

    dispatch({
      type: "devClaimWithOutpost",
      systemId: selectedSystem.id,
      outpostId,
    });
  }

  return (
    <div
      className="grid gap-4"
      aria-label="Developer controls"
    >
      <div
        className="
          rounded-control
          border border-ise-warning/35
          bg-ise-warning/10 p-3
        "
      >
        <span
          className="
            text-[0.65rem] font-semibold uppercase
            tracking-[0.09em] text-ise-warning
          "
        >
          Development Build
        </span>

        <p
          className="
            mt-1 mb-0 text-xs
            leading-relaxed text-ise-text-muted
          "
        >
          These controls manipulate game state directly and are not
          available in production builds.
        </p>
      </div>

      <Section
        title="Selected System"
        divider={false}
      >
        <div
          className="
            rounded-control border border-ise-border
            bg-ise-background/60 p-3
          "
        >
          <span
            className="
              block text-[0.65rem] font-semibold uppercase
              tracking-[0.08em] text-ise-text-subtle
            "
          >
            Current Target
          </span>

          <strong
            className="
              mt-1 block text-sm font-semibold
              capitalize text-ise-text
            "
          >
            {selectedSystemLabel}
          </strong>
        </div>
      </Section>

      <Section title="Resources">
        <div className="grid grid-cols-2 gap-2">
          <DevActionButton
            onClick={() => addResources(100, 0)}
          >
            +100 Credits
          </DevActionButton>

          <DevActionButton
            onClick={() => addResources(1000, 0)}
          >
            +1,000 Credits
          </DevActionButton>

          <DevActionButton
            onClick={() => addResources(0, 100)}
          >
            +100 Science
          </DevActionButton>

          <DevActionButton
            onClick={() => addResources(0, 1000)}
          >
            +1,000 Science
          </DevActionButton>
        </div>
      </Section>

      <Section title="Map and System">
        <div className="grid gap-2">
          <DevActionButton
            disabled={!canUseSelectedSystem}
            onClick={surveySelectedSystem}
          >
            Survey Selected
          </DevActionButton>

          <DevActionButton
            onClick={() =>
              dispatch({ type: "devDetectAllSystems" })
            }
          >
            Detect All Systems
          </DevActionButton>

          {DEV_CLAIM_OUTPOST_IDS.map((outpostId) => (
            <DevActionButton
              key={outpostId}
              disabled={!canUseSelectedSystem}
              onClick={() => claimSelectedSystem(outpostId)}
            >
              Claim with {PRIMARY_OUTPOSTS[outpostId].name}
            </DevActionButton>
          ))}
        </div>

        {!canUseSelectedSystem && (
          <p
            className="
              mt-3 mb-0 rounded-control
              border border-ise-border
              bg-ise-void/50 p-3
              text-xs leading-relaxed text-ise-text-muted
            "
          >
            Select a non-home system to use survey and claim controls.
          </p>
        )}
      </Section>
    </div>
  );
}

type DevActionButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
};

function DevActionButton({
  children,
  disabled = false,
  onClick,
}: DevActionButtonProps) {
  return (
    <button
      className="
        rounded-control border
        border-ise-warning/30
        bg-ise-warning/10
        px-3 py-2.5
        text-xs font-semibold text-ise-warning
        transition-colors
        hover:bg-ise-warning/20
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-ise-warning
        disabled:cursor-not-allowed
        disabled:border-ise-border
        disabled:bg-ise-void/60
        disabled:text-ise-text-subtle
      "
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}