<script setup>
import AppIcon from "./AppIcon.vue";

/** A square icon action: a <button>, or a link when `href` is set. */
defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  label: { type: String, required: true },
  href: { type: String, default: null },
});
defineEmits(["click"]);
</script>

<template>
  <a v-if="href" class="ico" :href="href" target="_blank" rel="noopener" :title="title" :aria-label="label">
    <AppIcon :name="icon" />
  </a>
  <button v-else type="button" class="ico" :title="title" :aria-label="label" @click.stop="$emit('click')">
    <AppIcon :name="icon" />
  </button>
</template>
