import { defineStore } from "pinia";
import { fetchRoutes } from "../domain/geo.js";

/** The offer the user clicked, and the bike and car routes drawn to it. */
export const useRouteStore = defineStore("route", {
  state: () => ({ offerId: null, status: "idle", routes: [] }),
  actions: {
    async focus(offer) {
      this.offerId = offer.id;
      this.status = "loading";
      this.routes = [];
      try {
        const routes = await fetchRoutes(offer);
        if (this.offerId === offer.id) Object.assign(this, { routes, status: routes.length ? "ready" : "failed" });
      } catch {
        if (this.offerId === offer.id) this.status = "failed";
      }
    },
  },
});
