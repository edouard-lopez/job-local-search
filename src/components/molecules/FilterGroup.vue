<script setup>
import BaseChip from "../atoms/BaseChip.vue";
import { t } from "../../i18n/index.js";

/** A titled group of toggle chips. `isKnown` (optional) colours each chip and adds it to its label. */
const props = defineProps({
  title: { type: String, required: true },
  label: { type: String, required: true },
  counts: { type: Object, required: true },
  order: { type: Array, required: true },
  selected: { type: Array, required: true },
  isKnown: { type: Function, default: null },
});
defineEmits(["toggle"]);

const ariaLabel = (value) => {
  const base = t("chip-label", value, props.counts[value]);
  if (!props.isKnown) return base;
  return `${base}, ${props.isKnown(value) ? t("tech-known") : t("tech-unknown")}`;
};
</script>

<template>
  <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ title }}</h2>
  <div class="flex flex-wrap gap-1.5" role="group" :aria-label="label">
    <BaseChip v-for="value in order" :key="value" :label="value" :count="counts[value]" :pressed="selected.includes(value)"
      :known="isKnown ? isKnown(value) : true" :aria-label="ariaLabel(value)" @toggle="$emit('toggle', value)" />
  </div>
</template>
