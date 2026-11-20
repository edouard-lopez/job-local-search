// Persist the shared Yjs state in a secret GitHub Gist, as a base64 update.
const API = "https://api.github.com/gists";
export const GIST_FILE = "job-local-search-triage.yjs";

const headers = (token) => ({ Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" });
export const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
export const fromBase64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

async function call(url, token, init = {}) {
  const res = await fetch(url, { ...init, headers: { ...headers(token), ...init.headers } });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
}

/** The stored update, or null when the Gist has no state yet. */
export async function readGist(token, id) {
  const gist = await call(`${API}/${id}`, token);
  const content = gist.files?.[GIST_FILE]?.content?.trim();
  return content ? fromBase64(content) : null;
}

export function writeGist(token, id, update) {
  return call(`${API}/${id}`, token, { method: "PATCH", body: JSON.stringify({ files: { [GIST_FILE]: { content: toBase64(update) } } }) });
}

/** Create a secret Gist holding the update; returns its id. */
export async function createGist(token, update) {
  const gist = await call(API, token, { method: "POST", body: JSON.stringify({
    description: "job-local-search : tri partagé entre appareils", public: false,
    files: { [GIST_FILE]: { content: toBase64(update) } } }) });
  return gist.id;
}
