import * as Y from "yjs";
import { test, expect, nearOffer, OFFERS, card } from "./fixtures.js";
import { startRelay } from "./nostr-relay.js";

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

  test("revenir sur l'onglet relit le Gist : un ⭐ posé ailleurs apparaît", async ({ page }) => {
    const o = nearOffer();
    let content = "";
    await page.route("https://api.github.com/gists**", (r) =>
      r.fulfill({ json: { id: GIST, files: { [FILE]: { content } } } }));
    await page.addInitScript((gist) => localStorage.setItem("sync", JSON.stringify({ token: "ghp_test", gistId: gist })), GIST);
    await page.goto("/");
    await expect(card(page, o)).not.toHaveAccessibleName(/^À creuser\./);
    content = remoteUpdate(o);
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(card(page, o)).toHaveAccessibleName(/^À creuser\./);
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

test.describe("P2P réel avec un relais Nostr local", () => {
  test.skip(({ isMobile }) => isMobile, "un seul projet suffit");
  let relay, relayUrl;
  test.beforeAll(async () => { relay = await startRelay(0); relayUrl = `ws://127.0.0.1:${relay.address().port}`; });
  test.afterAll(() => relay?.close());

  async function device(browser) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route(/tile\.openstreetmap\.org/, (r) => r.abort());
    await fakeGist(page, "");
    await page.addInitScript(([gist, url]) => localStorage.setItem("sync",
      JSON.stringify({ token: "ghp_test", gistId: gist, relays: [url] })), [GIST, relayUrl]);
    await page.goto("/");
    return page;
  }

  test("deux appareils se voient, le diagnostic est vert et un ⭐ passe de l'un à l'autre", async ({ browser }) => {
    const [a, b] = [await device(browser), await device(browser)];
    await expect(a.getByTestId("peers")).toHaveText("1", { timeout: 15000 });
    await a.getByTestId("peers").click();
    const diag = a.getByRole("list", { name: "Diagnostic P2P" });
    await expect(diag).toContainText("WebRTC disponible");
    await expect(diag).toContainText(`Relais joignable : ${relayUrl}`);
    await expect(diag).toContainText("Annonce publiée sur au moins un relais");
    const o = nearOffer();
    await card(a, o).getByRole("button", { name: /Marquer .* À creuser/ }).click();
    await expect(card(b, o)).toHaveAccessibleName(/^À creuser\./, { timeout: 10000 });
  });

  test("un relais injoignable apparaît en rouge dans le diagnostic", async ({ page }) => {
    await fakeGist(page, "");
    await page.addInitScript((gist) => localStorage.setItem("sync",
      JSON.stringify({ token: "ghp_test", gistId: gist, relays: ["ws://127.0.0.1:1"] })), GIST);
    await page.goto("/");
    await page.getByTestId("peers").click();
    await expect(page.getByRole("list", { name: "Diagnostic P2P" })).toContainText("Relais injoignable : ws://127.0.0.1:1", { timeout: 5000 });
  });

  test("un serveur TURN saisi est enregistré et signalé dans le diagnostic", async ({ browser }) => {
    const page = await device(browser);
    await page.getByTestId("peers").click();
    const diag = page.getByRole("list", { name: "Diagnostic P2P" });
    await expect(diag).toContainText("Aucun serveur TURN");
    await page.getByLabel(/^Adresse TURN/).fill("turn:turn.exemple.org:443");
    await page.getByLabel("Identifiant TURN").fill("moi");
    await page.getByLabel("Mot de passe TURN").fill("secret");
    await page.getByRole("button", { name: "Enregistrer le réseau" }).click();
    await expect(diag).toContainText("Serveur TURN configuré");
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("sync")).turn);
    expect(saved).toEqual({ urls: "turn:turn.exemple.org:443", username: "moi", credential: "secret" });
  });

  test("coller le JSON iceServers du fournisseur remplit les champs TURN", async ({ browser }) => {
    const page = await device(browser);
    await page.getByTestId("peers").click();
    const creds = { username: "u1", credential: "c1" };
    const answer = [{ urls: "stun:stun.relay.metered.ca:80" },
      { urls: "turn:global.relay.metered.ca:80", ...creds },
      { urls: "turns:global.relay.metered.ca:443?transport=tcp", ...creds }];
    await page.getByLabel(/^Adresse TURN/).fill(JSON.stringify(answer));
    await expect(page.getByLabel(/^Adresse TURN/)).toHaveValue("turn:global.relay.metered.ca:80 turns:global.relay.metered.ca:443?transport=tcp");
    await expect(page.getByLabel("Identifiant TURN")).toHaveValue("u1");
    await expect(page.getByLabel("Mot de passe TURN")).toHaveValue("c1");
  });
});
