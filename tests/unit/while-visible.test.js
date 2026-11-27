import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { whileVisible } from "../../src/domain/while-visible.js";

let page;
beforeEach(() => {
  vi.useFakeTimers();
  page = Object.assign(new EventTarget(), { hidden: false });
  vi.stubGlobal("document", page);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("whileVisible", () => {
  it("runs on every interval while the page is visible", () => {
    const fn = vi.fn();
    whileVisible(fn, 1000);
    vi.advanceTimersByTime(2000);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("skips intervals while the page is hidden", () => {
    const fn = vi.fn();
    whileVisible(fn, 1000);
    page.hidden = true;
    vi.advanceTimersByTime(3000);
    expect(fn).not.toHaveBeenCalled();
  });

  it("runs as soon as the page becomes visible again", () => {
    const fn = vi.fn();
    whileVisible(fn, 1000);
    page.dispatchEvent(new Event("visibilitychange"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("stops after stop()", () => {
    const fn = vi.fn();
    const stop = whileVisible(fn, 1000);
    stop();
    vi.advanceTimersByTime(3000);
    page.dispatchEvent(new Event("visibilitychange"));
    expect(fn).not.toHaveBeenCalled();
  });
});
