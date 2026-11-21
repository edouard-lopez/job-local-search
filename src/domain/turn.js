/**
 * Read TURN settings from a pasted `iceServers` snippet, as TURN providers such as Metered give it:
 * strict JSON or a JavaScript snippet (`new RTCPeerConnection({ iceServers: [...] })`, unquoted keys).
 * Returns { urls, username, credential } with every turn:/turns: URL space-separated, or null.
 */
export function parseTurnJson(text) {
  return fromJson(text) ?? fromSnippet(text);
}

const isTurn = (u) => /^turns?:/.test(u);
const result = (urls, username, credential) =>
  urls.length && username && credential ? { urls: [...new Set(urls)].join(" "), username, credential } : null;

/** Strict JSON: { iceServers: [...] } or an array; `urls` may be a string or a list. */
function fromJson(text) {
  try {
    const data = JSON.parse(text);
    const servers = [data.iceServers ?? data].flat().filter((s) => s?.username);
    const [first] = servers;
    return first ? result(servers.flatMap((s) => [s.urls].flat()).filter(isTurn), first.username, first.credential) : null;
  } catch {
    return null;
  }
}

/** JavaScript snippet with unquoted keys and trailing commas, as Metered shows it. */
function fromSnippet(text) {
  const field = (name) => [...text.matchAll(new RegExp(`["']?${name}["']?\\s*:\\s*["']([^"']+)["']`, "g"))].map((m) => m[1]);
  return result(field("urls").filter(isTurn), field("username")[0], field("credential")[0]);
}

/** Several TURN URLs may be given, separated by spaces or commas. */
export const turnUrls = (text) => text.split(/[\s,]+/).filter(Boolean);
