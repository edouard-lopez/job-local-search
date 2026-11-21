import { test, expect, OFFERS, visibleCount } from "./fixtures.js";

test.describe("Mise en page", () => {
  test.beforeEach(async ({ page }) => { await page.goto("/"); });

  test("affiche le titre, la carte et le bouton de mise à jour", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Offres informatique autour d'Orx");
    await expect(page.getByRole("region", { name: /Carte des offres/ })).toBeVisible();
    const update = page.getByRole("link", { name: /Mettre à jour les offres/ });
    await expect(update).toHaveAttribute("href", /\/actions\/workflows\/update-offers\.yml$/);
    await expect(update).toHaveAttribute("target", "_blank");
  });

  test("mettre à jour les offres demande une confirmation ; refuser n'ouvre rien", async ({ page, context }) => {
    let message = "";
    page.once("dialog", (d) => { message = d.message(); d.dismiss(); });
    const opened = [];
    context.on("page", (p) => opened.push(p));
    await page.getByRole("link", { name: /Mettre à jour les offres/ }).click();
    await expect.poll(() => message).toMatch(/Lancer la mise à jour des offres \?/);
    await page.waitForTimeout(300);
    expect(opened).toHaveLength(0);
  });

  test("le pied de page mène au dépôt GitHub", async ({ page }) => {
    const repo = page.getByRole("contentinfo").getByRole("link", { name: /Code source/ });
    await expect(repo).toHaveAttribute("href", "https://github.com/edouard-lopez/job-local-search");
  });

  test("le compteur correspond au nombre d'offres listées", async ({ page }) => {
    const n = await visibleCount(page);
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThanOrEqual(OFFERS.length);
    await expect(page.getByRole("article")).toHaveCount(n);
  });

  test("les offres sont triées de la plus récente à la plus ancienne", async ({ page }) => {
    const dates = await page.getByRole("article").locator("time").allTextContents();
    expect(dates.length).toBeGreaterThan(1);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  test("la liste suit la zone visible de la carte", async ({ page }) => {
    const before = await visibleCount(page);
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: "Zoom in" }).click();
      await page.waitForTimeout(350);
    }
    const after = await visibleCount(page);
    expect(after).toBeLessThan(before);
    await expect(page.getByRole("article")).toHaveCount(after);
  });

  test("la page ne produit pas d'erreur JavaScript", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.reload();
    await expect(page.getByRole("article").first()).toBeVisible();
    expect(errors).toEqual([]);
  });
});
