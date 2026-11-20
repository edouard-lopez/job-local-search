import { test, expect } from "./fixtures.js";

test("le pied de page mène au styleguide et au changelog", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("navigation", { name: "Pied de page" });
  await footer.getByRole("link", { name: "Styleguide" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Styleguide" })).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(3);
  await footer.getByRole("link", { name: "Changelog" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Changelog" })).toBeVisible();
  await expect(page.getByRole("listitem").first()).toBeVisible();
  await footer.getByRole("link", { name: "Carte" }).click();
  await expect(page.getByRole("region", { name: /Carte des offres/ })).toBeVisible();
});
