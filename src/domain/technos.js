import knownList from "../../data/known-technos.json";

const KNOWN = new Set(knownList.map((t) => t.toLowerCase()));

/** A techno is known when it, or one part of "A/B", is in SEARCH-CRITERIA.md. */
export const isKnown = (tech) =>
  KNOWN.has(tech.toLowerCase()) || tech.split("/").some((part) => KNOWN.has(part.trim().toLowerCase()));

const byFrench = (a, b) => a.localeCompare(b, "fr", { sensitivity: "base" });

/** Known technos first, then unknown ones, each group sorted A to Z. */
export const sortTechnos = (technos) => [...technos].sort((a, b) => isKnown(b) - isKnown(a) || byFrench(a, b));
