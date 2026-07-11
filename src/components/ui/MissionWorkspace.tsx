import type { ReactNode } from "react";

type MissionWorkspaceProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
};

export function MissionWorkspace({
  title,
  subtitle,
  children,
  onClose,
  className = "",
}: MissionWorkspaceProps) {
  return (
    <aside
      className={`
        flex h-full min-h-0 w-[380px] flex-col
        border-l border-ise-border
        bg-ise-void/95
        shadow-panel
        ${className}
      `}
      aria-label={`${title} workspace`}
    >
      <header
        className="
          flex shrink-0 items-start justify-between gap-4
          border-b border-ise-border
          bg-ise-surface-raised
          px-4 py-3
        "
      >
        <div className="min-w-0">
          <h2
            className="
              m-0 truncate
              text-sm font-semibold tracking-wide
              text-ise-text
            "
          >
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 mb-0 text-xs text-ise-text-muted">
              {subtitle}
            </p>
          )}
        </div>

        <button
          className="
            inline-flex h-8 w-8 shrink-0 items-center justify-center
            rounded-control
            border border-ise-border
            bg-ise-background/60
            text-lg leading-none text-ise-text-muted
            transition-colors
            hover:border-ise-border-strong
            hover:bg-ise-surface-hover
            hover:text-ise-text
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-ise-accent
          "
          type="button"
          aria-label={`Close ${title} workspace`}
          title="Close workspace"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </aside>
  );
}