<script setup>
import AppIcon from "./AppIcon.vue";

/** One metric with an icon; `good` values are emphasised with <strong>; the slot adds a mark after the value. */
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: String, required: true },
  good: { type: Boolean, default: false },
  /** Tooltip that explains the value, e.g. its unit. */
  abbr: { type: String, default: "" },
});
</script>

<template>
  <li class="inline-flex items-center gap-1" :title="label">
    <AppIcon :name="icon" />
    <span class="sr-only">{{ label }} :</span>
    <component :is="good ? 'strong' : 'span'" :class="{ good }">
      <abbr v-if="abbr" :title="abbr">{{ value }}</abbr><template v-else>{{ value }}</template>
    </component>
    <slot />
  </li>
</template>
