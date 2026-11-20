import { test, expect, nearOffer, card, ROUTE } from "./fixtures.js";

const km = (ROUTE.distance / 1000).toFixed(1);

test.describe("Itinéraire au clic", () => {
  test.beforeEach(async ({ page }) => { await page.goto("/"); });

  test("à moins de 20 km : itinéraire vélo à 20 km/h", async ({ page, routeRequests }) => {
    const o = nearOffer((x) => x.distance_km < 20);
    test.skip(!o, "aucune offre à moins de 20 km");
    const c = card(page, o);
    await c.locator("time").click();
    await expect(card(page, o).getByRole("status")).toHaveText(new RegExp(`Vélo : ${km} km, ~${Math.round(ROUTE.distance / 1000 / 20 * 60)} min`));
    expect(routeRequests.at(-1)).toContain("/routed-bike/");
  });

  test("au-delà de 20 km : itinéraire voiture", async ({ page, routeRequests }) => {
    const o = nearOffer((x) => x.distance_km >= 20);
    test.skip(!o, "aucune offre à plus de 20 km près d'Orx");
    await card(page, o).locator("time").click();
    await expect(card(page, o).getByRole("status")).toHaveText(new RegExp(`Voiture : ${km} km, ~${Math.round(ROUTE.duration / 60)} min`));
    expect(routeRequests.at(-1)).toContain("/routed-car/");
  });

  test("clavier : Entrée sur une offre calcule l'itinéraire", async ({ page, routeRequests }) => {
    const o = nearOffer();
    const c = card(page, o);
    await c.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => routeRequests.length).toBeGreaterThan(0);
    await expect(card(page, o).getByRole("status")).toHaveText(/^(Vélo|Voiture) :/);
  });

  test("si le service d'itinéraire échoue, un message le dit", async ({ page }) => {
    await page.route("https://routing.openstreetmap.de/**", (r) => r.abort());
    const o = nearOffer();
    await card(page, o).locator("time").click();
    await expect(card(page, o).getByRole("status")).toHaveText(/Itinéraire indisponible/);
  });
});
