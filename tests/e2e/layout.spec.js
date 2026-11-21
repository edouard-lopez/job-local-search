import { test, expect, OFFERS, visibleCount } from "./fixtures.js";

test.describe("Mise en page", () => {
  test.beforeEach(async ({ page }) => { await page.goto("/"); });

  test("affiche le titre, la carte et le bouton de mise à jour", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Offres informatique autour d'Orx");
    await expect(page.getByRole("region", { name: /Carte des offres/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Mettre à jour les offres/ })).toBeVisible();
  });

  test("mettre à jour les offres demande une confirmation ; annuler ne lance rien", async ({ page }) => {
    let calls = 0;
    await page.route("**/actions/workflows/*/dispatches", (r) => { calls++; r.fulfill({ status: 204 }); });
    await page.getByRole("button", { name: /Mettre à jour les offres/ }).click();
    const dialog = page.getByRole("dialog", { name: "Mettre à jour les offres" });
    await expect(dialog).toContainText("Lancer la mise à jour des offres ?");
    await dialog.getByRole("button", { name: "Annuler" }).click();
    await expect(dialog).toBeHidden();
    expect(calls).toBe(0);
  });

  test("confirmer lance le workflow avec le jeton, puis le garde", async ({ page }) => {
    const requests = [];
    await page.route("**/actions/workflows/*/dispatches", (r) => { requests.push(r.request()); r.fulfill({ status: 204 }); });
    await page.getByRole("button", { name: /Mettre à jour les offres/ }).click();
    const dialog = page.getByRole("dialog", { name: "Mettre à jour les offres" });
    await dialog.getByLabel("Jeton GitHub").fill("github_pat_test");
    await dialog.getByRole("button", { name: "Lancer" }).click();
    await expect(dialog.getByRole("status")).toContainText("Mise à jour lancée");
    expect(requests).toHaveLength(1);
    expect(requests[0].url()).toMatch(/\/repos\/edouard-lopez\/job-local-search\/actions\/workflows\/update-offers\.yml\/dispatches$/);
    expect(requests[0].method()).toBe("POST");
    expect(requests[0].headers().authorization).toBe("Bearer github_pat_test");
    expect(requests[0].postDataJSON()).toEqual({ ref: "main" });
    await dialog.getByRole("button", { name: "Fermer" }).click();
    await page.getByRole("button", { name: /Mettre à jour les offres/ }).click();
    await expect(dialog.getByLabel("Jeton GitHub")).toHaveCount(0);
    await expect(dialog).toContainText("Jeton GitHub enregistré");
  });

  test("un échec de lancement s'affiche et ne garde pas le jeton", async ({ page }) => {
    await page.route("**/actions/workflows/*/dispatches", (r) => r.fulfill({ status: 403 }));
    await page.getByRole("button", { name: /Mettre à jour les offres/ }).click();
    const dialog = page.getByRole("dialog", { name: "Mettre à jour les offres" });
    await dialog.getByLabel("Jeton GitHub").fill("mauvais");
    await dialog.getByRole("button", { name: "Lancer" }).click();
    await expect(dialog.getByRole("alert")).toContainText("GitHub 403");
    expect(await page.evaluate(() => localStorage.getItem("github-actions-token"))).toBeNull();
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
