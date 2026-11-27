import { describe, expect, it } from "vitest";
import { safeUrl, shorten } from "../../src/domain/text.js";

describe("safeUrl", () => {
  it("accepts https only", () => {
    expect(safeUrl("https://a.fr/x")).toBe("https://a.fr/x");
    expect(safeUrl("http://a.fr")).toBeNull();
    expect(safeUrl("javascript:alert(1)")).toBeNull();
    expect(safeUrl("pas une url")).toBeNull();
  });
});

describe("shorten", () => {
  it("keeps short names whole", () => {
    expect(shorten("Un deux trois")).toEqual({ text: "Un deux trois", full: false });
  });

  it("cuts after three words and keeps the full name", () => {
    expect(shorten("Un deux trois quatre")).toEqual({ text: "Un deux trois…", full: "Un deux trois quatre" });
  });
});
