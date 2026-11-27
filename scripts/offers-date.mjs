// Build src/data/offers-updated.json: when the offers were last updated, read from the git history.
// The "update offers" workflow commits "Met à jour les offres (date)"; null when the history has none.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

let updated = null;
try {
  updated = execFileSync("git", ["log", "-1", "--format=%cI", "--grep=^Met à jour les offres"], { encoding: "utf8" }).trim() || null;
} catch { /* no git history (shallow or missing clone) */ }

mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });
writeFileSync(new URL("../src/data/offers-updated.json", import.meta.url), JSON.stringify({ updated }, null, 2) + "\n");
console.log(`Dernière mise à jour des offres : ${updated ?? "inconnue"}`);
