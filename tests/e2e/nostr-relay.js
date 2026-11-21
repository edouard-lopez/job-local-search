import { WebSocketServer } from "ws";

/** Minimal in-memory Nostr relay for tests: stores events, replays and broadcasts them by filter. */
export function startRelay(port) {
  const events = [];
  const subs = new Map(); // socket -> Map(subId -> filters)
  const matches = (event, f) =>
    (!f.kinds || f.kinds.includes(event.kind)) &&
    (!f.authors || f.authors.includes(event.pubkey)) &&
    (!f.ids || f.ids.includes(event.id)) &&
    (!f.since || event.created_at >= f.since) &&
    Object.entries(f).filter(([k]) => k.startsWith("#")).every(([k, values]) =>
      event.tags.some(([name, value]) => name === k.slice(1) && values.includes(value)));
  const wss = new WebSocketServer({ port });
  wss.on("connection", (ws) => {
    subs.set(ws, new Map());
    ws.on("close", () => subs.delete(ws));
    ws.on("message", (raw) => {
      const [type, ...rest] = JSON.parse(raw);
      if (type === "EVENT") {
        const [event] = rest;
        events.push(event);
        ws.send(JSON.stringify(["OK", event.id, true, ""]));
        for (const [client, list] of subs)
          for (const [id, filters] of list)
            if (filters.some((f) => matches(event, f))) client.send(JSON.stringify(["EVENT", id, event]));
      } else if (type === "REQ") {
        const [id, ...filters] = rest;
        subs.get(ws).set(id, filters);
        for (const e of events) if (filters.some((f) => matches(e, f))) ws.send(JSON.stringify(["EVENT", id, e]));
        ws.send(JSON.stringify(["EOSE", id]));
      } else if (type === "CLOSE") {
        subs.get(ws)?.delete(rest[0]);
      }
    });
  });
  return new Promise((ok) => wss.on("listening", () => ok(wss)));
}
