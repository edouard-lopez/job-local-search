import { test, expect } from "@playwright/test";

test("la cloche affiche la dernière mise à jour puis s'éteint", async ({ page }) => {
  await page.goto("/#/");
  await expect(page.getByTestId("bell-dot")).toBeVisible();
  await page.getByTestId("bell").click();
  const dialog = page.getByRole("dialog", { name: /Mise à jour du 27\/11\/2026/ });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("11 offres revérifiées");
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
