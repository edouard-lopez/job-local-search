import { test, expect, nearOffer, card, ROUTE } from "./fixtures.js";

const km = (ROUTE.distance / 1000).toFixed(1);

test.describe("Itinéraire au clic", () => {
  test.beforeEach(async ({ page }) => { await page.goto("/"); });

  test("la sélection calcule les itinéraires vélo (20 km/h) et voiture", async ({ page, routeRequests }) => {
    const o = nearOffer();
    await card(page, o).locator("time").click();
    const bike = `Vélo : ${km} km, ~${Math.round(ROUTE.distance / 1000 / 20 * 60)} min \\(20 km/h\\)`;
    const car = `Voiture : ${km} km, ~${Math.round(ROUTE.duration / 60)} min`;
    await expect(card(page, o).getByRole("status")).toHaveText(new RegExp(`^${bike} · ${car}$`));
    expect(routeRequests.some((u) => u.includes("/routed-bike/"))).toBe(true);
    expect(routeRequests.some((u) => u.includes("/routed-car/"))).toBe(true);
  });

  test("carte : marqueur d'arrivée rouge, trajet vélo vert et trajet voiture bleu", async ({ page }) => {
    await card(page, nearOffer()).locator("time").click();
    await expect(page.locator(".arrival-marker path")).toHaveAttribute("fill", "#dc2626");
    await expect(page.locator('#map path.leaflet-interactive[stroke="#16a34a"]')).toHaveCount(1);
    await expect(page.locator('#map path.leaflet-interactive[stroke="#2563eb"]')).toHaveCount(1);
  });

  test("si un seul service répond, son itinéraire reste affiché", async ({ page }) => {
    await page.route("https://routing.openstreetmap.de/routed-car/**", (r) => r.abort());
    const o = nearOffer();
    await card(page, o).locator("time").click();
    await expect(card(page, o).getByRole("status")).toHaveText(/^Vélo : [^·]+$/);
  });

  test("clavier : Entrée sur une offre calcule l'itinéraire", async ({ page, routeRequests }) => {
    const o = nearOffer();
    const c = card(page, o);
    await c.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => routeRequests.length).toBeGreaterThan(0);
    await expect(card(page, o).getByRole("status")).toHaveText(/^Vélo : .* · Voiture :/);
  });

  test("si le service d'itinéraire échoue, un message le dit", async ({ page }) => {
    await page.route("https://routing.openstreetmap.de/**", (r) => r.abort());
    const o = nearOffer();
    await card(page, o).locator("time").click();
    await expect(card(page, o).getByRole("status")).toHaveText(/Itinéraire indisponible/);
  });
});
