/**
 * Read TURN settings from Cloudflare's credentials response, pasted as JSON:
 * {"iceServers": {"urls": [...], "username": "...", "credential": "..."}} (object or array).
 * Returns { urls, username, credential } with urls space-separated, or null when it is not such JSON.
 */
export function parseTurnJson(text) {
  try {
    const data = JSON.parse(text);
    const servers = [data.iceServers ?? data].flat();
    const turn = servers.find((s) => [s.urls].flat().some((u) => /^turns?:/.test(u)));
    if (!turn?.username) return null;
    return { urls: [turn.urls].flat().filter((u) => /^turns?:/.test(u)).join(" "), username: turn.username, credential: turn.credential };
  } catch {
    return null;
  }
}

/** Several TURN URLs may be given, separated by spaces or commas. */
export const turnUrls = (text) => text.split(/[\s,]+/).filter(Boolean);
