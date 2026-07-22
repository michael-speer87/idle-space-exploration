import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  ResearchProjectId,
} from "../../../game/config/research";

import {
  RESEARCH_DIRECTORATE_IDS,
  RESEARCH_WEB_CONNECTIONS,
  RESEARCH_WEB_LAYOUT,
  RESEARCH_WEB_PROJECT_IDS,
  type ResearchWebNodeLayout,
} from "../researchWebLayout";

describe("Research web layout", () => {
  const layout =
    RESEARCH_WEB_LAYOUT as Partial<
      Record<
        ResearchProjectId,
        ResearchWebNodeLayout
      >
    >;

  it(
    "defines the four Research directorates",
    () => {
      expect(
        RESEARCH_DIRECTORATE_IDS,
      ).toEqual([
        "exploration",
        "industrial",
        "systems",
        "command",
      ]);
    },
  );

  it(
    "gives each visible program a unique position",
    () => {
      const coordinates =
        RESEARCH_WEB_PROJECT_IDS.map(
          (projectId) => {
            const node =
              layout[projectId];

            expect(node).toBeDefined();

            return `${node!.x},${node!.y}`;
          },
        );

      expect(
        new Set(coordinates).size,
      ).toBe(coordinates.length);
    },
  );

  it(
    "connects only visible Research nodes",
    () => {
      for (
        const connection of
        RESEARCH_WEB_CONNECTIONS
      ) {
        expect(
          layout[connection.to],
        ).toBeDefined();

        if (
          connection.from !==
          "research_core"
        ) {
          expect(
            layout[connection.from],
          ).toBeDefined();
        }
      }
    },
  );
});