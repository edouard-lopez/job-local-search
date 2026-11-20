<script setup>
import MetricItem from "../atoms/MetricItem.vue";
import { GOOD_SCORE, GOOD_TRIP_MIN } from "../../domain/geo.js";
import { t } from "../../i18n/index.js";

defineProps({ offer: { type: Object, required: true } });
</script>

<template>
  <ul class="my-1.5 flex flex-wrap items-center gap-x-3 text-[12.5px]">
    <MetricItem icon="braces" :label="t('score-tech')" :value="`${offer.score_techno}/5`" :good="offer.score_techno >= GOOD_SCORE" />
    <MetricItem icon="heart-handshake" :label="t('score-libre')" :value="`${offer.score_libre}/5`" :good="offer.score_libre >= GOOD_SCORE" />
    <MetricItem icon="bike" :label="t('travel-bike')" :value="`~${offer.velo_min} min`" :good="offer.velo_min < GOOD_TRIP_MIN" />
    <MetricItem icon="car" :label="t('travel-car')" :value="`~${offer.voiture_min} min`" :good="offer.voiture_min < GOOD_TRIP_MIN" />
    <MetricItem icon="ruler" :label="t('travel-distance')" :value="`${offer.distance_km} km`" />
  </ul>
</template>
