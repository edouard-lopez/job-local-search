<script setup>
import AppIcon from "../atoms/AppIcon.vue";
import MetricItem from "../atoms/MetricItem.vue";
import { formatSalary, isGoodSalary } from "../../domain/salary.js";
import { GOOD_SCORE, GOOD_TRIP_MIN } from "../../domain/thresholds.js";
import { t } from "../../i18n/index.js";

defineProps({ offer: { type: Object, required: true } });
</script>

<template>
  <ul class="my-1.5 flex flex-wrap items-center gap-x-3 text-[12.5px]">
    <MetricItem icon="braces" :label="t('score-tech')" :value="`${offer.score_techno}/5`" :good="offer.score_techno >= GOOD_SCORE" />
    <MetricItem icon="heart-handshake" :label="t('score-libre')" :value="`${offer.score_libre}/5`" :good="offer.score_libre >= GOOD_SCORE" />
    <MetricItem v-if="offer.salaire" icon="coins" :label="t('salary')" :value="formatSalary(offer.salaire)"
      :abbr="offer.salaire.brut ? t('salary-gross') : t('salary-not-gross')" :good="isGoodSalary(offer.salaire)">
      <AppIcon v-if="!offer.salaire.brut" name="message-square-exclamation-point" class="text-amber-600" />
    </MetricItem>
    <MetricItem icon="bike" :label="t('travel-bike')" :value="`~${offer.velo_min} min`" :good="offer.velo_min < GOOD_TRIP_MIN" />
    <MetricItem icon="car" :label="t('travel-car')" :value="`~${offer.voiture_min} min`" :good="offer.voiture_min < GOOD_TRIP_MIN" />
    <MetricItem icon="ruler" :label="t('travel-distance')" :value="`${offer.distance_km} km`" />
  </ul>
</template>
