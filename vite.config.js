import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Relative base: the site is served from /job-local-search/ on GitHub Pages.
export default defineConfig({ base: "./", plugins: [vue()] });
