import type {
  ReactNode,
} from "react";

import type {
  ResearchDirectorate,
  ResearchNodeKind,
} from "./researchWebLayout";

type ResearchNodeIconProps = {
  directorate: ResearchDirectorate;
  kind: ResearchNodeKind;
};

export function ResearchNodeIcon({
  directorate,
  kind,
}: ResearchNodeIconProps) {
  return (
    <span
      className="
        relative flex h-full w-full
        items-center justify-center
      "
      aria-hidden="true"
    >
      <svg
        className="h-1/2 w-1/2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {getDirectorateGlyph(
          directorate,
        )}
      </svg>

      <span
        className="
          absolute -bottom-1 -right-1
          flex h-4 w-4
          items-center justify-center
          rounded-full border
          border-current
          bg-ise-void
          text-[0.5rem] font-bold
          leading-none
        "
      >
        {getNodeKindGlyph(kind)}
      </span>
    </span>
  );
}

function getDirectorateGlyph(
  directorate: ResearchDirectorate,
): ReactNode {
  switch (directorate) {
    case "exploration":
      return (
        <>
          <circle
            cx="12"
            cy="12"
            r="8"
          />

          <circle
            cx="12"
            cy="12"
            r="2"
          />

          <path d="M12 12L18 7" />

          <path
            d="
              M12 4
              A8 8 0 0 1
              20 12
            "
          />
        </>
      );

    case "industrial":
      return (
        <>
          <path
            d="
              M4 20V9
              L10 12V8
              L16 11V4
              H20V20
              H4Z
            "
          />

          <path d="M8 20V16H12V20" />
          <path d="M16 8H20" />
        </>
      );

    case "systems":
      return (
        <>
          <circle
            cx="12"
            cy="12"
            r="2.5"
            fill="currentColor"
            stroke="none"
          />

          <circle
            cx="5"
            cy="6"
            r="2"
          />

          <circle
            cx="19"
            cy="6"
            r="2"
          />

          <circle
            cx="12"
            cy="20"
            r="2"
          />

          <path d="M6.5 7.5L10 10.5" />
          <path d="M17.5 7.5L14 10.5" />
          <path d="M12 14.5V18" />
        </>
      );

    case "command":
      return (
        <>
          <path
            d="
              M12 3
              L19 6V11
              C19 15.5
              16.2 19
              12 21
              C7.8 19
              5 15.5
              5 11V6
              L12 3Z
            "
          />

          <path d="M9 12L11 14L15 10" />
        </>
      );
  }
}

function getNodeKindGlyph(
  kind: ResearchNodeKind,
): string {
  switch (kind) {
    case "foundation":
      return "◆";

    case "infrastructure":
      return "▦";

    case "performance":
      return "↗";
  }
}