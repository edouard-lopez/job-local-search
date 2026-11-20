<script setup>
import changelog from "../data/changelog.json";
import { t } from "../i18n/index.js";
</script>

<template>
  <div class="mx-auto max-w-3xl overflow-auto px-4 py-6">
    <h2 class="mb-4 text-xl font-semibold">{{ t("changelog-title") }}</h2>
    <ol class="space-y-4">
      <li v-for="entry in changelog" :key="entry.hash" class="border-l-2 border-emerald-600 pl-3">
        <div class="text-xs text-gray-500"><time :datetime="entry.date">{{ entry.date }}</time> · <code>{{ entry.hash }}</code></div>
        <div class="font-medium">{{ entry.subject }}</div>
        <p v-if="entry.body" class="whitespace-pre-line text-gray-600 dark:text-gray-400">{{ entry.body }}</p>
      </li>
    </ol>
  </div>
</template>
