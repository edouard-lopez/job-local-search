<script setup>
import { computed } from "vue";
import FilterGroup from "../molecules/FilterGroup.vue";
import { useOffersStore } from "../../stores/offers.js";
import { isKnown, sortTechnos } from "../../domain/technos.js";
import { t } from "../../i18n/index.js";

const store = useOffersStore();
const contractOrder = computed(() => Object.keys(store.contractCounts).sort());
const technoOrder = computed(() => sortTechnos(Object.keys(store.technoCounts)));
</script>

<template>
  <div class="mb-3 flex flex-col gap-2">
    <FilterGroup :title="t('filter-contract')" :label="t('filter-contract-label')" :counts="store.contractCounts"
      :order="contractOrder" :selected="store.contracts" @toggle="store.toggleContract" />
    <FilterGroup :title="t('filter-tech')" :label="t('filter-tech-label')" :counts="store.technoCounts"
      :order="technoOrder" :selected="store.technos" :is-known="isKnown" @toggle="store.toggleTechno" />
    <label class="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
      <input v-model="store.hideLasseube" type="checkbox"> {{ t("filter-hide-lasseube") }}
    </label>
  </div>
</template>
