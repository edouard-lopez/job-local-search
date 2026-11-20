import { defineStore } from "pinia";
import offers from "../../data/offres.json";
import { contractCategory } from "../domain/contracts.js";
import { useTriageStore } from "./triage.js";

const countBy = (values) => values.reduce((acc, v) => ((acc[v] = (acc[v] ?? 0) + 1), acc), {});
const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

export const useOffersStore = defineStore("offers", {
  state: () => ({
    offers,
    contracts: [],
    technos: [],
    hideLasseube: false,
    /** Triage groups to hide: "todo", "dig", "out". */
    hiddenGroups: [],
    /** Map bounds as [[south, west], [north, east]]; null until the map is ready. */
    bounds: null,
  }),
  getters: {
    contractCounts: (s) => countBy(s.offers.map((o) => contractCategory(o.contrat))),
    technoCounts: (s) => countBy(s.offers.flatMap((o) => o.technos)),
    /** Offers matching the filters, wherever they are on the map. */
    filtered(s) {
      const triage = useTriageStore();
      const group = (o) => triage.statusOf(o) ?? "todo";
      return s.offers.filter(
        (o) =>
          (!s.contracts.length || s.contracts.includes(contractCategory(o.contrat))) &&
          (!s.technos.length || o.technos.some((t) => s.technos.includes(t))) &&
          !(s.hideLasseube && o.zone.startsWith("Lasseube")) &&
          !s.hiddenGroups.includes(group(o)),
      );
    },
    /** Filtered offers inside the visible map area, newest first. */
    visible(s) {
      const inBounds = ({ lat, lon }) =>
        !s.bounds || (lat >= s.bounds[0][0] && lat <= s.bounds[1][0] && lon >= s.bounds[0][1] && lon <= s.bounds[1][1]);
      return this.filtered.filter(inBounds).sort((a, b) => String(b.publie ?? "").localeCompare(String(a.publie ?? "")));
    },
  },
  actions: {
    toggleContract(value) { this.contracts = toggle(this.contracts, value); },
    toggleTechno(value) { this.technos = toggle(this.technos, value); },
    toggleGroup(value) { this.hiddenGroups = toggle(this.hiddenGroups, value); },
    setBounds(bounds) { this.bounds = bounds; },
  },
});
