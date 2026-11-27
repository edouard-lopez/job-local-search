<script setup>
import { computed, ref, useId } from "vue";
import raw from "../../../data/mises-a-jour.md?raw";
import AppIcon from "../atoms/AppIcon.vue";
import MarkdownBlocks from "../molecules/MarkdownBlocks.vue";
import { fingerprint, parseUpdates } from "../../domain/markdown.js";
import { readStorage, writeStorage } from "../../domain/storage.js";
import { repoUrl } from "../../domain/github.js";
import { t } from "../../i18n/index.js";

/** Top-bar bell: shows the latest « Mise à jour du … » section of data/mises-a-jour.md; a dot marks one not yet read. */
const latest = parseUpdates(raw)[0] ?? null;
const stamp = latest ? `${latest.title}#${fingerprint(latest.body)}` : "";
const KEY = "seen-update";
const read = () => readStorage(KEY) ?? "";
const write = (v) => writeStorage(KEY, v);

const uid = useId();
const open = ref(false);
const seen = ref(read());
const unread = computed(() => Boolean(latest) && seen.value !== stamp);
function toggle() {
  open.value = !open.value;
  if (open.value) { seen.value = stamp; write(stamp); }
}
const historyUrl = `${repoUrl()}/blob/main/data/mises-a-jour.md`;
</script>

<template>
  <div v-if="latest" class="relative" @keydown.esc="open = false">
    <button type="button" :aria-expanded="open" :aria-controls="`${uid}-panel`" :aria-label="unread ? t('bell-unread') : t('bell-button')"
      :title="t('bell-button')" data-testid="bell" @click="toggle"
      class="relative inline-flex items-center rounded-md px-3 py-1.5 text-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-500 dark:ring-gray-700">
      <AppIcon name="bell" />
      <span v-if="unread" aria-hidden="true" data-testid="bell-dot" class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600" />
    </button>
    <div v-if="open" :id="`${uid}-panel`" role="dialog" :aria-label="latest.title"
      class="absolute right-0 z-[1000] mt-2 max-h-[70vh] w-96 max-w-[calc(100vw-2rem)] space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-xs shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <h2 class="text-sm font-semibold">{{ latest.title }}</h2>
      <MarkdownBlocks :source="latest.body" />
      <a :href="historyUrl" target="_blank" rel="noopener" class="inline-block underline">{{ t("bell-history") }}<span class="sr-only">{{ t("opens-github") }}</span></a>
    </div>
  </div>
</template>
