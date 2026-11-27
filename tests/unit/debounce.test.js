import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounce } from "../../src/domain/debounce.js";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("debounce", () => {
  it("runs once, after the last call has waited long enough", () => {
    const fn = vi.fn();
    const later = debounce(fn, 100);
    later.schedule();
    vi.advanceTimersByTime(60);
    later.schedule();
    vi.advanceTimersByTime(60);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(40);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not run once cancelled", () => {
    const fn = vi.fn();
    const later = debounce(fn, 100);
    later.schedule();
    later.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });
});
