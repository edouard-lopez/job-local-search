<script setup>
import { t } from "../../i18n/index.js";
</script>

<template>
  <footer class="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-4 py-2 text-xs text-gray-500 dark:border-gray-800">
    <span>{{ t("footer-source") }}</span>
    <nav class="flex gap-3" aria-label="Pied de page">
      <RouterLink to="/" class="hover:underline">{{ t("nav-home") }}</RouterLink>
      <RouterLink to="/styleguide" class="hover:underline">{{ t("nav-styleguide") }}</RouterLink>
      <RouterLink to="/changelog" class="hover:underline">{{ t("nav-changelog") }}</RouterLink>
    </nav>
  </footer>
</template>
