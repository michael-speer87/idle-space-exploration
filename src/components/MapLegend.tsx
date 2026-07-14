import {
  useId,
  useState,
  type ReactNode,
} from "react";
import {
  SYSTEM_RARITIES,
  type SystemRarity,
} from "../game/config/systemRarity";

export function MapLegend() {
  const [isOpen, setIsOpen] = useState(false);
  const legendContentId = useId();

  return (
    <div className="relative w-full">
      {isOpen && (
        <div
          id={legendContentId}
          className="
            absolute bottom-[calc(100%+0.5rem)] left-0 z-50
            w-120 max-w-[calc(100vw-2rem)]
            max-h-[calc(100vh-8rem)] overflow-y-auto
            rounded-panel border border-ise-border
            bg-ise-void/95 p-3
            shadow-panel backdrop-blur-md
          "
        >
          <div className="grid grid-cols-2 gap-3">
            <LegendGroup title="Systems">
              <LegendRow
                marker={
                  <span
                    className="
                      h-4 w-4 rounded-full
                      border-2 border-[#72e0ff]
                    "
                  />
                }
                label="Selected"
              />

              <LegendRow
                marker={
                  <span
                    className="
                      h-4 w-4 rounded-full
                      border-2 border-[#9cffb1]
                    "
                  />
                }
                label="Surveyed"
              />

              <LegendRow
                marker={
                  <span className="h-3 w-3 rounded-full bg-[#f4f7ff]" />
                }
                label="Detected"
              />

              <LegendRow
                marker={
                  <span
                    className="
                      h-3 w-3 rounded-full
                      border border-[#2d3a52]
                      bg-[#1a2233]
                    "
                  />
                }
                label="Unknown"
              />

              <LegendRow
                marker={
                  <span className="h-2.5 w-2.5 bg-[#9cffb1]" />
                }
                label="GRaD Command"
              />
            </LegendGroup>

            <LegendGroup title="Claimed Outposts">
              <LegendRow
                marker={
                  <OutpostMarker
                    symbol="△"
                    className="text-[#72e0ff]"
                  />
                }
                label="Survey Array"
              />

              <LegendRow
                marker={
                  <OutpostMarker
                    symbol="●"
                    className="text-[#ffd36e]"
                  />
                }
                label="Commerce Hub"
              />

              <LegendRow
                marker={
                  <OutpostMarker
                    symbol="▲"
                    className="text-[#b48cff]"
                  />
                }
                label="Science Station"
              />

              <LegendRow
                marker={
                  <OutpostMarker
                    symbol="◆"
                    className="text-[#9cffb1]"
                  />
                }
                label="Power Relay"
              />

              <LegendRow
                marker={
                  <OutpostMarker
                    symbol="■"
                    className="text-[#ff9f6e]"
                  />
                }
                label="Extraction Rig"
              />
            </LegendGroup>

            <LegendGroup 
              title="System Rarity"
              className="col-span-2"
              contentClassName="grid-cols-2 sm:grid-cols-3"
            >
              <p className="
                  col-span-full m-0 mb-1
                  text-[0.65rem] leading-relaxed
                  text-ise-text-subtle
                "
              >
                Star color reflects generated development potential.
              </p>

              {RARITY_ORDER.map((rarity) => (
                <LegendRow
                  key={rarity}
                  marker={
                    <span
                      className={`h-3 w-3 rounded-full ${RARITY_MARKER_CLASSES[rarity]}`}
                    />
                  }
                  label={SYSTEM_RARITIES[rarity].name}
                />
              ))}
            </LegendGroup>

            
          </div>
        </div>
      )}

      <button
        className="
          flex w-full items-center justify-between gap-3
          rounded-control px-2 py-1.5
          text-xs font-semibold tracking-wide
          text-ise-text
          transition-colors
          hover:bg-ise-surface-hover/60
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-ise-accent
        "
        type="button"
        aria-expanded={isOpen}
        aria-controls={legendContentId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>Galaxy Legend</span>

        <span
          className="text-ise-text-subtle"
          aria-hidden="true"
        >
          {isOpen ? "▾" : "▴"}
        </span>
      </button>
    </div>
  );
}


const RARITY_ORDER: readonly SystemRarity[] = [
  "common",
  "uncommon",
  "rare",
  "very_rare",
  "ultra_rare",
];

const RARITY_MARKER_CLASSES: Record<SystemRarity, string> = {
  common: "bg-[#ffdf7a]",
  uncommon: "bg-[#ffa24c]",
  rare: "bg-[#f4f7ff]",
  very_rare: "bg-[#7ab7ff]",
  ultra_rare: "bg-[#ff6b6b]",
};

type LegendGroupProps = {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

function LegendGroup({ title, children, className = "", contentClassName = "" }: LegendGroupProps) {
  return (
    <section className={className}>
      <h3
        className="
          m-0 mb-2
          text-[0.65rem] font-semibold uppercase
          tracking-[0.09em] text-ise-text-subtle
        "
      >
        {title}
      </h3>

      <div className={`grid gap-1.5 ${contentClassName}`}>{children}</div>
    </section>
  );
}

type LegendRowProps = {
  marker: ReactNode;
  label: string;
};

function LegendRow({ marker, label }: LegendRowProps) {
  return (
    <div
      className="
        flex min-w-0 items-center gap-1.5
        rounded-control px-1.5 py-0.5
        text-[0.7rem] text-ise-text-muted
        hover:bg-ise-surface-hover/50
      "
    >
      <span
        className="
          inline-flex w-5 shrink-0
          items-center justify-center
        "
        aria-hidden="true"
      >
        {marker}
      </span>

      <span className="min-w-0 leading-tight">{label}</span>
    </div>
  );
}

type OutpostMarkerProps = {
  symbol: string;
  className: string;
};

function OutpostMarker({
  symbol,
  className,
}: OutpostMarkerProps) {
  return (
    <span
      className={`
        inline-flex w-4 justify-center
        text-xs font-bold leading-none
        ${className}
      `}
    >
      {symbol}
    </span>
  );
}