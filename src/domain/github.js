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
