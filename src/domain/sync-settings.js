/** Sync settings: the GitHub token, the Gist id, and optional Nostr relays and TURN server. */

export const NO_SETTINGS = Object.freeze({ token: "", gistId: "" });

/** Settings from their saved JSON text; no settings when the text is missing or broken. */
export function parseSettings(text) {
  try { return JSON.parse(text) ?? NO_SETTINGS; } catch { return NO_SETTINGS; }
}

/** Sync runs only with both a token and a Gist id. */
export const isEnabled = (settings) => Boolean(settings.token && settings.gistId);

/** The settings with new relays (trimmed, empty ones dropped) and TURN server. */
export const withNetwork = (settings, { relays, turn }) => ({
  ...settings,
  relays: relays.map((url) => url.trim()).filter(Boolean),
  turn,
});
