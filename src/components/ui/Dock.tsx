import type { ReactNode } from "react";

type DockProps = {
  ariaLabel: string;
  children: ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export function Dock({
  ariaLabel,
  children,
  orientation = "vertical",
  className = "",
}: DockProps) {
  return (
    <div
      className={`
        flex gap-2 rounded-panel
        border border-ise-border
        bg-ise-void/90 p-2
        shadow-control backdrop-blur-md
        ${
          orientation === "horizontal"
            ? "flex-row items-center"
            : "flex-col"
        }
        ${className}
      `}
      role="group"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}