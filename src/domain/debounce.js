/** Run `fn` once, `ms` after the last `schedule()` call. */
export function debounce(fn, ms) {
  let timer = null;
  return {
    schedule() { clearTimeout(timer); timer = setTimeout(fn, ms); },
    cancel() { clearTimeout(timer); timer = null; },
  };
}
