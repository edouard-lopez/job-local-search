<script setup>
import { ICONS } from "./icons.js";

defineProps({ name: { type: String, required: true } });
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- static, trusted SVG paths -->
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="ICONS[name]" />
</template>
