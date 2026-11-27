<script setup>
import AppIcon from "../atoms/AppIcon.vue";
import { t } from "../../i18n/index.js";

/** « Chercher des offres »: a button, then « en cours », then a green ✔ once the search is over. */
defineProps({ phase: { type: String, default: "idle" } }); // idle | running | done
defineEmits(["click"]);
</script>

<template>
  <span v-if="phase === 'done'" role="status" :title="t('update-offers-done-hint')" data-testid="update-done"
    class="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
    <AppIcon name="check" /><span class="sr-only">{{ t("update-offers-done") }}. {{ t("update-offers-done-hint") }}</span>
  </span>
  <span v-else-if="phase === 'running'" role="status" data-testid="update-running" class="inline-flex items-center gap-1">
    <AppIcon name="refresh" class="animate-spin motion-reduce:animate-none" />{{ t("update-offers-running") }}
  </span>
  <button v-else type="button" :title="t('update-offers-hint')" data-testid="update-offers" @click="$emit('click')"
    class="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 ring-1 ring-inset ring-gray-300 hover:ring-gray-500 dark:ring-gray-700">
    <AppIcon name="refresh" />{{ t("update-offers") }}
  </button>
</template>
