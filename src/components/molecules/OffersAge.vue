<script setup>
import { computed } from "vue";
import { offersAge, formatDateTime } from "../../domain/age.js";
import { t } from "../../i18n/index.js";

/** How old the offers are, e.g. « offres de 3 jours »; the full date is in the tooltip. */
const props = defineProps({
  since: { type: String, required: true },
  now: { type: Number, default: () => Date.now() },
});
const age = computed(() => offersAge(props.since, props.now));
</script>

<template>
  <time :datetime="since"><abbr :title="t('offers-age-title', formatDateTime(since))">{{ t(`offers-age-${age.unit}`, age.n) }}</abbr></time>
</template>
