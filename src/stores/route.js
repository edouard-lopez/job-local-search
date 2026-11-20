import { defineStore } from "pinia";
import { fetchRoute } from "../domain/geo.js";

/** The offer the user clicked, and the route drawn to it. */
export const useRouteStore = defineStore("route", {
  state: () => ({ offerId: null, status: "idle", route: null }),
  actions: {
    async focus(offer) {
      this.offerId = offer.id;
      this.status = "loading";
      this.route = null;
      try {
        const route = await fetchRoute(offer);
        if (this.offerId === offer.id) Object.assign(this, { route, status: "ready" });
      } catch {
        if (this.offerId === offer.id) this.status = "failed";
      }
    },
  },
});
