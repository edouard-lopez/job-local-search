import { test, expect, OFFERS, isKnown, sortTech, visibleCount } from "./fixtures.js";

const contractOf = (c) => /CDI/i.test(c) ? "CDI" : /CDD/i.test(c) ? "CDD" : /intérim/i.test(c) ? "Intérim"
  : /fonction/i.test(c) ? "Fonction publique" : /freelance/i.test(c) ? "Freelance"
  : /altern|apprent/i.test(c) ? "Alternance" : "Autre";

const count = (values) => values.reduce((m, v) => ((m[v] = (m[v] ?? 0) + 1), m), {});

test.describe("Filtres", () => {
  test.beforeEach(async ({ page }) => { await page.goto("/"); });

  test("chaque type de contrat affiche son nombre d'offres", async ({ page }) => {
    const expected = count(OFFERS.map((o) => contractOf(o.contrat)));
    const group = page.getByRole("group", { name: "Filtrer par type de contrat" });
    const labels = await group.getByRole("button").allTextContents();
    expect(labels.map((l) => l.trim()).sort()).toEqual(Object.entries(expected).map(([k, n]) => `${k} (${n})`).sort());
  });

  test("les technos sont groupées (connues puis inconnues) et triées de A à Z", async ({ page }) => {
    const counts = count(OFFERS.flatMap((o) => o.technos));
    const expected = sortTech(Object.keys(counts)).map((t) => `${t} (${counts[t]})`);
    const group = page.getByRole("group", { name: "Filtrer par techno" });
    const labels = (await group.getByRole("button").allTextContents()).map((l) => l.trim());
    expect(labels).toEqual(expected);
  });

  test("le lecteur d'écran distingue technos connues et inconnues", async ({ page }) => {
    const group = page.getByRole("group", { name: "Filtrer par techno" });
    const known = OFFERS.flatMap((o) => o.technos).find(isKnown);
    const unknown = OFFERS.flatMap((o) => o.technos).find((t) => !isKnown(t));
    await expect(group.getByRole("button", { name: new RegExp(`^${known.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")},.*déjà utilisée`) })).toHaveCount(1);
    await expect(group.getByRole("button", { name: new RegExp(`^${unknown.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")},.*inconnue`) })).toHaveCount(1);
  });

  test("filtrer par contrat ne garde que ce contrat", async ({ page }) => {
    const group = page.getByRole("group", { name: "Filtrer par type de contrat" });
    const chip = group.getByRole("button", { name: /^CDI/ });
    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    for (const meta of await page.getByRole("article").allTextContents()) expect(meta).toMatch(/CDI/);
    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "false");
  });

  test("filtrer par techno ne garde que les offres qui l'utilisent", async ({ page }) => {
    const before = await visibleCount(page);
    const group = page.getByRole("group", { name: "Filtrer par techno" });
    const first = group.getByRole("button").first();
    const tech = (await first.textContent()).replace(/\s*\(\d+\)\s*$/, "").trim();
    await first.click();
    const after = await visibleCount(page);
    expect(after).toBeLessThanOrEqual(before);
    for (const a of await page.getByRole("article").all()) await expect(a.getByRole("listitem").filter({ hasText: new RegExp(`^${tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) }).first()).toBeVisible();
  });

  test("masquer la zone Lasseube/Pau retire ces offres", async ({ page }) => {
    // Show everything, then hide the Lasseube zone.
    for (let i = 0; i < 2; i++) { await page.getByRole("button", { name: "Zoom out" }).click(); await page.waitForTimeout(350); }
    const pau = OFFERS.filter((o) => o.zone.startsWith("Lasseube"));
    test.skip(pau.length === 0, "aucune offre dans la zone Lasseube");
    const before = await visibleCount(page);
    await page.getByLabel("Masquer la zone Lasseube/Pau").check();
    await expect.poll(() => visibleCount(page)).toBe(before - pau.length);
  });
});
