/** owner/repo, read from the GitHub Pages URL, with a default for local runs. */
const repo = () =>
  location.hostname.endsWith("github.io")
    ? `${location.hostname.split(".")[0]}/${location.pathname.split("/")[1]}`
    : "edouard-lopez/job-local-search";

export const repoUrl = () => `https://github.com/${repo()}`;

export const workflowUrl = (file) => `https://github.com/${repo()}/actions/workflows/${file}`;
