import type { HexCoord } from "../types";

export function getHexId(coord: HexCoord): string {
  return `${coord.q},${coord.r}`;
}

export function getHexDistance(coord: HexCoord): number {
  const s = -coord.q - coord.r;

  return Math.max(
    Math.abs(coord.q),
    Math.abs(coord.r),
    Math.abs(s),
  );
}

export function getHexCoordsInRadius(radius: number): HexCoord[] {
  const coords: HexCoord[] = [];

  for (let q = -radius; q <= radius; q++) {
    const rMin = Math.max(-radius, -q - radius);
    const rMax = Math.min(radius, -q + radius);

    for (let r = rMin; r <= rMax; r++) {
      coords.push({ q, r });
    }
  }

  return coords.sort((a, b) => {
    const distanceA = getHexDistance(a);
    const distanceB = getHexDistance(b);

    if (distanceA !== distanceB) {
      return distanceA - distanceB;
    }

    if (a.q !== b.q) {
      return a.q - b.q;
    }

    return a.r - b.r;
  });
}

const HEX_DIRECTIONS: readonly HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function getHexNeighbors(coord: HexCoord): HexCoord[] {
  return HEX_DIRECTIONS.map((direction) => ({
    q: coord.q + direction.q,
    r: coord.r + direction.r,
  }));
}

export function areHexCoordsAdjacent(a: HexCoord, b: HexCoord): boolean {
  return getHexDistance({
    q: a.q - b.q,
    r: a.r - b.r,
  }) === 1;
}