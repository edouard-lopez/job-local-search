<script setup>
import { computed } from "vue";
import { isKnown } from "../../domain/technos.js";
import { t } from "../../i18n/index.js";

const props = defineProps({ name: { type: String, required: true } });
const known = computed(() => isKnown(props.name));
</script>

<template>
  <li class="tag" :class="known ? 'known' : 'unknown'">
    {{ name }}<span class="sr-only"> ({{ known ? t("tech-known") : t("tech-unknown") }})</span>
  </li>
</template>
