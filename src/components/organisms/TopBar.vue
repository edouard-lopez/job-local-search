<script setup>
import AppIcon from "../atoms/AppIcon.vue";
import { workflowUrl } from "../../domain/github.js";
import { t } from "../../i18n/index.js";
</script>

<template>
  <header class="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
    <div class="min-w-0">
      <h1 class="text-lg font-semibold">{{ t("app-title") }}</h1>
      <p class="text-xs text-gray-500">{{ t("app-subtitle") }}</p>
    </div>
    <a :href="workflowUrl('update-offers.yml')" target="_blank" rel="noopener" :title="t('update-offers-hint')"
      class="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-500 dark:ring-gray-700">
      <AppIcon name="refresh" />
      <span class="sr-only sm:not-sr-only">{{ t("update-offers") }}</span>
      <span class="sr-only">{{ t("opens-github") }}</span>
    </a>
  </header>
</template>
