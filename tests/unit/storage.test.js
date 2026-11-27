import { afterEach, describe, expect, it, vi } from "vitest";
import { readStorage, writeStorage } from "../../src/domain/storage.js";

const memory = () => {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k) };
};
const blocked = () => ({ getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); }, removeItem: () => { throw new Error("denied"); } });

afterEach(() => vi.unstubAllGlobals());

describe("storage", () => {
  it("writes then reads a value", () => {
    vi.stubGlobal("localStorage", memory());
    writeStorage("k", "v");
    expect(readStorage("k")).toBe("v");
  });

  it("reads null for a missing key", () => {
    vi.stubGlobal("localStorage", memory());
    expect(readStorage("absent")).toBeNull();
  });

  it("removes the key when the value is null", () => {
    vi.stubGlobal("localStorage", memory());
    writeStorage("k", "v");
    writeStorage("k", null);
    expect(readStorage("k")).toBeNull();
  });

  it("does not throw when storage is blocked", () => {
    vi.stubGlobal("localStorage", blocked());
    expect(() => writeStorage("k", "v")).not.toThrow();
    expect(readStorage("k")).toBeNull();
  });
});
