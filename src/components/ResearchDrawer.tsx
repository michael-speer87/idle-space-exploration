import type { ReactNode } from "react";

type ResearchDrawerProps = {
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function ResearchDrawer({
  isOpen,
  onToggle,
  children,
}: ResearchDrawerProps) {
  return (
    <>
      <button
        className="research-drawer-toggle"
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        {isOpen ? "Hide Research" : "Show Research"}
      </button>

      <aside
        className={
          isOpen
            ? "research-drawer research-drawer-open"
            : "research-drawer"
        }
        aria-hidden={!isOpen}
      >
        <div className="research-drawer-header">
          <h2>Research</h2>

          <button type="button" onClick={onToggle}>
            ×
          </button>
        </div>

        <div className="research-drawer-body">
          {isOpen ? children : null}
        </div>
      </aside>
    </>
  );
}