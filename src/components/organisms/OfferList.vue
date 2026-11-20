<script setup>
import { computed } from "vue";
import OfferCard from "./OfferCard.vue";
import { useOffersStore } from "../../stores/offers.js";
import { useTriageStore } from "../../stores/triage.js";
import { useRouteStore } from "../../stores/route.js";
import { t } from "../../i18n/index.js";

const offers = useOffersStore();
const triage = useTriageStore();
const route = useRouteStore();

const routeText = computed(() => {
  if (route.status === "loading") return t("route-loading");
  if (route.status === "failed") return t("route-failed");
  if (route.status !== "ready") return "";
  const { mode, km, minutes } = route.route;
  const bike = mode === "bike";
  return t("route-result", t(bike ? "travel-bike" : "travel-car"), km.toFixed(1), Math.round(minutes), bike ? t("route-bike-speed") : "");
});
</script>

<template>
  <div class="my-2 text-gray-500" role="status" aria-live="polite">{{ t("visible-count", offers.visible.length) }}</div>
  <h2 class="sr-only">{{ t("offers-heading") }}</h2>
  <ul class="flex flex-col gap-2.5">
    <li v-for="offer in offers.visible" :key="offer.id">
      <OfferCard :offer="offer" :status="triage.statusOf(offer)" :focused="route.offerId === offer.id"
        :route-text="route.offerId === offer.id ? routeText : ''"
        @dig="triage.dig(offer)" @cross="triage.cross(offer)" @focus="route.focus(offer)" />
    </li>
  </ul>
</template>
