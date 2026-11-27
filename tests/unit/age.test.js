import { describe, expect, it } from "vitest";
import { offersAge } from "../../src/domain/age.js";

const DAY = 86_400_000;
const now = Date.parse("2026-11-27T12:00:00Z");
const ago = (days) => new Date(now - days * DAY).toISOString();

describe("offersAge", () => {
  it.each([
    [0, { unit: "today", n: 0 }],
    [1, { unit: "day", n: 1 }],
    [6, { unit: "day", n: 6 }],
    [7, { unit: "week", n: 1 }],
    [29, { unit: "week", n: 4 }],
    [30, { unit: "month", n: 1 }],
    [95, { unit: "month", n: 3 }],
  ])("%i days old", (days, expected) => {
    expect(offersAge(ago(days), now)).toEqual(expected);
  });

  it("treats a future date as today", () => {
    expect(offersAge(ago(-3), now)).toEqual({ unit: "today", n: 0 });
  });
});
