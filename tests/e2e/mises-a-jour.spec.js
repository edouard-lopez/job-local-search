import { test, expect } from "@playwright/test";

test("la cloche affiche la dernière mise à jour puis s'éteint", async ({ page }) => {
  await page.goto("/#/");
  await expect(page.getByTestId("bell-dot")).toBeVisible();
  await page.getByTestId("bell").click();
  const dialog = page.getByRole("dialog", { name: /^Mise à jour du \d{2}\/\d{2}\/\d{4}$/ });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId("bell-dot")).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId("bell-dot")).toHaveCount(0);
});

test("le styleguide rend les liens non sûrs en texte", async ({ page }) => {
  await page.goto("/#/styleguide");
  const md = page.getByTestId("markdown");
  await expect(md.locator("li")).toHaveCount(2);
  await expect(md.locator("a[href^='javascript']")).toHaveCount(0);
});

test("un diff montre les offres retirées en rouge et ajoutées en vert", async ({ page }) => {
  await page.goto("/#/styleguide");
  const diff = page.getByTestId("diff");
  await expect(diff.locator("[data-diff='+']")).toHaveCount(1);
  await expect(diff.locator("[data-diff='-']")).toHaveCount(2);
  await expect(diff.locator("[data-diff='+']")).toContainText("Hoist Group");
});
