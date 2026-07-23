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
  type ResearchProjectId,
} from "../research";

describe(
  "Research program compatibility catalog",
  () => {
    const RANKED_PROGRAM_IDS =
      new Set<ResearchProjectId>([
        "improved_survey_arrays",
      ]);

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
          if (RANKED_PROGRAM_IDS.has(projectId)) {
            continue;
          }

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
      "defines Integrated Survey Network as three incremental ranks",
      () => {
        const program =
          RESEARCH_PROGRAMS
            .improved_survey_arrays;

        expect(program.name).toBe(
          "Integrated Survey Network",
        );

        expect(program.prerequisites).toEqual(
          [],
        );

        expect(
          program.ranks.map(
            ({
              rank,
              scienceCost,
            }) => ({
              rank,
              scienceCost,
            }),
          ),
        ).toEqual([
          {
            rank: 1,
            scienceCost: 1_500,
          },
          {
            rank: 2,
            scienceCost: 4_500,
          },
          {
            rank: 3,
            scienceCost: 12_000,
          },
        ]);

        expect(
          program.ranks.map(
            (rank) => rank.effects,
          ),
        ).toEqual([
          [
            {
              type:
                "primary_outpost_output_bonus",
              outpostId: "survey_array",
              amount: 0.05,
            },
          ],
          [
            {
              type:
                "primary_outpost_output_bonus",
              outpostId: "survey_array",
              amount: 0.05,
            },
          ],
          [
            {
              type:
                "primary_outpost_output_bonus",
              outpostId: "survey_array",
              amount: 0.05,
            },
          ],
        ]);
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