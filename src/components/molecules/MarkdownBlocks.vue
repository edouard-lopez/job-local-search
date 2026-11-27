<script setup>
import { computed } from "vue";
import InlineText from "../atoms/InlineText.vue";
import { parseBlocks } from "../../domain/markdown.js";

/** Paragraphs and bullet lists from a small Markdown source. */
const props = defineProps({ source: { type: String, required: true } });
const blocks = computed(() => parseBlocks(props.source));
</script>

<template>
  <div class="space-y-2">
    <template v-for="(b, i) in blocks" :key="i">
      <ul v-if="b.type === 'list'" class="list-disc space-y-1.5 pl-4">
        <li v-for="(item, j) in b.items" :key="j"><InlineText :text="item" /></li>
      </ul>
      <p v-else><InlineText :text="b.text" /></p>
    </template>
  </div>
</template>
