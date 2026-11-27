/** Run `fn` every `ms` while the page is visible, and right away when it becomes visible again. Returns a stop function. */
export function whileVisible(fn, ms) {
  const runIfVisible = () => { if (!document.hidden) fn(); };
  const timer = setInterval(runIfVisible, ms);
  document.addEventListener("visibilitychange", runIfVisible);
  return () => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", runIfVisible);
  };
}
