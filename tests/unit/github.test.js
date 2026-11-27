import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dispatchWorkflow, findDispatchRun, newRunId } from "../../src/domain/github.js";

const FILE = "update-offers.yml";
const reply = (body, ok = true, status = 200) => ({ ok, status, json: async () => body });

beforeEach(() => {
  vi.stubGlobal("location", { hostname: "localhost", pathname: "/" });
});
afterEach(() => vi.unstubAllGlobals());

describe("newRunId", () => {
  it("is 12 hex characters and differs each time", () => {
    expect(newRunId()).toMatch(/^[0-9a-f]{12}$/);
    expect(newRunId()).not.toBe(newRunId());
  });
});

describe("dispatchWorkflow", () => {
  it("starts the workflow on main with the run id as nonce", async () => {
    const fetch = vi.fn().mockResolvedValue(reply({}));
    vi.stubGlobal("fetch", fetch);
    await dispatchWorkflow("tok", FILE, "abc");
    const [url, init] = fetch.mock.calls[0];
    expect(url).toContain(`/actions/workflows/${FILE}/dispatches`);
    expect(JSON.parse(init.body)).toEqual({ ref: "main", inputs: { nonce: "abc" } });
    expect(init.headers.Authorization).toBe("Bearer tok");
  });

  it("throws with the HTTP status when GitHub refuses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply({}, false, 403)));
    await expect(dispatchWorkflow("tok", FILE, "abc")).rejects.toThrow("GitHub 403");
  });
});

describe("findDispatchRun", () => {
  it("picks the run whose title carries the id, not another manual run", async () => {
    const runs = [{ id: 1, display_title: "Mettre à jour les offres zzz" }, { id: 2, display_title: "Mettre à jour les offres abc" }];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply({ workflow_runs: runs })));
    expect((await findDispatchRun("tok", FILE, "abc")).id).toBe(2);
  });

  it("returns null while GitHub has not listed the run", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply({ workflow_runs: [] })));
    expect(await findDispatchRun("tok", FILE, "abc")).toBeNull();
  });
});
