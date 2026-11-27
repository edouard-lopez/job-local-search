import { readFileSync } from "node:fs";
import { test, expect } from "./fixtures.js";
import { offersAge } from "../../src/domain/age.js";

const NOW = Date.parse("2026-11-27T10:00:00Z");
const ago = (days) => new Date(NOW - days * 86_400_000).toISOString();

test("l'âge des offres : aujourd'hui, jours, semaines puis mois", () => {
  expect(offersAge(ago(0.3), NOW)).toEqual({ unit: "today", n: 0 });
  expect(offersAge(ago(1), NOW)).toEqual({ unit: "day", n: 1 });
  expect(offersAge(ago(6), NOW)).toEqual({ unit: "day", n: 6 });
  expect(offersAge(ago(7), NOW)).toEqual({ unit: "week", n: 1 });
  expect(offersAge(ago(29), NOW)).toEqual({ unit: "week", n: 4 });
  expect(offersAge(ago(30), NOW)).toEqual({ unit: "month", n: 1 });
  expect(offersAge(ago(100), NOW)).toEqual({ unit: "month", n: 3 });
  expect(offersAge(new Date(NOW + 86_400_000).toISOString(), NOW)).toEqual({ unit: "today", n: 0 });
});

test("le styleguide montre l'âge en toutes lettres, avec la date en infobulle", async ({ page }) => {
  await page.goto("/#/styleguide");
  const ages = page.getByTestId("ages").locator("time");
  await expect(ages).toHaveText(["offres d'aujourd'hui", "offres de 3 jours", "offres de 2 semaines", "offres de 3 mois"]);
  await expect(ages.nth(1).locator("abbr")).toHaveAttribute("title", /Dernière mise à jour : 24 novembre 2026/);
  await expect(ages.nth(1)).toHaveAttribute("datetime", "2026-11-24T10:00:00Z");
});

test("le pied de page indique l'âge des offres, à côté du bouton", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  let updated = null;
  try { updated = JSON.parse(readFileSync(new URL("../../src/data/offers-updated.json", import.meta.url))).updated; } catch { /* not generated */ }
  test.skip(!updated, "pas d'historique git avec une mise à jour des offres");
  await expect(footer.locator("time")).toHaveText(/^offres (de \d+ (jours?|semaines?|mois)|d'aujourd'hui)$/);
  await expect(footer.locator("time abbr")).toHaveAttribute("title", /^Dernière mise à jour : \d{1,2}(er)? \S+ \d{4}/);
  await expect(footer.getByRole("button", { name: "Chercher des offres" })).toBeVisible();
  await expect(page.getByRole("banner").getByRole("button", { name: /Chercher des offres/ })).toHaveCount(0);
});

const startSearch = async (page) => {
  await page.getByRole("contentinfo").getByRole("button", { name: "Chercher des offres" }).click();
  const dialog = page.getByRole("dialog", { name: "Chercher des offres" });
  await dialog.getByLabel("Jeton GitHub").fill("github_pat_test");
  await dialog.getByRole("button", { name: "Lancer" }).click();
  await expect(dialog.getByRole("status")).toContainText("Recherche lancée");
  await dialog.getByRole("button", { name: "Fermer" }).click();
};

test.describe("suivi du workflow", () => {
  test.beforeEach(async ({ page }) => { await page.clock.install(); await page.goto("/"); });

  test("en cours, puis ✔ vert à la place du bouton, et la date est mise à jour", async ({ page }) => {
    const future = new Date(Date.now() + 2 * 86_400_000);
    let polls = 0;
    const seen = [];
    await page.route("**/actions/workflows/*/dispatches", (r) => r.fulfill({ status: 204 }));
    await page.route("**/actions/workflows/*/runs**", (r) => {
      polls++;
      seen.push({ url: r.request().url(), auth: r.request().headers().authorization });
      const done = polls >= 2;
      r.fulfill({ json: { workflow_runs: [{
        html_url: "https://github.com/edouard-lopez/job-local-search/actions/runs/42",
        created_at: new Date(Date.now() - 1000).toISOString(),
        status: done ? "completed" : "in_progress", conclusion: done ? "success" : null,
        updated_at: future.toISOString() }] } });
    });
    await startSearch(page);
    const footer = page.getByRole("contentinfo");
    const running = footer.getByTestId("update-running");
    await expect(running).toContainText("Recherche en cours");
    await expect(running.getByRole("link", { name: /Recherche en cours/ })).toHaveAttribute("href", "https://github.com/edouard-lopez/job-local-search/actions/runs/42");
    await expect(running.getByRole("link")).toHaveAttribute("target", "_blank");
    await expect(footer.getByTestId("update-spinner")).toHaveCSS("animation-name", "spin");
    await expect(footer.getByRole("button", { name: "Chercher des offres" })).toHaveCount(0);
    await page.clock.fastForward(16_000);
    const done = footer.getByTestId("update-done");
    await expect(done).toBeVisible();
    await expect(done).toContainText("Recherche terminée");
    await expect(done).toHaveAttribute("title", "Recharge la page pour voir les nouvelles offres");
    await expect(footer.getByRole("button", { name: "Chercher des offres" })).toHaveCount(0);
    await expect(footer.locator("time")).toHaveText("offres d'aujourd'hui");
    await expect(footer.locator("time abbr")).toHaveAttribute("title", `Dernière mise à jour : ${future.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}`);
    expect(seen[0].url).toMatch(/\/workflows\/update-offers\.yml\/runs\?event=workflow_dispatch/);
    expect(seen[0].auth).toBe("Bearer github_pat_test");
  });

  test("un échec du workflow remet le bouton et affiche l'erreur", async ({ page }) => {
    await page.route("**/actions/workflows/*/dispatches", (r) => r.fulfill({ status: 204 }));
    await page.route("**/actions/workflows/*/runs**", (r) => r.fulfill({ json: { workflow_runs: [{
      created_at: new Date().toISOString(), status: "completed", conclusion: "failure", updated_at: new Date().toISOString() }] } }));
    await startSearch(page);
    await expect(page.getByRole("alert")).toContainText("La recherche a échoué (failure)");
    await expect(page.getByRole("contentinfo").getByRole("button", { name: "Chercher des offres" })).toBeVisible();
    await expect(page.getByTestId("update-done")).toHaveCount(0);
  });

  test("après un rechargement, le suivi reprend avec le jeton enregistré", async ({ page }) => {
    let polls = 0;
    await page.route("**/actions/workflows/*/dispatches", (r) => r.fulfill({ status: 204 }));
    await page.route("**/actions/workflows/*/runs**", (r) => {
      polls++;
      r.fulfill({ json: { workflow_runs: [{ created_at: new Date().toISOString(), status: polls >= 3 ? "completed" : "queued",
        conclusion: polls >= 3 ? "success" : null, updated_at: new Date().toISOString() }] } });
    });
    await startSearch(page);
    await page.reload();
    await expect(page.getByTestId("update-running")).toBeVisible();
  });
});

test("la recherche en cours tourne et pointe vers les exécutions, même sans préférence de mouvement", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/styleguide");
  const running = page.getByTestId("search-phases").getByTestId("update-running");
  await expect(running.getByTestId("update-spinner")).toHaveCSS("animation-name", "spin");
  await expect(running.getByRole("link")).toHaveAttribute("href", /\/actions/);
});
