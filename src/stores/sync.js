import { defineStore } from "pinia";
import * as Y from "yjs";
import { deviceLabel } from "../domain/device.js";
import { joinPeers } from "../domain/p2p.js";
import { readStorage as read, writeStorage as write } from "../domain/storage.js";
import { createGist, readGist, writeGist } from "../domain/gist.js";
import { debounce } from "../domain/debounce.js";
import { NO_SETTINGS, isEnabled, parseSettings, withNetwork } from "../domain/sync-settings.js";
import { encodeDoc, restoreTriage } from "../domain/triage-doc.js";
import { whileVisible } from "../domain/while-visible.js";

const SETTINGS_KEY = "sync";
const STATE_KEY = "triage-yjs";
const LEGACY_KEY = "triage";
const SAVE_DELAY_MS = 2000;
const DIAG_EVERY_MS = 2000;
/** Re-read the Gist this often while the page is visible: syncs devices that cannot link directly (4G). */
const PULL_EVERY_MS = 30000;


/** One Yjs document per browser: the triage map, cached locally, shared peer to peer and saved in a Gist. */
export const doc = new Y.Doc();
export const triageMap = doc.getMap("triage");

let peers = null;
let saveLater = null;
let diagTimer = null;
let stopPulling = null;

const saveSettings = (settings) => write(SETTINGS_KEY, settings === NO_SETTINGS ? null : JSON.stringify(settings));

/** Sync settings, peers seen peer to peer, and the Gist save status. */
export const useSyncStore = defineStore("sync", {
  state: () => ({
    settings: parseSettings(read(SETTINGS_KEY)),
    device: deviceLabel(),
    peers: [],
    status: "off", // off | syncing | ok | error
    error: "",
    /** Peer-to-peer health, refreshed while connected. */
    diag: { webrtc: typeof RTCPeerConnection !== "undefined", servers: [], room: false, links: 0, turn: false, error: "" },
  }),
  getters: {
    enabled: (s) => isEnabled(s.settings),
    selfPeer: (s) => ({ id: "self", device: s.device, self: true }),
    peerCount: (s) => s.peers.filter((p) => !p.self).length,
    relays: (s) => s.settings.relays ?? [],
    turn: (s) => s.settings.turn ?? null,
  },
  actions: {
    init() {
      restoreTriage(doc, triageMap, { saved: read(STATE_KEY), legacy: read(LEGACY_KEY) });
      saveLater = debounce(() => this.save(), SAVE_DELAY_MS);
      doc.on("update", (_update, origin) => {
        write(STATE_KEY, encodeDoc(doc));
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
        saveSettings(this.settings);
        await this.connect();
      } catch (e) {
        this.fail(e);
      }
    },
    /** Replace the Nostr relays (empty: Trystero's public list) and the TURN server, then restart peer-to-peer. */
    async setNetwork({ relays, turn }) {
      this.settings = withNetwork(this.settings, { relays, turn });
      saveSettings(this.settings);
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
      saveSettings(NO_SETTINGS);
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
      if (stopPulling) return;
      stopPulling = whileVisible(() => { if (this.enabled) this.pull().catch((e) => this.fail(e)); }, PULL_EVERY_MS);
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
      if (this.enabled) saveLater?.schedule();
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
