import { describe, expect, it } from "vitest";
import { 
  getExtractionStorageCapacity,
  PRIMARY_OUTPOST_IDS,
  PRIMARY_OUTPOSTS, 
} from "../outposts";

describe("getExtractionStorageCapacity", () => {
  it("provides no storage without an active Outpost level", () => {
    expect(getExtractionStorageCapacity(0)).toBe(0);
    expect(getExtractionStorageCapacity(-1)).toBe(0);
  });

  it("provides 100 storage at Level 1", () => {
    expect(getExtractionStorageCapacity(1)).toBe(100);
  });

  it("adds 10 storage for each additional level", () => {
    expect(getExtractionStorageCapacity(2)).toBe(110);
    expect(getExtractionStorageCapacity(5)).toBe(140);
    expect(getExtractionStorageCapacity(20)).toBe(290);
  });
});

describe(
  "Primary Outpost access configuration",
  () => {
    it(
      "includes every configured Primary Outpost in the roster",
      () => {
        expect(
          new Set(
            PRIMARY_OUTPOST_IDS,
          ).size,
        ).toBe(
          Object.keys(
            PRIMARY_OUTPOSTS,
          ).length,
        );
      },
    );

    it(
      "keeps the current Primary Outposts available from the start",
      () => {
        for (
          const outpostId of
          PRIMARY_OUTPOST_IDS
        ) {
          expect(
            PRIMARY_OUTPOSTS[outpostId]
              .startsUnlocked,
          ).toBe(true);
        }
      },
    );
  },
);