import * as Y from "yjs";
import { test, expect, nearOffer, OFFERS, card } from "./fixtures.js";

const GIST = "abc123secret";
const FILE = "job-local-search-triage.yjs";
const b64 = (bytes) => Buffer.from(bytes).toString("base64");

/** A Yjs update where `offer` is marked À creuser, as another device would save it. */
function remoteUpdate(offer) {
  const doc = new Y.Doc();
  doc.getMap("triage").set(offer.lien, "dig");
  return b64(Y.encodeStateAsUpdate(doc));
}

/** Fake Gist API; records the saved contents. */
async function fakeGist(page, content) {
  const saves = [];
  await page.route("https://api.github.com/gists**", async (r) => {
    const req = r.request();
    if (req.method() === "GET") return r.fulfill({ json: { id: GIST, files: { [FILE]: { content } } } });
    if (req.method() === "POST") { saves.push(req.postDataJSON()); return r.fulfill({ json: { id: GIST } }); }
    saves.push(req.postDataJSON());
    return r.fulfill({ json: { id: GIST } });
  });
  return saves;
}

test.describe("Synchronisation entre appareils", () => {
  // No WebRTC in tests: peers stay local, the Gist does the sync.
  test.beforeEach(async ({ page }) => { await page.addInitScript(() => { delete window.RTCPeerConnection; }); });

  test("la barre affiche 0 pair ; le menu liste cet appareil", async ({ page }) => {
    await page.goto("/");
    const button = page.getByTestId("peers");
    await expect(button).toHaveText("0");
    await expect(button).toHaveAccessibleName(/^0 pair connecté/);
    await button.click();
    const menu = page.getByRole("dialog", { name: "Appareils connectés" });
    await expect(menu.getByRole("listitem").first()).toHaveText(/\(cet appareil\)$/);
    await expect(menu.getByText("Aucun autre appareil ouvert en ce moment.")).toBeVisible();
    await expect(menu.getByLabel("Jeton GitHub")).toBeVisible();
  });

  test("connecter un Gist importe le tri d'un autre appareil puis enregistre les changements", async ({ page }) => {
    const [remote, local] = [nearOffer(), OFFERS.find((o) => o.id !== nearOffer().id && o.lon > -1.6 && o.lon < -1.2 && !o.zone.startsWith("Lasseube"))];
    const saves = await fakeGist(page, remoteUpdate(remote));
    await page.goto("/");
    await page.getByTestId("peers").click();
    await page.getByLabel("Jeton GitHub").fill("ghp_test");
    await page.getByLabel("Identifiant du Gist").fill(GIST);
    await page.getByRole("button", { name: "Connecter" }).click();
    await expect(page.getByText("Tri enregistré dans le Gist")).toBeVisible();
    await expect(card(page, remote)).toHaveAccessibleName(/^À creuser\./);

    const before = saves.length;
    await card(page, local).getByRole("button", { name: /Marquer .* À creuser/ }).click();
    await expect.poll(() => saves.length, { timeout: 5000 }).toBeGreaterThan(before);
    const doc = new Y.Doc();
    Y.applyUpdate(doc, Buffer.from(saves.at(-1).files[FILE].content, "base64"));
    expect(doc.getMap("triage").toJSON()).toEqual({ [remote.lien]: "dig", [local.lien]: "dig" });
  });

  test("un jeton seul crée un Gist secret", async ({ page }) => {
    const saves = await fakeGist(page, "");
    await page.goto("/");
    await page.getByTestId("peers").click();
    await page.getByLabel("Jeton GitHub").fill("ghp_test");
    await page.getByRole("button", { name: "Connecter" }).click();
    await expect(page.getByText(GIST)).toBeVisible();
    expect(saves[0].public).toBe(false);
  });

  test("l'ancien tri local est repris", async ({ page }) => {
    const o = nearOffer();
    await page.addInitScript((lien) => {
      if (!localStorage.getItem("triage-yjs")) localStorage.setItem("triage", JSON.stringify({ [lien]: "out" }));
    }, o.lien);
    await page.goto("/");
    await expect(card(page, o)).toHaveAccessibleName(/^Exclue\./);
  });
});
