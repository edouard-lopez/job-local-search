import { defineStore } from "pinia";
import built from "../data/offers-updated.json";
import { findDispatchRun } from "../domain/github.js";
import { readStorage, writeStorage } from "../domain/storage.js";

const WORKFLOW = "update-offers.yml";
const KEY = "update-run";
const POLL_MS = 15_000;
const GIVE_UP_MS = 90 * 60_000;
const read = () => { try { return JSON.parse(readStorage(KEY)); } catch { return null; } };
const write = (v) => writeStorage(KEY, v ? JSON.stringify(v) : null);

/**
 * Follows the "update offers" workflow once it is started, and records when the offers were last updated.
 * phase: idle | running | done | failed. `updated` starts from the build and moves to the run's end.
 */
export const useUpdatesStore = defineStore("updates", {
  state: () => ({ updated: built.updated, phase: "idle", error: "", runUrl: "" }),
  actions: {
    /** Poll the run identified by `runId` (started at `startedAt`, ms) until it ends. */
    async track(token, runId, startedAt = Date.now()) {
      this.phase = "running";
      this.error = "";
      write({ runId, startedAt });
      const poll = async () => {
        if (this.phase !== "running") return;
        try {
          const run = await findDispatchRun(token, WORKFLOW, runId);
          if (run?.html_url) this.runUrl = run.html_url;
          if (run?.status === "completed") return this.finish(run);
        } catch (e) {
          if (/ 40[13]$/.test(e.message)) return this.fail(e.message);
        }
        if (Date.now() - startedAt > GIVE_UP_MS) return this.fail("délai dépassé");
        setTimeout(poll, POLL_MS);
      };
      await poll();
    },
    finish(run) {
      write(0);
      if (run.conclusion === "success") {
        this.updated = run.updated_at;
        this.phase = "done";
      } else {
        this.fail(run.conclusion ?? "inconnu");
      }
    },
    fail(message) {
      write(0);
      this.error = message;
      this.phase = "failed";
    },
    /** After a page reload: follow a run that was started before it. */
    resume(token) {
      const saved = read();
      if (token && saved?.runId && this.phase === "idle") this.track(token, saved.runId, saved.startedAt);
    },
  },
});
