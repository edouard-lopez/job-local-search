const DAY = 86_400_000;

/** How old the offers are: "today", or a count of days (< 7), weeks (< 30 days) or months. */
export function offersAge(iso, now = Date.now()) {
  const days = Math.max(0, Math.floor((now - new Date(iso).getTime()) / DAY));
  if (days < 1) return { unit: "today", n: 0 };
  if (days < 7) return { unit: "day", n: days };
  if (days < 30) return { unit: "week", n: Math.floor(days / 7) };
  return { unit: "month", n: Math.floor(days / 30) };
}

/** Full local date and time, e.g. « 27 novembre 2026 à 10:41 ». */
export const formatDateTime = (iso) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
