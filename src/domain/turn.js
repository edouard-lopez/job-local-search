/**
 * Read TURN settings from a pasted `iceServers` snippet, as TURN providers such as Metered give it:
 * strict JSON or a JavaScript snippet (`new RTCPeerConnection({ iceServers: [...] })`, unquoted keys).
 * Returns { urls, username, credential } with every turn:/turns: URL space-separated, or null.
 */
export function parseTurnJson(text) {
  const field = (name) => [...text.matchAll(new RegExp(`["']?${name}["']?\\s*:\\s*["']([^"']+)["']`, "g"))].map((m) => m[1]);
  const urls = [...new Set(field("urls").filter((u) => /^turns?:/.test(u)))];
  const [username] = field("username");
  const [credential] = field("credential");
  return urls.length && username && credential ? { urls: urls.join(" "), username, credential } : null;
}

/** Several TURN URLs may be given, separated by spaces or commas. */
export const turnUrls = (text) => text.split(/[\s,]+/).filter(Boolean);
