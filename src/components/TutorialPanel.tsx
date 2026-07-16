import type { TutorialStepDefinition } from "../game/config/tutorial";
import { Panel } from "./ui/Panel";

type TutorialPanelProps = {
  step: TutorialStepDefinition;
  currentStepNumber: number;
  totalStepCount: number;
  onSkip: () => void;
};

export function TutorialPanel({
  step,
  currentStepNumber,
  totalStepCount,
  onSkip,
}: TutorialPanelProps) {
  const progressPercent =
    (currentStepNumber / totalStepCount) * 100;

  return (
    <Panel
      title="GRaD Orientation"
      subtitle={`Objective ${currentStepNumber} of ${totalStepCount}`}
    >
      <div className="grid gap-3">
        <div
          className="
            h-1.5 overflow-hidden rounded-full
            bg-ise-background
          "
          aria-hidden="true"
        >
          <div
            className="
              h-full rounded-full bg-ise-accent
              transition-[width] duration-300
            "
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>

        <div
          className="
            rounded-control border border-ise-accent/30
            bg-ise-accent-muted p-3
          "
        >
          <strong
            className="
              block text-sm font-semibold
              text-ise-text
            "
          >
            {step.title}
          </strong>

          <p
            className="
              mt-1.5 mb-0 text-xs leading-relaxed
              text-ise-text
            "
          >
            {step.objective}
          </p>
        </div>

        <p
          className="
            m-0 text-xs leading-relaxed
            text-ise-text-muted
          "
        >
          {step.guidance}
        </p>

        <button
          className="
            justify-self-start rounded-control
            border border-ise-border
            bg-ise-background/60
            px-3 py-2
            text-xs font-semibold text-ise-text-muted
            transition-colors
            hover:border-ise-border-strong
            hover:text-ise-text
          "
          type="button"
          onClick={onSkip}
        >
          Skip Orientation
        </button>
      </div>
    </Panel>
  );
}