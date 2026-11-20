import { defineStore } from "pinia";
import { triageMap } from "./sync.js";

/**
 * Triage of offers, keyed by ad URL: "dig" (À creuser) or "out" (exclue).
 * ⭐ marks an offer "dig". ❌ removes "dig", otherwise excludes the offer.
 * The shared Yjs map holds the truth; `marks` mirrors it for Vue.
 */
export const useTriageStore = defineStore("triage", {
  state: () => ({ marks: triageMap.toJSON() }),
  getters: { statusOf: (s) => (offer) => s.marks[offer.lien] ?? null },
  actions: {
    init() {
      this.marks = triageMap.toJSON();
      triageMap.observe(() => { this.marks = triageMap.toJSON(); });
    },
    dig(offer) { this.set(offer, "dig"); },
    cross(offer) { this.set(offer, this.marks[offer.lien] === "dig" ? null : "out"); },
    set(offer, status) {
      if (status) triageMap.set(offer.lien, status);
      else triageMap.delete(offer.lien);
    },
  },
});
