import type { CalculatedRates } from "../game/systems/rateSystem";

type ResourceBarProps = {
  credits: number;
  science: number;
  rates: CalculatedRates;
};

export function ResourceBar({
  credits,
  science,
  rates,
}: ResourceBarProps) {
  return (
    <div
      className="
        grid min-w-0 flex-1
        grid-cols-5 gap-2
      "
    >
      <ResourceCard
        label="Credits"
        value={credits.toFixed(0)}
        detail={`+${rates.creditsPerSecond.toFixed(2)}/sec`}
        accentClass="text-ise-credits"
      />

      <ResourceCard
        label="Science"
        value={science.toFixed(0)}
        detail={`+${rates.sciencePerSecond.toFixed(2)}/sec`}
        accentClass="text-ise-science"
      />

      <ResourceCard
        label="Exploration"
        value={rates.epPerSecond.toFixed(2)}
        detail="EP/sec"
        accentClass="text-ise-exploration"
      />

      <ResourceCard
        label="Energy"
        value={`${rates.energySurplus >= 0 ? "+" : ""}${rates.energySurplus.toFixed(1)}`}
        detail={`${rates.energyUsed.toFixed(1)} / ${rates.energyProduced.toFixed(1)} used`}
        accentClass={
          rates.energySurplus >= 0
            ? "text-ise-energy"
            : "text-ise-danger"
        }
      />

      <ResourceCard
        label="Efficiency"
        value={`${Math.round(rates.productionEfficiency * 100)}%`}
        detail="Production output"
        accentClass={
          rates.productionEfficiency >= 1
            ? "text-ise-success"
            : "text-ise-warning"
        }
      />
    </div>
  );
}

type ResourceCardProps = {
  label: string;
  value: string;
  detail: string;
  accentClass: string;
};

function ResourceCard({
  label,
  value,
  detail,
  accentClass,
}: ResourceCardProps) {
  return (
    <div
      className="
        min-w-0 rounded-control
        border border-ise-border
        bg-ise-surface px-3 py-2
        shadow-control
      "
    >
      <span
        className="
          block truncate text-[0.65rem]
          font-semibold uppercase tracking-[0.09em]
          text-ise-text-muted
        "
      >
        {label}
      </span>

      <strong
        className={`
          mt-0.5 block truncate
          text-base font-semibold tabular-nums
          ${accentClass}
        `}
      >
        {value}
      </strong>

      <span className="mt-0.5 block truncate text-[0.68rem] text-ise-text-subtle">
        {detail}
      </span>
    </div>
  );
}