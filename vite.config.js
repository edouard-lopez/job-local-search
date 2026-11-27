import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

/** E2E_DATA=1 builds with a frozen copy of the offers, so the tests do not depend on each search run. */
const e2eOffers = fileURLToPath(new URL("./tests/e2e/data/offres.json", import.meta.url));
const alias = process.env.E2E_DATA ? [{ find: /^.*\/data\/offres\.json$/, replacement: e2eOffers }] : [];

// Relative base: the site is served from /job-local-search/ on GitHub Pages.
export default defineConfig({ base: "./", plugins: [vue()], resolve: { alias } });
