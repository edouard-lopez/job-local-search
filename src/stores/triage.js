import { defineStore } from "pinia";

const KEY = "triage";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; } };

/**
 * Per-browser triage of offers, keyed by ad URL: "dig" (À creuser) or "out" (exclue).
 * ⭐ marks an offer "dig". ❌ removes "dig", otherwise excludes the offer.
 */
export const useTriageStore = defineStore("triage", {
  state: () => ({ marks: load() }),
  getters: { statusOf: (s) => (offer) => s.marks[offer.lien] ?? null },
  actions: {
    dig(offer) { this.set(offer, "dig"); },
    cross(offer) { this.set(offer, this.marks[offer.lien] === "dig" ? null : "out"); },
    set(offer, status) {
      if (status) this.marks[offer.lien] = status;
      else delete this.marks[offer.lien];
      try { localStorage.setItem(KEY, JSON.stringify(this.marks)); } catch { /* storage unavailable: keep in memory */ }
    },
  },
});
