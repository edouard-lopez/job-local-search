import { safeUrl } from "./text.js";

/**
 * A tiny Markdown reader for the update log (data/mises-a-jour.md).
 * It builds data, never HTML: the components render it, so nothing from the file can inject markup.
 * Supported: "## " sections, paragraphs, "- " lists, **bold**, `code` and [text](https://link).
 */

/** The "## " sections of a log, in file order: [{ title, body }]. */
export function parseUpdates(md) {
  return md.split(/^## /m).slice(1).map((chunk) => {
    const [title, ...rest] = chunk.split("\n");
    return { title: title.trim(), body: rest.join("\n").trim() };
  });
}

/** Paragraphs and lists: [{ type: "paragraph", text } | { type: "list", items: [text] }]. */
export function parseBlocks(body) {
  const blocks = [];
  let current = null;
  for (const raw of body.split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) { current = null; continue; }
    const item = line.match(/^\s*[-*] (.*)/);
    if (item) {
      if (current?.type !== "list") { current = { type: "list", items: [] }; blocks.push(current); }
      current.items.push(item[1]);
    } else if (current?.type === "list" && /^\s+/.test(line)) {
      current.items[current.items.length - 1] += ` ${line.trim()}`;
    } else if (current?.type === "paragraph") {
      current.text += ` ${line.trim()}`;
    } else {
      current = { type: "paragraph", text: line.trim() };
      blocks.push(current);
    }
  }
  return blocks;
}

const INLINE = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Inline pieces: [{ type: "text" | "strong" | "code" | "link", text, href? }]. Only https links stay links. */
export function parseInline(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push({ type: "text", text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ type: "strong", text: m[1] });
    else if (m[2] !== undefined) out.push({ type: "code", text: m[2] });
    else {
      const href = safeUrl(m[4]);
      out.push(href ? { type: "link", text: m[3], href } : { type: "text", text: m[3] });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out;
}

/** A short stable fingerprint, to tell whether the latest update has changed. */
export const fingerprint = (text) => {
  let h = 5381;
  for (const c of text) h = ((h * 33) ^ c.codePointAt(0)) >>> 0;
  return h.toString(36);
};
