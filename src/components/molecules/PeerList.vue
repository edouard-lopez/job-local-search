<script setup>
import { t } from "../../i18n/index.js";

/** Devices sharing the triage right now; the current one is marked. */
defineProps({ peers: { type: Array, required: true } });
</script>

<template>
  <ul class="space-y-1 text-sm" :aria-label="t('peers-title')">
    <li v-for="p in peers" :key="p.id" class="flex items-center gap-2">
      <span class="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
      {{ p.device }}<span v-if="p.self" class="text-gray-500"> ({{ t("peers-self") }})</span>
    </li>
    <li v-if="peers.every((p) => p.self)" class="text-gray-500">{{ t("peers-none") }}</li>
  </ul>
</template>
