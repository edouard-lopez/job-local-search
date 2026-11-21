import { defineStore } from "pinia";
import * as Y from "yjs";
import { deviceLabel } from "../domain/device.js";
import { joinPeers } from "../domain/p2p.js";
import { createGist, readGist, writeGist, toBase64, fromBase64 } from "../domain/gist.js";

const SETTINGS_KEY = "sync";
const STATE_KEY = "triage-yjs";
const LEGACY_KEY = "triage";
const SAVE_DELAY_MS = 2000;
const DIAG_EVERY_MS = 2000;
/** Re-read the Gist this often while the page is visible: syncs devices that cannot link directly (4G). */
const PULL_EVERY_MS = 30000;

const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, value) => { try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch { /* storage unavailable */ } };

/** One Yjs document per browser: the triage map, cached locally, shared peer to peer and saved in a Gist. */
export const doc = new Y.Doc();
export const triageMap = doc.getMap("triage");

function restoreLocal() {
  const saved = read(STATE_KEY);
  if (saved) { Y.applyUpdate(doc, fromBase64(saved), "local"); return; }
  // First run after the Yjs switch: import the former JSON triage.
  try {
    const legacy = JSON.parse(read(LEGACY_KEY) ?? "{}");
    doc.transact(() => Object.entries(legacy).forEach(([k, v]) => triageMap.set(k, v)), "local");
  } catch { /* nothing to import */ }
}

let peers = null;
let saveTimer = null;
let diagTimer = null;
let pullTimer = null;

const NO_SETTINGS = { token: "", gistId: "" };
const loadSettings = () => { try { return JSON.parse(read(SETTINGS_KEY)) ?? NO_SETTINGS; } catch { return NO_SETTINGS; } };

/** Sync settings, peers seen peer to peer, and the Gist save status. */
export const useSyncStore = defineStore("sync", {
  state: () => ({
    settings: loadSettings(),
    device: deviceLabel(),
    peers: [],
    status: "off", // off | syncing | ok | error
    error: "",
    /** Peer-to-peer health, refreshed while connected. */
    diag: { webrtc: typeof RTCPeerConnection !== "undefined", servers: [], room: false, links: 0, turn: false, error: "" },
  }),
  getters: {
    enabled: (s) => Boolean(s.settings.token && s.settings.gistId),
    selfPeer: (s) => ({ id: "self", device: s.device, self: true }),
    peerCount: (s) => s.peers.filter((p) => !p.self).length,
    relays: (s) => s.settings.relays ?? [],
    turn: (s) => s.settings.turn ?? { urls: "", username: "", credential: "" },
  },
  actions: {
    init() {
      restoreLocal();
      doc.on("update", (_update, origin) => {
        write(STATE_KEY, toBase64(Y.encodeStateAsUpdate(doc)));
        if (origin !== "gist") this.scheduleSave();
      });
      this.peers = [this.selfPeer];
      if (this.enabled) this.connect();
    },
    /** Save settings; create the Gist when only a token is given. */
    async configure(token, gistId) {
      this.error = "";
      try {
        const id = gistId.trim() || (await createGist(token.trim(), Y.encodeStateAsUpdate(doc)));
        this.settings = { ...this.settings, token: token.trim(), gistId: id };
        write(SETTINGS_KEY, JSON.stringify(this.settings));
        await this.connect();
      } catch (e) {
        this.fail(e);
      }
    },
    /** Replace the Nostr relays (empty: Trystero's public list) and the TURN server, then restart peer-to-peer. */
    async setNetwork({ relays, turn }) {
      this.settings = { ...this.settings, relays: relays.map((u) => u.trim()).filter(Boolean), turn };
      write(SETTINGS_KEY, JSON.stringify(this.settings));
      this.stopPeers();
      if (this.enabled) await this.startPeers();
    },
    stopPeers() {
      peers?.stop();
      peers = null;
      clearInterval(diagTimer);
      this.diag = { ...this.diag, servers: [], room: false, links: 0, error: "" };
      this.peers = [this.selfPeer];
    },
    disconnect() {
      this.stopPeers();
      this.settings = NO_SETTINGS;
      write(SETTINGS_KEY, null);
      this.status = "off";
    },
    async connect() {
      this.status = "syncing";
      try {
        await this.pull();
        await this.save();
      } catch (e) {
        this.fail(e);
      }
      this.watchGist();
      await this.startPeers();
    },
    /** Merge the Gist into the local document; Yjs ignores what is already known. */
    async pull() {
      const remote = await readGist(this.settings.token, this.settings.gistId);
      if (remote) Y.applyUpdate(doc, remote, "gist");
    },
    watchGist() {
      if (pullTimer) return;
      const pullIfVisible = () => { if (this.enabled && !document.hidden) this.pull().catch((e) => this.fail(e)); };
      pullTimer = setInterval(pullIfVisible, PULL_EVERY_MS);
      document.addEventListener("visibilitychange", pullIfVisible);
    },
    async startPeers() {
      if (peers || !this.diag.webrtc) return;
      peers = await joinPeers({
        gistId: this.settings.gistId, relays: this.relays, turn: this.turn, device: this.device, doc,
        onPeers: (others) => { this.peers = [this.selfPeer, ...others]; },
      });
      diagTimer = setInterval(() => this.refreshDiag(), DIAG_EVERY_MS);
      this.refreshDiag();
    },
    refreshDiag() {
      if (peers) this.diag = { webrtc: this.diag.webrtc, ...peers.diag() };
    },
    scheduleSave() {
      if (!this.enabled) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => this.save(), SAVE_DELAY_MS);
    },
    async save() {
      try {
        await writeGist(this.settings.token, this.settings.gistId, Y.encodeStateAsUpdate(doc));
        this.status = "ok";
        this.error = "";
      } catch (e) {
        this.fail(e);
      }
    },
    fail(error) {
      this.status = "error";
      this.error = error.message;
    },
  },
});
