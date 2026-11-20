<script setup>
import OfferMap from "../components/organisms/OfferMap.vue";
import OfferFilters from "../components/organisms/OfferFilters.vue";
import OfferList from "../components/organisms/OfferList.vue";
</script>

<template>
  <div class="grid md:h-full md:grid-cols-[minmax(320px,42%)_1fr]">
    <OfferMap />
    <section class="overflow-auto px-4 py-3 md:border-l border-gray-200 dark:border-gray-800">
      <OfferFilters />
      <OfferList />
    </section>
  </div>
</template>
