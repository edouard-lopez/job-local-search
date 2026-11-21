<script setup>
import SyncMenu from "./SyncMenu.vue";
import UpdateOffersButton from "./UpdateOffersButton.vue";
import { t } from "../../i18n/index.js";
</script>

<template>
  <header class="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
    <div class="min-w-0">
      <h1 class="text-lg font-semibold">{{ t("app-title") }}</h1>
      <p class="text-xs text-gray-500">{{ t("app-subtitle") }}</p>
    </div>
    <div class="flex shrink-0 items-center gap-2">
    <SyncMenu />
    <UpdateOffersButton />
    </div>
  </header>
</template>
