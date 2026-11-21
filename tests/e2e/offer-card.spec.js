import { test, expect, OFFERS, nearOffer, sortTech, card } from "./fixtures.js";

test.describe("Carte d'une offre", () => {
  test.beforeEach(async ({ page }) => { await page.goto("/"); });

  test("le titre ouvre l'annonce dans un nouvel onglet, la date suit le titre", async ({ page }) => {
    const o = nearOffer();
    const c = card(page, o);
    const link = c.getByRole("heading", { level: 3 }).getByRole("link");
    await expect(link).toHaveAttribute("href", o.lien);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(c.getByRole("heading", { level: 3 }).locator("time")).toHaveAttribute("datetime", o.publie);
  });

  test("un nom d'entreprise long est abrégé à 3 mots, avec le nom complet", async ({ page }) => {
    const o = nearOffer((x) => x.entite.split(/\s+/).length > 3);
    test.skip(!o, "aucune entreprise au nom long près d'Orx");
    const c = card(page, o);
    const abbr = c.locator("abbr");
    await expect(abbr).toHaveAttribute("title", o.entite);
    await expect(abbr).toHaveText(o.entite.split(/\s+/).slice(0, 3).join(" ") + "…");
  });

  test("affiche scores, durées et distance ; met en valeur les bonnes valeurs", async ({ page }) => {
    const o = nearOffer();
    const c = card(page, o);
    const text = await c.textContent();
    for (const v of [`${o.score_techno}/5`, `${o.score_libre}/5`, `~${o.velo_min} min`, `~${o.voiture_min} min`, `${o.distance_km} km`])
      expect(text).toContain(v);
    const strong = (await c.locator("strong").allTextContents()).map((s) => s.trim());
    expect(strong.includes(`${o.score_techno}/5`)).toBe(o.score_techno >= 3);
    expect(strong.includes(`${o.score_libre}/5`)).toBe(o.score_libre >= 3);
    expect(strong.includes(`~${o.velo_min} min`)).toBe(o.velo_min < 30);
    expect(strong.includes(`~${o.voiture_min} min`)).toBe(o.voiture_min < 30);
    expect(strong.includes(`${o.distance_km} km`)).toBe(false);
  });

  test("les technos de l'offre sont groupées puis triées de A à Z", async ({ page }) => {
    const o = nearOffer((x) => x.technos.length > 2);
    const c = card(page, o);
    const tags = c.getByRole("list").filter({ has: page.getByRole("listitem").filter({ hasText: o.technos[0] }) }).last().getByRole("listitem");
    const names = (await tags.allTextContents()).map((t) => t.replace(/\s*\((déjà utilisée|inconnue)\)\s*$/, "").trim());
    expect(names).toEqual(sortTech(o.technos));
  });

  test("la mission se déplie", async ({ page }) => {
    const o = nearOffer();
    const c = card(page, o);
    await expect(c.getByText(o.mission.slice(0, 40))).toBeHidden();
    await c.getByText("Mission", { exact: true }).click();
    await expect(c.getByText(o.mission.slice(0, 40))).toBeVisible();
  });
});

test("le salaire s'affiche après le score libre, seulement s'il est indiqué", async ({ page }) => {
  await page.goto("/#/styleguide");
  const items = page.locator("ul", { has: page.locator('li[title^="Salaire"]') }).last().locator("> li");
  const titles = await items.evaluateAll((els) => els.map((e) => e.title));
  expect(titles.slice(1, 3)).toEqual(["Score logiciel libre", "Salaire indiqué dans l'annonce"]);
  await expect(items.nth(2)).toContainText("38-45 k€ brut/an");
  await page.goto("/");
  await expect(page.locator('li[title="Salaire indiqué dans l\'annonce"]')).toHaveCount(OFFERS.filter((o) => o.salaire).length);
});
