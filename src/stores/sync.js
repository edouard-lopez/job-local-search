import { defineStore } from "pinia";
import * as Y from "yjs";
import { deviceLabel } from "../domain/device.js";
import { createGist, readGist, writeGist, toBase64, fromBase64 } from "../domain/gist.js";

const SETTINGS_KEY = "sync";
const STATE_KEY = "triage-yjs";
const LEGACY_KEY = "triage";
const SAVE_DELAY_MS = 2000;

const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, value) => { try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch { /* storage unavailable */ } };

/** One Yjs document per browser: the triage map, cached locally, shared by WebRTC and saved in a Gist. */
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

let provider = null;
let saveTimer = null;

/** Sync settings, peers seen by WebRTC, and the Gist save status. */
export const useSyncStore = defineStore("sync", {
  state: () => ({
    settings: JSON.parse(read(SETTINGS_KEY) ?? "null") ?? { token: "", gistId: "" },
    device: deviceLabel(),
    peers: [],
    status: "off", // off | syncing | ok | error
    error: "",
  }),
  getters: {
    enabled: (s) => Boolean(s.settings.token && s.settings.gistId),
    peerCount: (s) => s.peers.filter((p) => !p.self).length,
  },
  actions: {
    init() {
      restoreLocal();
      doc.on("update", (_update, origin) => {
        write(STATE_KEY, toBase64(Y.encodeStateAsUpdate(doc)));
        if (origin !== "gist") this.scheduleSave();
      });
      this.peers = [{ id: "self", device: this.device, self: true }];
      if (this.enabled) this.connect();
    },
    /** Save settings; create the Gist when only a token is given. */
    async configure(token, gistId) {
      this.error = "";
      try {
        const id = gistId.trim() || (await createGist(token.trim(), Y.encodeStateAsUpdate(doc)));
        this.settings = { token: token.trim(), gistId: id };
        write(SETTINGS_KEY, JSON.stringify(this.settings));
        await this.connect();
      } catch (e) {
        this.status = "error";
        this.error = e.message;
      }
    },
    disconnect() {
      provider?.destroy();
      provider = null;
      this.settings = { token: "", gistId: "" };
      write(SETTINGS_KEY, null);
      this.status = "off";
      this.peers = [{ id: "self", device: this.device, self: true }];
    },
    async connect() {
      this.status = "syncing";
      try {
        const remote = await readGist(this.settings.token, this.settings.gistId);
        if (remote) Y.applyUpdate(doc, remote, "gist");
        await this.save();
      } catch (e) {
        this.status = "error";
        this.error = e.message;
      }
      await this.startPeers();
    },
    async startPeers() {
      if (provider || typeof RTCPeerConnection === "undefined") return;
      const { WebrtcProvider } = await import("y-webrtc");
      // The secret Gist id names the room and encrypts the signalling messages.
      provider = new WebrtcProvider(`job-local-search-${this.settings.gistId}`, doc, { password: this.settings.gistId });
      const awareness = provider.awareness;
      awareness.setLocalStateField("device", this.device);
      const refresh = () => {
        this.peers = [...awareness.getStates()].map(([id, s]) => ({ id, device: s.device ?? "?", self: id === awareness.clientID }));
      };
      awareness.on("change", refresh);
      refresh();
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
        this.status = "error";
        this.error = e.message;
      }
    },
  },
});
