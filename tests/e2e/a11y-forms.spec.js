import { test, expect } from "./fixtures.js";

/** Every field has a unique id, a name and an accessible label. */
async function checkFields(page) {
  const fields = await page.locator("input, textarea, select").evaluateAll((els) => els.map((e) => ({
    id: e.id, name: e.name, label: e.labels?.[0]?.textContent.trim() || e.getAttribute("aria-label") || "",
  })));
  expect(fields.length).toBeGreaterThan(0);
  for (const f of fields) {
    expect(f.id, JSON.stringify(f)).not.toBe("");
    expect(f.name, JSON.stringify(f)).not.toBe("");
    expect(f.label, JSON.stringify(f)).not.toBe("");
  }
  const ids = await page.locator("[id]").evaluateAll((els) => els.map((e) => e.id));
  expect(ids.length).toBe(new Set(ids).size);
}

test("les champs de formulaire ont un id unique, un name et un libellé", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("peers").click();
  await page.locator("summary", { hasText: "Réseau" }).click();
  await checkFields(page);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Mettre à jour les offres/ }).click();
  await checkFields(page);
});

test("le styleguide n'a pas d'id en double", async ({ page }) => {
  await page.goto("/#/styleguide");
  await page.getByTestId("peers").first().click();
  await page.getByTestId("peers").last().click();
  await checkFields(page);
});
