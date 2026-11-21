---
name: commit
description: Commit changes in this repo and write commit messages that feed the in-app changelog (ChangelogView.vue, generated at build time). Use for every commit in job-local-search.
---

# Commit with changelog

1. Run the end-to-end tests: `npm run test:e2e`. Stop if one fails: the tests guard every feature between iterations.
2. If a component changed, check that `src/views/StyleguideView.vue` still shows it, and update it.
3. Stage the change and commit it. Write the message in French:
   - subject: one line, imperative verb, under 72 characters (« Ajoute… », « Corrige… »);
   - body: what changed for the user, one idea per line.
4. Do not commit `src/data/changelog.json`: `npm run build` and `npm run dev` generate it from the git log.
5. Do not push. Show the user what changed (a screenshot for visual changes) and wait for their go-ahead.
