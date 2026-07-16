import { describe, expect, it } from "vitest";
import { calculateMaterialFlow } from "../materialEconomySystem";

describe("calculateMaterialFlow", () => {
    it("matches Extraction production with Commerce sales", () => {
        const result = calculateMaterialFlow({
            storedMaterials: 0,
            materialCapacity: 100,
            potentialProductionPerSecond: 1,
            salesThroughputPerSecond: 1,
            seconds: 1,
        });

        expect(result.materialsProduced).toBe(1);
        expect(result.materialsSold).toBe(1);
        expect(result.nextMaterials).toBe(0);
        expect(result.creditsEarned).toBe(1);
    });

    it("pauses Extraction when storage is full and nothing is selling", () => {
        const result = calculateMaterialFlow({
            storedMaterials: 100,
            materialCapacity: 100,
            potentialProductionPerSecond: 5,
            salesThroughputPerSecond: 0,
            seconds: 1,
        });

        expect(result.materialsProduced).toBe(0);
        expect(result.materialsSold).toBe(0);
        expect(result.nextMaterials).toBe(100);
        expect(result.creditsEarned).toBe(0);
    });

    it("allows Commerce to create production space during the same tick", () => {
        const result = calculateMaterialFlow({
            storedMaterials: 100,
            materialCapacity: 100,
            potentialProductionPerSecond: 5,
            salesThroughputPerSecond: 3,
            seconds: 1,
        });

        expect(result.materialsProduced).toBe(3);
        expect(result.materialsSold).toBe(3);
        expect(result.nextMaterials).toBe(100);
        expect(result.creditsEarned).toBe(3);
    });

    it("limits Commerce sales when Material supply is lower than throughput", () => {
        const result = calculateMaterialFlow({
            storedMaterials: 0,
            materialCapacity: 100,
            potentialProductionPerSecond: 1,
            salesThroughputPerSecond: 3,
            seconds: 1,
        });

        expect(result.materialsProduced).toBe(1);
        expect(result.materialsSold).toBe(1);
        expect(result.nextMaterials).toBe(0);
        expect(result.creditsEarned).toBe(1);
    });

    it("produces only enough Materials to fill the remaining storage", () => {
        const result = calculateMaterialFlow({
            storedMaterials: 99.7,
            materialCapacity: 100,
            potentialProductionPerSecond: 1,
            salesThroughputPerSecond: 0,
            seconds: 1,
        });

        expect(result.materialsProduced).toBeCloseTo(0.3);
        expect(result.materialsSold).toBe(0);
        expect(result.nextMaterials).toBe(100);
    });

    it("applies the configured Credit value to sold Materials", () => {
        const result = calculateMaterialFlow({
            storedMaterials: 10,
            materialCapacity: 100,
            potentialProductionPerSecond: 0,
            salesThroughputPerSecond: 2,
            creditsPerMaterial: 2.5,
            seconds: 1,
        });

        expect(result.materialsSold).toBe(2);
        expect(result.nextMaterials).toBe(8);
        expect(result.creditsEarned).toBe(5);
    });

    it("safely clamps invalid negative values", () => {
        const result = calculateMaterialFlow({
            storedMaterials: -50,
            materialCapacity: -100,
            potentialProductionPerSecond: -2,
            salesThroughputPerSecond: -3,
            creditsPerMaterial: -1,
            seconds: -5,
        });

        expect(result.materialsProduced).toBe(0);
        expect(result.materialsSold).toBe(0);
        expect(result.nextMaterials).toBe(0);
        expect(result.creditsEarned).toBe(0);
    });
});