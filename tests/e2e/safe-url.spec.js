import { test, expect } from "@playwright/test";
import { safeUrl } from "../../src/domain/text.js";

test("un lien d'offre est accepté seulement en https", () => {
  expect(safeUrl("https://exemple.fr/offre")).toBe("https://exemple.fr/offre");
  for (const bad of ["javascript:alert(1)", " JavaScript:alert(1)", "http://exemple.fr", "data:text/html,x", "", undefined])
    expect(safeUrl(bad)).toBeNull();
});
