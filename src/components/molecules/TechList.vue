<script setup>
import { computed } from "vue";
import TechTag from "../atoms/TechTag.vue";
import { sortTechnos } from "../../domain/technos.js";
import { t } from "../../i18n/index.js";

const props = defineProps({ technos: { type: Array, required: true } });
const sorted = computed(() => sortTechnos(props.technos));
</script>

<template>
  <h4 class="sr-only">{{ t("offer-technos") }}</h4>
  <ul class="mt-1.5 flex flex-wrap gap-1 pr-10">
    <TechTag v-for="name in sorted" :key="name" :name="name" />
  </ul>
</template>
