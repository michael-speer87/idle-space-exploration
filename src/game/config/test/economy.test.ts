import { describe, expect, it } from "vitest";
import {
  BASE_EXPEDITION_CREDITS,
  EXPEDITION_CREDITS_PER_INFLUENCE,
  getExpeditionStartingCredits,
} from "../economy";

describe("getExpeditionStartingCredits", () => {
  it("provides the base grant with no Lifetime Influence", () => {
    expect(getExpeditionStartingCredits(0)).toBe(
      BASE_EXPEDITION_CREDITS,
    );
  });

  it("adds funding for each point of Lifetime Influence", () => {
    expect(getExpeditionStartingCredits(3)).toBe(
      BASE_EXPEDITION_CREDITS +
        3 * EXPEDITION_CREDITS_PER_INFLUENCE,
    );
  });

  it("uses only completed whole Influence points", () => {
    expect(getExpeditionStartingCredits(3.9)).toBe(
      BASE_EXPEDITION_CREDITS +
        3 * EXPEDITION_CREDITS_PER_INFLUENCE,
    );
  });

  it("does not reduce funding for invalid negative Influence", () => {
    expect(getExpeditionStartingCredits(-10)).toBe(
      BASE_EXPEDITION_CREDITS,
    );
  });
});