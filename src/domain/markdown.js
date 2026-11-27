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

const DIFF_OPEN = /^```diff\s*$/;
const FENCE_CLOSE = /^```\s*$/;
const BULLET = /^\s*[-*] (.*)/;
const DIFF_LINE = /^([+-]) ?(.*)/;

/** One line inside a diff fence: "+ x" is added, "- x" is removed, anything else is plain. */
function diffLine(line) {
  const m = line.match(DIFF_LINE);
  return m ? { sign: m[1], text: m[2] } : { sign: " ", text: line.trim() };
}

/** Add a non-diff line to the blocks; `current` is the open list or paragraph, if any. Returns the new open block. */
function addTextLine(blocks, current, line) {
  const bullet = line.match(BULLET);
  if (bullet) {
    const list = current?.type === "list" ? current : { type: "list", items: [] };
    if (list !== current) blocks.push(list);
    list.items.push(bullet[1]);
    return list;
  }
  if (current?.type === "list" && /^\s+/.test(line)) {
    current.items[current.items.length - 1] += ` ${line.trim()}`;
    return current;
  }
  if (current?.type === "paragraph") {
    current.text += ` ${line.trim()}`;
    return current;
  }
  const paragraph = { type: "paragraph", text: line.trim() };
  blocks.push(paragraph);
  return paragraph;
}

/** Paragraphs, lists and diffs: [{ type: "paragraph", text } | { type: "list", items } | { type: "diff", lines }]. */
export function parseBlocks(body) {
  const blocks = [];
  let current = null;
  for (const raw of body.split("\n")) {
    const line = raw.trimEnd();
    if (current?.type === "diff") {
      if (FENCE_CLOSE.test(line)) current = null;
      else if (line.trim()) current.lines.push(diffLine(line));
    } else if (DIFF_OPEN.test(line)) {
      current = { type: "diff", lines: [] };
      blocks.push(current);
    } else if (!line.trim()) {
      current = null;
    } else {
      current = addTextLine(blocks, current, line);
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
