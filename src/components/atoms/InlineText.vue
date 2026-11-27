<script setup>
import { computed } from "vue";
import { parseInline } from "../../domain/markdown.js";
import { t } from "../../i18n/index.js";

/** One line of Markdown (bold, code, https links) rendered as elements, never as raw HTML. */
const props = defineProps({ text: { type: String, required: true } });
const parts = computed(() => parseInline(props.text));
</script>

<template>
  <template v-for="(p, i) in parts" :key="i">
    <a v-if="p.type === 'link'" :href="p.href" target="_blank" rel="noopener" class="underline">{{ p.text }}<span class="sr-only">{{ t("opens-github") }}</span></a>
    <strong v-else-if="p.type === 'strong'">{{ p.text }}</strong>
    <code v-else-if="p.type === 'code'" class="rounded bg-gray-100 px-1 dark:bg-gray-800">{{ p.text }}</code>
    <template v-else>{{ p.text }}</template>
  </template>
</template>
