import { test as base, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

/** Offers as published: the page and the tests read the same file. */
export const OFFERS = JSON.parse(readFileSync(new URL("../../data/offres.json", import.meta.url)));

/** Known technos, parsed from SEARCH-CRITERIA.md the same way the build does. */
const criteria = readFileSync(new URL("../../SEARCH-CRITERIA.md", import.meta.url), "utf8");
const KNOWN = new Set();
for (let t of criteria.match(/Technos maîtrisées\s*:\s*(.+)/)[1].replace(/\.$/, "").split(",")) {
  t = t.replace(/\(.*?\)/g, "").trim();
  KNOWN.add(t.toLowerCase());
  if (t.includes("/") && t !== "CI/CD") t.split("/").forEach((x) => KNOWN.add(x.trim().toLowerCase()));
}
export const isKnown = (t) => KNOWN.has(t.toLowerCase()) || t.split("/").some((x) => KNOWN.has(x.trim().toLowerCase()));
export const byFrench = (a, b) => a.localeCompare(b, "fr", { sensitivity: "base" });
export const sortTech = (list) => [...list].sort((a, b) => isKnown(b) - isKnown(a) || byFrench(a, b));

/** An offer close to Orx, so it is inside the initial map view. */
export const nearOffer = (pred = () => true) =>
  OFFERS.filter((o) => !o.zone.startsWith("Lasseube") && o.lon > -1.6 && o.lon < -1.2 && pred(o))
    .sort((a, b) => a.distance_km - b.distance_km)[0];

/** Fake route returned by the routing service: 12.345 km, 15 min by car. */
export const ROUTE = { distance: 12345, duration: 900 };

export const test = base.extend({
  routeRequests: async ({}, use) => use([]),
  page: async ({ page, routeRequests }, use) => {
    // Offline and deterministic: no map tiles, fake routing service.
    await page.route(/tile\.openstreetmap\.org/, (r) => r.abort());
    await page.route("https://routing.openstreetmap.de/**", (r) => {
      routeRequests.push(r.request().url());
      r.fulfill({ json: { code: "Ok", routes: [{ ...ROUTE,
        geometry: { type: "LineString", coordinates: [[-1.3767, 43.6036], [-1.47, 43.49]] } }] } });
    });
    await use(page);
  },
});
export { expect };

/** The card of one offer, found by the link to its job ad. */
export const card = (page, offer) =>
  page.getByRole("article").filter({ has: page.locator(`h3 a[href="${offer.lien}"]`) });

export const visibleCount = async (page) =>
  Number((await page.getByText(/offre\(s\) dans la zone visible/).textContent()).match(/\d+/)[0]);
