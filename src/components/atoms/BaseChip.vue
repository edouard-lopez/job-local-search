<script setup>
defineProps({
  label: { type: String, required: true },
  count: { type: Number, required: true },
  pressed: { type: Boolean, default: false },
  known: { type: Boolean, default: true },
  ariaLabel: { type: String, default: null },
});
defineEmits(["toggle"]);
</script>

<template>
  <button type="button" class="chip" :class="known ? 'known' : 'unknown'" :aria-pressed="String(pressed)"
    :aria-label="ariaLabel" @click="$emit('toggle')">
    {{ label }} ({{ count }})
  </button>
</template>
