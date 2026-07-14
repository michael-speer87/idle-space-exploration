import {
    PRIMARY_OUTPOSTS,
    type PrimaryOutpostId,
} from "../config/outposts";
import {
    getSystemRarityFromStarVisual,
    type SystemRarity,
} from "../config/systemRarity";
import type {
    AffinityProfile,
    StarSystem,
} from "../types";

type AffinityKey = keyof AffinityProfile;

export type SystemSurveyReport = {
    overview: string;
    infrastructure: string;
    recommendationTitle: string;
    recommendationDetail: string;
};

const OUTPOST_BY_AFFINITY: Record<AffinityKey, PrimaryOutpostId> = {
    survey: "survey_array",
    science: "science_station",
    commerce: "commerce_hub",
    power: "power_relay",
    extraction: "extraction_rig",
};

const AFFINITY_NAMES: Record<AffinityKey, string> = {
    survey: "survey",
    science: "science",
    commerce: "commerce",
    power: "power",
    extraction: "extraction",
};

export function getSystemSurveyReport(
    system: StarSystem,
): SystemSurveyReport {
    if (system.hasGradCommand) {
        return {
            overview:
                "Solace Prime serves as the administrative and operational anchor of the Home Cluster.",
            infrastructure:
                "GRaD Command occupies the system’s primary development footprint and coordinates regional exploration activity.",
            recommendationTitle: "GRaD Command",
            recommendationDetail:
                "Continue developing the Home System as the central command node for expansion into neighboring systems.",
        };
    }

    const rarity = getSystemRarityFromStarVisual(system.starVisual);

    const affinityEntries = Object.entries(
        system.affinities
        ) as Array<
            [
                AffinityKey, 
                AffinityProfile[AffinityKey],
            ]
        >;

    const highAffinity =
        affinityEntries.find(
            ([, level]) => level === "high",
        )?.[0] ?? null;

    const lowAffinityCount = affinityEntries.filter(
        ([, level]) => level === "low",
    ).length;

    const recommendation = createRecommendation(
        highAffinity,
        lowAffinityCount,
        system.supportSlotCount,
    );

    return {
        overview: createProfileOverview(
            system.name,
            rarity,
        ),

        infrastructure: createInfrastructureAssessment(system.supportSlotCount),

        recommendationTitle: recommendation.title,
        recommendationDetail: recommendation.detail,
    }
}

function createProfileOverview(
  systemName: string,
  rarity: SystemRarity,
): string {
  switch (rarity) {
    case "ultra_rare":
      return `${systemName} exhibits an exceptional development profile at the upper limit of recorded Home Cluster survey results.`;

    case "very_rare":
      return `${systemName} presents a high-value development profile with several unusually favorable characteristics.`;

    case "rare":
      return `${systemName} presents a strong development profile with above-average strategic potential.`;

    case "uncommon":
      return `${systemName} exceeds standard development expectations and may support a valuable regional role.`;

    case "common":
    default:
      return `${systemName} presents a routine development profile consistent with typical Home Cluster systems.`;
  }
}

function createInfrastructureAssessment(
  supportSlotCount: number,
): string {
  switch (supportSlotCount) {
    case 4:
      return "Survey teams identified an extensive infrastructure footprint capable of supporting four specialized installations.";

    case 3:
      return "The system contains several viable development zones capable of supporting three specialized installations.";

    case 2:
      return "The system offers moderate infrastructure capacity with room for two specialized installations.";

    case 1:
    default:
      return "The system’s constrained development footprint permits only one specialized support installation.";
  }
}

type DevelopmentRecommendation = {
  title: string;
  detail: string;
};

function createRecommendation(
  highAffinity: AffinityKey | null,
  lowAffinityCount: number,
  supportSlotCount: number,
): DevelopmentRecommendation {
  if (highAffinity !== null) {
    const outpost =
      PRIMARY_OUTPOSTS[
        OUTPOST_BY_AFFINITY[highAffinity]
      ];

    return {
      title: outpost.name,
      detail:
        `A HIGH ${AFFINITY_NAMES[highAffinity]} affinity makes ` +
        `${outpost.name} development the strongest immediate use of this system.`,
    };
  }

  if (lowAffinityCount === 0) {
    return {
      title: "Flexible Development",
      detail:
        "No dominant affinity was detected, but the system has no major development weaknesses. It can accommodate whichever resource network requires expansion.",
    };
  }

  if (supportSlotCount >= 3) {
    return {
      title: "Support-Heavy Development",
      detail:
        "No HIGH affinity was detected. However, the system’s substantial support capacity may compensate through focused infrastructure specialization.",
    };
  }

  return {
    title: "Selective Development",
    detail:
      "No dominant affinity was detected. Development should favor a NEUTRAL field while avoiding industries affected by LOW affinity conditions.",
  };
}