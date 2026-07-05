import type { HexCoord } from "../types";

export const HEX_SIZE = 42;

export function axialToPixel(coord: HexCoord, size = HEX_SIZE) {
    return {
        x: size * Math.sqrt(3) * (coord.q + coord.r / 2),
        y: size * 1.5 * coord.r,
    };
}

export function getHexCornerPoints(size = HEX_SIZE * 0.48): number[] {
    const points: number[] = [];

    for (let i = 0; i < 6; i++) {
        const angleDegrees = 60 * i - 30;
        const angleRadians = (Math.PI / 180) * angleDegrees;

        points.push(Math.cos(angleRadians) * size);
        points.push(Math.sin(angleRadians) * size);
    }

    return points;
}