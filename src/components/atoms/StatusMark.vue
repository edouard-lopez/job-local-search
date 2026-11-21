<script setup>
import AppIcon from "./AppIcon.vue";
import { t } from "../../i18n/index.js";

/** A small status mark after a section title: ok (green check), ko (red cross) or nothing. */
defineProps({ state: { type: String, default: null } });
</script>

<template>
  <span v-if="state" class="ml-1 inline-flex align-middle" :data-state="state">
    <AppIcon :name="state === 'ok' ? 'check' : 'x'" :class="state === 'ok' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'" />
    <span class="sr-only">{{ t(state === "ok" ? "status-ok" : "status-ko") }}</span>
  </span>
</template>
