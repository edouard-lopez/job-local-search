import * as Y from "yjs";
import { fromBase64, toBase64 } from "./gist.js";

/** The whole document as base64 text, for local storage. */
export const encodeDoc = (doc) => toBase64(Y.encodeStateAsUpdate(doc));

/**
 * Fill the triage map from what this browser saved: the Yjs state if any,
 * otherwise the former JSON triage (first run after the Yjs switch).
 */
export function restoreTriage(doc, map, { saved, legacy }) {
  if (saved) { Y.applyUpdate(doc, fromBase64(saved), "local"); return; }
  try {
    const marks = JSON.parse(legacy ?? "{}");
    doc.transact(() => Object.entries(marks).forEach(([link, status]) => map.set(link, status)), "local");
  } catch { /* nothing to import */ }
}
