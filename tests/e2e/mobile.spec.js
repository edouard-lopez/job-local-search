import { test, expect } from "./fixtures.js";

test("mobile : pas de défilement horizontal, carte et liste visibles", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: /Carte des offres/ })).toBeVisible();
  await expect(page.getByRole("article").first()).toBeAttached();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByRole("link", { name: /Mettre à jour les offres/ })).toBeVisible();
});
