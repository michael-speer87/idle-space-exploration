import type { ReactNode } from "react";

type ProgressBarProps = {
  value: number;
  label?: ReactNode;
  colorClassName?: string;
  height?: "sm" | "md";
  ariaLabel?: string;
};

export function ProgressBar({
  value,
  label,
  colorClassName = "bg-ise-accent",
  height = "md",
  ariaLabel = "Progress",
}: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div className="grid gap-2">
      {label && (
        <div className="flex items-baseline justify-between gap-3 text-xs">
          {label}
        </div>
      )}

      <div
        className={`
          overflow-hidden rounded-full
          border border-ise-border bg-ise-void
          ${height === "sm" ? "h-2" : "h-3"}
        `}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percentage)}
      >
        <div
          className={`
            h-full rounded-full
            transition-[width] duration-300
            ${colorClassName}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}