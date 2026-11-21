import * as Y from "yjs";

/**
 * Share a Yjs document with the other open devices, peer to peer over WebRTC.
 * Public Nostr relays introduce the devices (Trystero); no server or account is needed.
 * The secret Gist id names the room and encrypts the introductions.
 */
export async function joinPeers({ gistId, relays, turn, device, doc, onPeers }) {
  const { joinRoom, getRelaySockets } = await import("trystero");
  const config = { appId: "job-local-search", password: gistId };
  if (relays.length) config.relayConfig = { urls: relays };
  // TURN relays the traffic when a direct link is impossible, e.g. a phone on 4G behind a carrier NAT.
  if (turn?.urls) config.turnConfig = [{ urls: turn.urls, username: turn.username, credential: turn.credential }];
  const room = joinRoom(config, gistId);
  const [sendUpdate, onUpdate] = actions(room, "y-update");
  const [sendHello, onHello] = actions(room, "hello");
  const devices = new Map();
  let lastError = "";
  room.onError((e) => { lastError = e.message ?? e.code; });
  const publish = () => onPeers([...devices].map(([id, name]) => ({ id, device: name })));

  // Local edits go to every peer; remote edits are applied with the "peer" origin.
  const onLocal = (update, origin) => { if (origin !== "peer") sendUpdate(update); };
  doc.on("update", onLocal);
  onUpdate((update) => Y.applyUpdate(doc, new Uint8Array(update), "peer"));
  onHello((name, { peerId }) => { devices.set(peerId, name); publish(); });

  // A newcomer gets our name and our whole state; Yjs merges duplicates.
  room.onPeerJoin(({ peerId }) => {
    sendHello(device, { target: peerId });
    sendUpdate(Y.encodeStateAsUpdate(doc), { target: peerId });
  });
  room.onPeerLeave(({ peerId }) => { devices.delete(peerId); publish(); });

  return {
    stop() { doc.off("update", onLocal); room.leave(); },
    diag() {
      const sockets = Object.entries(getRelaySockets());
      return {
        servers: sockets.map(([url, ws]) => ({ url, ok: ws.readyState === WebSocket.OPEN })),
        room: sockets.some(([, ws]) => ws.readyState === WebSocket.OPEN),
        links: Object.keys(room.getPeers()).length,
        turn: Boolean(turn?.urls),
        error: lastError,
      };
    },
  };
}

function actions(room, name) {
  const action = room.makeAction(name);
  return [(data, options) => action.send(data, options), (handler) => action.onMessage(handler)];
}
