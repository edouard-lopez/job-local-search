/** Browser storage that never throws: private windows and blocked site data make it fail. */

/** The stored text, or null when absent or unavailable. */
export function readStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

/** Store `value`; a null or empty value removes the key. Does nothing when storage is unavailable. */
export function writeStorage(key, value) {
  try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch { /* storage unavailable */ }
}
