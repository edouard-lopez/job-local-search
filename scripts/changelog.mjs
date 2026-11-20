// Build src/data/changelog.json from the git history (newest first).
// Skips automatic data updates and drops trailer lines (Co-Authored-By, Claude-Session).
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const SEP = "\u001e", END = "\u001f";
const raw = execFileSync("git", ["log", `--pretty=format:%h${SEP}%ad${SEP}%s${SEP}%b${END}`, "--date=short"], { encoding: "utf8" });
const entries = raw.split(END).map((r) => r.trim()).filter(Boolean).map((r) => {
  const [hash, date, subject, body = ""] = r.split(SEP);
  const cleanBody = body.split("\n").filter((l) => !/^(Co-Authored-By|Claude-Session):/i.test(l)).join("\n").trim();
  return { hash, date, subject, body: cleanBody };
}).filter((e) => !/^Met à jour les offres/.test(e.subject) && e.subject !== "wip");

writeFileSync(new URL("../src/data/changelog.json", import.meta.url), JSON.stringify(entries, null, 2) + "\n");
console.log(`${entries.length} entrées écrites dans src/data/changelog.json`);
