<script setup>
import { computed } from "vue";
import OfferCard from "./OfferCard.vue";
import { useOffersStore } from "../../stores/offers.js";
import { useTriageStore } from "../../stores/triage.js";
import { useRouteStore } from "../../stores/route.js";
import { TRIAGE_GROUPS, groupOf } from "../../domain/triage.js";
import { t } from "../../i18n/index.js";

const offers = useOffersStore();
const triage = useTriageStore();
const route = useRouteStore();

/** Visible offers split by triage group, in TRIAGE_GROUPS order; empty groups are hidden. */
const groups = computed(() =>
  TRIAGE_GROUPS.map((id) => ({ id, offers: offers.visible.filter((o) => groupOf(triage.statusOf(o)) === id) }))
    .filter((g) => g.offers.length));

const routeText = computed(() => {
  if (route.status === "loading") return t("route-loading");
  if (route.status === "failed") return t("route-failed");
  if (route.status !== "ready") return "";
  return route.routes.map(({ mode, km, minutes }) => {
    const bike = mode === "bike";
    return t("route-result", t(bike ? "travel-bike" : "travel-car"), km.toFixed(1), Math.round(minutes), bike ? t("route-bike-speed") : "");
  }).join(" · ");
});
</script>

<template>
  <div class="my-2 text-gray-500" role="status" aria-live="polite">{{ t("visible-count", offers.visible.length) }}</div>
  <h2 class="sr-only">{{ t("offers-heading") }}</h2>
  <section v-for="g in groups" :key="g.id" :aria-labelledby="`group-${g.id}`" class="mb-3">
    <h3 :id="`group-${g.id}`" class="my-2 flex w-full items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
      <span class="h-px flex-1 bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
      {{ t(`group-${g.id}`) }} ({{ g.offers.length }})
      <span class="h-px flex-1 bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
    </h3>
    <ul class="flex flex-col gap-2.5">
      <li v-for="offer in g.offers" :key="offer.id">
        <OfferCard :offer="offer" :status="triage.statusOf(offer)" :focused="route.offerId === offer.id"
          :route-text="route.offerId === offer.id ? routeText : ''"
          @dig="triage.dig(offer)" @cross="triage.cross(offer)" @focus="route.focus(offer)" />
      </li>
    </ul>
  </section>
</template>
