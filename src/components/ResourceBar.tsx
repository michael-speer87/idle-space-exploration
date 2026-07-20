import type { CalculatedRates } from "../game/systems/rateSystem";
import {
  formatRate,
  formatResource,
  formatNumber
} from "../game/utils/formatNumber";

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
        max-[1100px]:w-full
      "
    >
      <ResourceCard
        label="Credits"
        value={formatResource(credits)}
        detail={`+${formatRate(rates.creditsPerSecond)}/sec`}
        accentClass="text-ise-credits"
      />

      <ResourceCard
        label="Science"
        value={formatResource(science)}
        detail={`${formatRate(rates.sciencePerSecond)}/sec generated`}
        accentClass="text-ise-science"
      />

      <ResourceCard
        label="Exploration"
        value={formatRate(rates.epPerSecond)}
        detail="EP/sec"
        accentClass="text-ise-exploration"
      />

      <ResourceCard
        label="Energy"
        value={`${rates.energySurplus >= 0 ? "+" : ""}${formatNumber(
          rates.energySurplus,
          {
            maximumFractionDigits: 1,
          },
        )}`}
        detail={`${formatNumber(rates.energyUsed, {
          maximumFractionDigits: 1,
        })} / ${formatNumber(rates.energyProduced, {
          maximumFractionDigits: 1,
        })} used`}
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