/**
 * Read TURN settings from a pasted `iceServers` JSON, as TURN providers such as Metered give it:
 * an object or an array of { urls, username, credential }, possibly wrapped in { iceServers }.
 * Returns { urls, username, credential } with every turn:/turns: URL space-separated, or null.
 */
export function parseTurnJson(text) {
  try {
    const data = JSON.parse(text);
    const servers = [data.iceServers ?? data].flat();
    const isTurn = (u) => /^turns?:/.test(u);
    const first = servers.find((s) => s.username && [s.urls].flat().some(isTurn));
    if (!first) return null;
    const urls = servers.filter((s) => s.username === first.username).flatMap((s) => [s.urls].flat()).filter(isTurn);
    return { urls: [...new Set(urls)].join(" "), username: first.username, credential: first.credential };
  } catch {
    return null;
  }
}

/** Several TURN URLs may be given, separated by spaces or commas. */
export const turnUrls = (text) => text.split(/[\s,]+/).filter(Boolean);
