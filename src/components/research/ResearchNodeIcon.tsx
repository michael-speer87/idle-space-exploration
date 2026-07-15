import type { ReactNode } from "react";
import type {
    ResearchDiscipline,
    ResearchNodeKind,
} from "./researchWebLayout"

type ResearchNodeIconProps = {
    discipline: ResearchDiscipline;
    kind: ResearchNodeKind;
}

export function ResearchNodeIcon({
  discipline,
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
        {getDisciplineGlyph(discipline)}
      </svg>

      <span
        className="
          absolute -right-1 -bottom-1
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

function getDisciplineGlyph(
  discipline: ResearchDiscipline,
): ReactNode {
  switch (discipline) {
    case "survey":
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2" />
          <path d="M12 12L18 7" />
          <path d="M12 4A8 8 0 0 1 20 12" />
        </>
      );

    case "commerce":
      return (
        <>
          <path d="M4 8H18" />
          <path d="M15 5L18 8L15 11" />
          <path d="M20 16H6" />
          <path d="M9 13L6 16L9 19" />
        </>
      );

    case "science":
      return (
        <>
          <ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="3.5"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="3.5"
            ry="9"
            transform="rotate(45 12 12)"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="3.5"
            ry="9"
            transform="rotate(-45 12 12)"
          />
          <circle
            cx="12"
            cy="12"
            r="1.5"
            fill="currentColor"
            stroke="none"
          />
        </>
      );

    case "power":
      return (
        <>
          <path d="M13 2L5 13H11L10 22L19 10H13L13 2Z" />
        </>
      );

    case "extraction":
      return (
        <>
          <path d="M5 19L15 9" />
          <path d="M12 5L19 12" />
          <path d="M9 8C12 5 15 4 19 5" />
          <path d="M4 20L7 17" />
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