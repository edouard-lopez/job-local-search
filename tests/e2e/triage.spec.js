import { test, expect, nearOffer, card } from "./fixtures.js";

test.describe("Tri « À creuser » / « À exclure »", () => {
  test.beforeEach(async ({ page }) => { await page.goto("/"); });

  test("⭐ marque À creuser : le bouton CV remplace l'étoile", async ({ page }) => {
    const o = nearOffer();
    const c = card(page, o);
    await c.getByRole("button", { name: /Marquer .* À creuser/ }).click();
    await expect(c).toHaveAccessibleName(/^À creuser\./);
    await expect(c).toHaveCSS("border-left-color", "rgb(5, 150, 105)");
    await expect(c.getByRole("button", { name: /Marquer .* À creuser/ })).toHaveCount(0);
    const cv = c.getByRole("link", { name: /Générer un CV personnalisé/ });
    await expect(cv).toHaveAttribute("href", /\/actions\/workflows\/generate-application\.yml$/);
    await expect(cv).toHaveAccessibleName(new RegExp(`offre n° ${o.id}\\b`));
  });

  test("❌ sur une offre À creuser retire seulement le marquage", async ({ page }) => {
    const c = card(page, nearOffer());
    await c.getByRole("button", { name: /Marquer .* À creuser/ }).click();
    await c.getByRole("button", { name: /Retirer de À creuser/ }).click();
    await expect(c).not.toHaveAccessibleName(/^(À creuser|Exclue)\./);
    await expect(c.getByRole("button", { name: /Marquer .* À creuser/ })).toBeVisible();
    await expect(c.getByRole("button", { name: /Marquer comme exclue/ })).toBeVisible();
  });

  test("❌ exclut l'offre : elle se réduit et ne garde que ⭐", async ({ page }) => {
    const o = nearOffer();
    const c = card(page, o);
    await c.getByRole("button", { name: /Marquer comme exclue/ }).click();
    await expect(c).toHaveAccessibleName(/^Exclue\./);
    await expect(c.getByRole("button")).toHaveCount(1);
    await expect(c.getByRole("button", { name: /Marquer .* À creuser/ })).toBeVisible();
    await expect(c.getByText("Mission", { exact: true })).toHaveCount(0);
    expect(Number(await c.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(1);
  });

  test("⭐ sur une offre exclue la passe en À creuser", async ({ page }) => {
    const c = card(page, nearOffer());
    await c.getByRole("button", { name: /Marquer comme exclue/ }).click();
    await c.getByRole("button", { name: /Marquer .* À creuser/ }).click();
    await expect(c).toHaveAccessibleName(/^À creuser\./);
  });

  test("le tri est conservé après rechargement", async ({ page }) => {
    const c = card(page, nearOffer());
    await c.getByRole("button", { name: /Marquer .* À creuser/ }).click();
    await page.reload();
    await expect(card(page, nearOffer())).toHaveAccessibleName(/^À creuser\./);
  });
});
