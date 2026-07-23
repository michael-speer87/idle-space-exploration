import {
    describe,
    expect,
    it,
} from "vitest";

import {
    PRIMARY_OUTPOSTS,
} from "../../config/outposts";

import {
    RESEARCH_PROGRAMS,
} from "../../config/research";

import {
    createNewGame,
} from "../../createNewGame";

import {
    getOutpostClaimOptions,
} from "../outpostSystem";

function createSurveyedSystemState() {
    const state = createNewGame();

    const system =
        state.map.systemsById["1,0"];

    system.explorationState =
        "surveyed";
    system.claimState =
        "unclaimed";
    system.primaryOutpostId = null;
    system.primaryOutpostLevel = 0;

    state.resources.credits = 1_000;

    return state;
}

describe(
    "Research-owned Primary Outpost access",
    () => {
        it(
            "treats the current Outpost roster as starting access",
            () => {
                const state =
                    createSurveyedSystemState();

                const surveyOption =
                    getOutpostClaimOptions(
                        state,
                        "1,0",
                    ).find(
                        (option) =>
                            option.outpostId ===
                            "survey_array",
                    );

                expect(
                    surveyOption?.unlockRequirement,
                ).toBeNull();

                expect(
                    surveyOption?.canClaim,
                ).toBe(true);
            },
        );

        it(
            "derives a Primary Outpost unlock from a Research rank effect",
            () => {
                const outpost =
                    PRIMARY_OUTPOSTS.survey_array;

                const program =
                    RESEARCH_PROGRAMS
                        .improved_survey_arrays;

                const rank = program.ranks[0];

                const originalStartsUnlocked =
                    outpost.startsUnlocked;

                const originalEffects =
                    rank.effects;

                outpost.startsUnlocked = false;

                rank.effects = [
                    ...originalEffects,
                    {
                        type:
                            "unlock_primary_outpost",
                        outpostId:
                            "survey_array",
                    },
                ];

                try {
                    const state =
                        createSurveyedSystemState();

                    const lockedOption =
                        getOutpostClaimOptions(
                            state,
                            "1,0",
                        ).find(
                            (option) =>
                                option.outpostId ===
                                "survey_array",
                        );

                    expect(
                        lockedOption
                            ?.unlockRequirement,
                    ).toEqual({
                        programId:
                            "improved_survey_arrays",
                        requiredRank: 1,
                    });

                    expect(
                        lockedOption?.canClaim,
                    ).toBe(false);

                    expect(
                        lockedOption
                            ?.blockedReason,
                    ).toBe(
                        "Complete Integrated Survey Network Rank 1 first.",
                    );

                    state.research.projectsById
                        .improved_survey_arrays
                        .completedRank = 1;

                    const unlockedOption =
                        getOutpostClaimOptions(
                            state,
                            "1,0",
                        ).find(
                            (option) =>
                                option.outpostId ===
                                "survey_array",
                        );

                    expect(
                        unlockedOption?.canClaim,
                    ).toBe(true);

                    expect(
                        unlockedOption
                            ?.blockedReason,
                    ).toBeNull();
                } finally {
                    outpost.startsUnlocked =
                        originalStartsUnlocked;

                    rank.effects =
                        originalEffects;
                }
            },
        );
    },
);