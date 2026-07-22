import {
  describe,
  expect,
  it,
} from "vitest";

import {
  RESEARCH_PROGRAM_IDS,
  RESEARCH_PROGRAMS,
  RESEARCH_PROJECT_IDS,
  RESEARCH_PROJECTS,
} from "../research";

describe(
  "Research program compatibility catalog",
  () => {
    it(
      "represents every current project as a program",
      () => {
        expect(
          RESEARCH_PROGRAM_IDS,
        ).toEqual(
          RESEARCH_PROJECT_IDS,
        );
      },
    );

    it(
      "represents each current project as one rank",
      () => {
        for (
          const projectId of
          RESEARCH_PROJECT_IDS
        ) {
          const project =
            RESEARCH_PROJECTS[projectId];

          const program =
            RESEARCH_PROGRAMS[projectId];

          expect(program.id).toBe(
            project.id,
          );

          expect(program.name).toBe(
            project.name,
          );

          expect(program.ranks).toEqual([
            {
              rank: 1,
              scienceCost:
                project.scienceCost,
              description:
                project.description,
              effects:
                project.effects,
            },
          ]);
        }
      },
    );

    it(
      "requires rank one of each current prerequisite",
      () => {
        for (
          const projectId of
          RESEARCH_PROJECT_IDS
        ) {
          const project =
            RESEARCH_PROJECTS[projectId];

          const program =
            RESEARCH_PROGRAMS[projectId];

          expect(
            program.prerequisites,
          ).toEqual(
            project.prerequisiteIds.map(
              (programId) => ({
                programId,
                requiredRank: 1,
              }),
            ),
          );
        }
      },
    );
  },
);