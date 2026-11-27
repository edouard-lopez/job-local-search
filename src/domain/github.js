/** owner/repo, read from the GitHub Pages URL, with a default for local runs. */
const repo = () =>
  location.hostname.endsWith("github.io")
    ? `${location.hostname.split(".")[0]}/${location.pathname.split("/")[1]}`
    : "edouard-lopez/job-local-search";

export const repoUrl = () => `https://github.com/${repo()}`;

export const workflowUrl = (file) => `https://github.com/${repo()}/actions/workflows/${file}`;

export const runsUrl = (file) => `${workflowUrl(file)}?query=event%3Aworkflow_dispatch`;

/** Start a workflow on main. The token needs "Actions: write" on this repository. */
export async function dispatchWorkflow(token, file) {
  const res = await fetch(`https://api.github.com/repos/${repo()}/actions/workflows/${file}/dispatches`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    body: JSON.stringify({ ref: "main" }),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
}

/**
 * The most recent manual run of a workflow started at or after `since` (ms), or null.
 * `since` has a margin because GitHub's clock can differ from this browser's.
 */
export async function findDispatchRun(token, file, since) {
  const res = await fetch(`https://api.github.com/repos/${repo()}/actions/workflows/${file}/runs?event=workflow_dispatch&per_page=5`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const { workflow_runs: runs = [] } = await res.json();
  return runs.find((r) => Date.parse(r.created_at) >= since - 120_000) ?? null;
}
