import type { ReactNode } from "react";

export function MapLegend() {
  return (
    <details>
      <summary
        className="
          cursor-pointer select-none
          rounded-control px-2 py-1.5
          text-xs font-semibold tracking-wide text-ise-text
          transition-colors
          hover:bg-ise-surface-hover/60
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-ise-accent
        "
      >
        Galaxy Legend
      </summary>

      <div
        className="
          mt-2 grid gap-3
          border-t border-ise-border
          px-2 pt-3 pb-1
        "
      >
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
            label="Claimed"
          />

          <LegendRow
            marker={
              <span className="h-3 w-3 rounded-full bg-[#f4f7ff]" />
            }
            label="Detected / surveyed"
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
            marker={<span className="h-2.5 w-2.5 bg-[#9cffb1]" />}
            label="GRaD Command"
          />
        </LegendGroup>

        <LegendGroup title="Outposts">
          <LegendRow
            marker={
              <OutpostMarker symbol="△" className="text-[#72e0ff]" />
            }
            label="Survey Array"
          />

          <LegendRow
            marker={
              <OutpostMarker symbol="●" className="text-[#ffd36e]" />
            }
            label="Commerce Hub"
          />

          <LegendRow
            marker={
              <OutpostMarker symbol="▲" className="text-[#b48cff]" />
            }
            label="Science Station"
          />

          <LegendRow
            marker={
              <OutpostMarker symbol="◆" className="text-[#9cffb1]" />
            }
            label="Power Relay"
          />

          <LegendRow
            marker={
              <OutpostMarker symbol="■" className="text-[#ff9f6e]" />
            }
            label="Extraction Rig"
          />
        </LegendGroup>
      </div>
    </details>
  );
}

type LegendGroupProps = {
  title: string;
  children: ReactNode;
};

function LegendGroup({ title, children }: LegendGroupProps) {
  return (
    <section>
      <h3
        className="
          m-0 mb-2
          text-[0.65rem] font-semibold uppercase
          tracking-[0.09em] text-ise-text-subtle
        "
      >
        {title}
      </h3>

      <div className="grid gap-1.5">{children}</div>
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
        flex items-center gap-2
        rounded-control px-1.5 py-1
        text-xs text-ise-text-muted
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

      <span>{label}</span>
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