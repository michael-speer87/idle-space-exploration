import {
    pickOne,
    type RandomNumberGenerator,
} from "../map/seededRandom";

const SYSTEM_NAME_PREFIXES = [
    "Aster",
    "Ardent",
    "Caelum",
    "Cinder",
    "Drift",
    "Eos",
    "Halo",
    "Helix",
    "Kepler",
    "Kestrel",
    "Lumen",
    "Lyra",
    "Meridian",
    "Mira",
    "Nadir",
    "Nova",
    "Orion",
    "Peregrine",
    "Solace",
    "Talos",
    "Umbra",
    "Vega",
    "Vesper",
    "Zenith",
] as const;

const SYSTEM_NAME_SUFFIXES = [
    "Anchorage",
    "Array",
    "Basin",
    "Bastion",
    "Beacon",
    "Belt",
    "Crossing",
    "Crown",
    "Divide",
    "Expanse",
    "Field",
    "Frontier",
    "Gate",
    "Harbor",
    "Haven",
    "Hollow",
    "Point",
    "Prime",
    "Reach",
    "Rest",
    "Rift",
    "Spire",
    "Verge",
    "Watch",
    "Well",
] as const;

const SINGLE_SYSTEM_NAMES = [
    "Aurelia",
    "Caldris",
    "Caelus",
    "Ilyra",
    "Nemea",
    "Orison",
    "Praxia",
    "Selene",
    "Tarsis",
    "Vantrel",
    "Vespera",
    "Yarrow",
] as const;

const CATALOG_PREFIXES = [
  "AX",
  "GR",
  "HX",
  "KX",
  "NV",
  "RX",
  "SV",
  "VX",
] as const;

const MAX_RANDOM_NAME_ATTEMPTS = 50;

export function createUniqueSystemName(
    random: RandomNumberGenerator,
    usedNames: Set<string>,
): string {
    for (
        let attempt = 0;
        attempt < MAX_RANDOM_NAME_ATTEMPTS;
        attempt++
    ) {
        const candidate = createSystemNameCandidate(random);
        
        if (!usedNames.has(candidate)) {
            usedNames.add(candidate);
            return candidate;
        }
    }

    const fallbackName = `Grad Survey ${usedNames.size + 1}`;

    usedNames.add(fallbackName);

    return fallbackName;
}

function createSystemNameCandidate(random: RandomNumberGenerator): string {
    const styleRoll = random();

    if (styleRoll < 0.2) {
        return pickOne(random, SINGLE_SYSTEM_NAMES);
    }

    if (styleRoll < 0.3) {
        const prefix = pickOne(random, CATALOG_PREFIXES);
        const catalogNumber = 100 + Math.floor(random() * 900);

        return `${prefix}-${catalogNumber}`;
    }

    const prefix = pickOne(random, SYSTEM_NAME_PREFIXES);
    const suffix = pickOne(random, SYSTEM_NAME_SUFFIXES);

    return `${prefix} ${suffix}`;
}