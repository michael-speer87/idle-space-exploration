import {
    describe,
    expect,
    it,
} from "vitest";

import {
    RESEARCH_PROGRAMS,
} from "../../config/research";

import { createNewGame } from "../../createNewGame";

import {
    applyResearchProgress,
    canStartResearch,
    getNextResearchRankDefinition,
    startResearch,
} from "../researchSystem";

describe("Ranked Research lifecycle", () => {
    it(
        "starts an available Research program",
        () => {
            const state = createNewGame();

            expect(
                canStartResearch(
                    state,
                    "improved_survey_arrays",
                ),
            ).toBe(true);

            const nextState = startResearch(
                state,
                "improved_survey_arrays",
            );

            expect(
                nextState.research.activeProjectId,
            ).toBe(
                "improved_survey_arrays",
            );
        },
    );

    it(
        "requires the configured prerequisite rank",
        () => {
            const state = createNewGame();

            expect(
                canStartResearch(
                    state,
                    "auxiliary_survey_instrumentation",
                ),
            ).toBe(false);

            state.research.projectsById
                .improved_survey_arrays
                .completedRank = 1;

            state.research.projectsById
                .improved_survey_arrays
                .isCompleted = false;

            expect(
                canStartResearch(
                    state,
                    "auxiliary_survey_instrumentation",
                ),
            ).toBe(true);
        },
    );

    it(
        "preserves progress when switching programs",
        () => {
            const state = createNewGame();

            state.research.projectsById
                .improved_survey_arrays
                .progress = 400;

            const firstState = startResearch(
                state,
                "improved_survey_arrays",
            );

            const nextState = startResearch(
                firstState,
                "commerce_optimization",
            );

            expect(
                nextState.research.activeProjectId,
            ).toBe("commerce_optimization");

            expect(
                nextState.research.projectsById
                    .improved_survey_arrays
                    .progress,
            ).toBe(400);
        },
    );

    it(
        "applies partial progress to the next rank",
        () => {
            const state = startResearch(
                createNewGame(),
                "improved_survey_arrays",
            );

            const nextState =
                applyResearchProgress(
                    state,
                    500,
                );

            expect(
                nextState.research.projectsById
                    .improved_survey_arrays
                    .completedRank,
            ).toBe(0);

            expect(
                nextState.research.projectsById
                    .improved_survey_arrays
                    .progress,
            ).toBe(500);

            expect(
                nextState.research.activeProjectId,
            ).toBe(
                "improved_survey_arrays",
            );
        },
    );

    it(
        "completes one rank and resets progress",
        () => {
            const initialState =
                createNewGame();

            const rank =
                getNextResearchRankDefinition(
                    initialState,
                    "improved_survey_arrays",
                );

            expect(rank).not.toBeNull();

            const activeState = startResearch(
                initialState,
                "improved_survey_arrays",
            );

            const nextState =
                applyResearchProgress(
                    activeState,
                    rank!.scienceCost,
                );

            const projectState =
                nextState.research.projectsById
                    .improved_survey_arrays;

            expect(
                projectState.completedRank,
            ).toBe(1);

            expect(projectState.progress).toBe(0);
            expect(projectState.isCompleted).toBe(
                true,
            );

            expect(
                nextState.research.activeProjectId,
            ).toBeNull();

            expect(
                canStartResearch(
                    nextState,
                    "improved_survey_arrays",
                ),
            ).toBe(false);
        },
    );

    it(
        "remains available until its final rank",
        () => {
            const program =
                RESEARCH_PROGRAMS
                    .improved_survey_arrays;

            const originalRanks =
                program.ranks;

            program.ranks = [
                originalRanks[0],
                {
                    rank: 2,
                    scienceCost: 2_000,
                    description:
                        "Temporary lifecycle test rank.",
                    effects: [],
                },
            ];

            try {
                let state = createNewGame();

                state = startResearch(
                    state,
                    "improved_survey_arrays",
                );

                state = applyResearchProgress(
                    state,
                    originalRanks[0].scienceCost,
                );

                expect(
                    state.research.projectsById
                        .improved_survey_arrays
                        .completedRank,
                ).toBe(1);

                expect(
                    state.research.projectsById
                        .improved_survey_arrays
                        .isCompleted,
                ).toBe(false);

                expect(
                    canStartResearch(
                        state,
                        "improved_survey_arrays",
                    ),
                ).toBe(true);

                state = startResearch(
                    state,
                    "improved_survey_arrays",
                );

                state = applyResearchProgress(
                    state,
                    2_000,
                );

                expect(
                    state.research.projectsById
                        .improved_survey_arrays
                        .completedRank,
                ).toBe(2);

                expect(
                    state.research.projectsById
                        .improved_survey_arrays
                        .isCompleted,
                ).toBe(true);

                expect(
                    canStartResearch(
                        state,
                        "improved_survey_arrays",
                    ),
                ).toBe(false);
            } finally {
                program.ranks = originalRanks;
            }
        },
    );
});