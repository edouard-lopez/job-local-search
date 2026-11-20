/** Keep the first words of a long name; `full` is false when nothing was cut. */
export function shorten(name, maxWords = 3) {
  const words = name.split(/\s+/);
  return words.length > maxWords ? { text: `${words.slice(0, maxWords).join(" ")}…`, full: name } : { text: name, full: false };
}
