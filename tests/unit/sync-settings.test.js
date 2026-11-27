import { describe, expect, it } from "vitest";
import { NO_SETTINGS, isEnabled, parseSettings, withNetwork } from "../../src/domain/sync-settings.js";

describe("parseSettings", () => {
  it("reads saved settings", () => {
    expect(parseSettings('{"token":"t","gistId":"g"}')).toEqual({ token: "t", gistId: "g" });
  });

  it.each([null, "", "pas du json", "null"])("falls back to no settings for %j", (text) => {
    expect(parseSettings(text)).toEqual(NO_SETTINGS);
  });
});

describe("isEnabled", () => {
  it("needs both a token and a Gist id", () => {
    expect(isEnabled({ token: "t", gistId: "g" })).toBe(true);
    expect(isEnabled({ token: "t", gistId: "" })).toBe(false);
    expect(isEnabled(NO_SETTINGS)).toBe(false);
  });
});

describe("withNetwork", () => {
  it("trims relays, drops empty ones and keeps the other settings", () => {
    const turn = { urls: "turn:x" };
    expect(withNetwork({ token: "t", gistId: "g" }, { relays: [" wss://a ", "", "  "], turn })).toEqual({
      token: "t", gistId: "g", relays: ["wss://a"], turn,
    });
  });
});
