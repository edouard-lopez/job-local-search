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
      <div v-if="b.type === 'diff'" class="overflow-hidden rounded border border-gray-200 font-mono text-xs" data-testid="diff">
        <div
          v-for="(l, j) in b.lines"
          :key="j"
          class="flex gap-2 px-2 py-0.5"
          :class="l.sign === '+' ? 'bg-green-100 text-green-900' : l.sign === '-' ? 'bg-red-100 text-red-900' : ''"
          :data-diff="l.sign"
        >
          <span aria-hidden="true" class="select-none">{{ l.sign }}</span>
          <span class="sr-only">{{ l.sign === "+" ? "Ajoutée :" : l.sign === "-" ? "Retirée :" : "" }}</span>
          <InlineText :text="l.text" />
        </div>
      </div>
      <ul v-else-if="b.type === 'list'" class="list-disc space-y-1.5 pl-4">
        <li v-for="(item, j) in b.items" :key="j"><InlineText :text="item" /></li>
      </ul>
      <p v-else><InlineText :text="b.text" /></p>
    </template>
  </div>
</template>
