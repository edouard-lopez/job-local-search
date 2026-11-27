/** owner/repo, read from the GitHub Pages URL, with a default for local runs. */
const repo = () =>
  location.hostname.endsWith("github.io")
    ? `${location.hostname.split(".")[0]}/${location.pathname.split("/")[1]}`
    : "edouard-lopez/job-local-search";

export const repoUrl = () => `https://github.com/${repo()}`;

export const workflowUrl = (file) => `https://github.com/${repo()}/actions/workflows/${file}`;

export const runsUrl = (file) => `${workflowUrl(file)}?query=event%3Aworkflow_dispatch`;

/** A random id that tells our run apart from any other manual run of the same workflow. */
export const newRunId = () => crypto.randomUUID().replaceAll("-", "").slice(0, 12);

/**
 * Start a workflow on main. The token needs "Actions: write" on this repository.
 * `runId` goes to the workflow's `nonce` input, which names the run (see run-name in the workflow).
 */
export async function dispatchWorkflow(token, file, runId) {
  const res = await fetch(`https://api.github.com/repos/${repo()}/actions/workflows/${file}/dispatches`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    body: JSON.stringify({ ref: "main", inputs: { nonce: runId } }),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
}

/**
 * The run we started: the manual run whose title carries `runId`, or null while GitHub has not listed it.
 * Matching on the id avoids picking up another manual run of the same workflow.
 */
export async function findDispatchRun(token, file, runId) {
  const res = await fetch(`https://api.github.com/repos/${repo()}/actions/workflows/${file}/runs?event=workflow_dispatch&per_page=20`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const { workflow_runs: runs = [] } = await res.json();
  return runs.find((r) => (r.display_title ?? r.name ?? "").includes(runId)) ?? null;
}
