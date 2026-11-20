<script setup>
import AppIcon from "./AppIcon.vue";

/** One metric with an icon; `good` values are emphasised with <strong>. */
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: String, required: true },
  good: { type: Boolean, default: false },
});
</script>

<template>
  <li class="inline-flex items-center gap-1" :title="label">
    <AppIcon :name="icon" />
    <span class="sr-only">{{ label }} :</span>
    <strong v-if="good" class="good">{{ value }}</strong>
    <span v-else>{{ value }}</span>
  </li>
</template>
