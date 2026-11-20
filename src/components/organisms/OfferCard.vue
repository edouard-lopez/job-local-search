<script setup>
import { computed } from "vue";
import IconButton from "../atoms/IconButton.vue";
import OfferMetrics from "../molecules/OfferMetrics.vue";
import TechList from "../molecules/TechList.vue";
import { shorten } from "../../domain/text.js";
import { workflowUrl } from "../../domain/github.js";
import { t } from "../../i18n/index.js";

const props = defineProps({
  offer: { type: Object, required: true },
  /** null, "dig" (À creuser) or "out" (exclue). */
  status: { type: String, default: null },
  focused: { type: Boolean, default: false },
  /** Text shown under the card once a route is asked for. */
  routeText: { type: String, default: "" },
});
const emit = defineEmits(["dig", "cross", "focus"]);

const dig = computed(() => props.status === "dig");
const out = computed(() => props.status === "out");
const company = computed(() => shorten(props.offer.entite));
const statusPrefix = computed(() => (dig.value ? `${t("offer-status-dig")}. ` : out.value ? `${t("offer-status-out")}. ` : ""));
const label = computed(() => t("offer-label", statusPrefix.value, props.offer.poste, props.offer.entite, props.offer.commune));

/** Click anywhere but on a control: show the route. */
function onClick(event) {
  if (!event.target.closest("a,button,summary,abbr")) emit("focus");
}
function onKey(event) {
  if (event.target === event.currentTarget) { event.preventDefault(); emit("focus"); }
}
</script>

<template>
  <article tabindex="0" :aria-label="label" :data-id="offer.id"
    class="relative cursor-pointer rounded-lg px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
    :class="{ 'border-2 border-emerald-600 dark:border-emerald-500': dig, 'border border-gray-200 dark:border-gray-800': !dig, 'py-1.5 opacity-50': out, 'ring-2 ring-emerald-600': focused }"
    @click="onClick" @keydown.enter="onKey" @keydown.space="onKey">
    <div class="flex items-start gap-2">
      <div class="min-w-0 flex-1">
        <h3 class="text-[15px] font-semibold leading-snug">
          <template v-if="dig"><span class="text-blue-600" aria-hidden="true">★</span><span class="sr-only">{{ t("offer-status-dig") }} : </span>{{ " " }}</template>
          <span v-if="out" class="sr-only">{{ t("offer-status-out") }} : </span>
          <a :href="offer.lien" target="_blank" rel="noopener"
            class="text-emerald-800 underline decoration-emerald-600/60 decoration-2 underline-offset-2 hover:text-emerald-600 hover:decoration-emerald-600 dark:text-emerald-300">
            {{ offer.poste }}<span class="sr-only">{{ t("offer-ad-new-tab") }}</span></a>
          {{ " " }}
          <span class="whitespace-nowrap text-xs font-normal text-gray-500">
            <span aria-hidden="true">· </span><span class="sr-only">{{ t("offer-published") }}</span><time :datetime="offer.publie">{{ offer.publie }}</time>
          </span>
        </h3>
        <div class="text-[12.5px] text-gray-500">
          <template v-if="company.full"><abbr class="cursor-help" :title="company.full" aria-hidden="true">{{ company.text }}</abbr><span class="sr-only">{{ company.full }}</span></template>
          <template v-else>{{ company.text }}</template>
          · {{ offer.commune }} · {{ offer.secteur }} · <b class="text-gray-700 dark:text-gray-300">{{ offer.contrat }}</b>
        </div>
      </div>
      <div class="shrink-0">
        <IconButton v-if="dig" icon="pen" :href="workflowUrl('generate-application.yml')"
          :title="t('action-cv', offer.id)" :label="t('action-cv-label', offer.poste, offer.id)" />
        <IconButton v-else icon="star" :title="t('action-dig')" :label="t('action-dig-label', offer.poste)" @click="emit('dig')" />
      </div>
    </div>
    <template v-if="!out">
      <OfferMetrics :offer="offer" />
      <details>
        <summary class="cursor-pointer text-emerald-700 dark:text-emerald-400">{{ t("offer-mission") }}</summary>
        <p class="mt-1">{{ offer.mission }}</p>
      </details>
      <TechList :technos="offer.technos" />
      <div v-if="offer.email || offer.telephone" class="mt-1.5 text-[12.5px] text-gray-500">
        {{ [offer.email, offer.telephone].filter(Boolean).join(" · ") }}
      </div>
      <div class="mt-1.5 pr-10 text-[12.5px] text-emerald-700 dark:text-emerald-400" role="status" aria-live="polite" :hidden="!routeText">{{ routeText }}</div>
      <IconButton class="absolute bottom-2 right-2" icon="x" :title="dig ? t('action-undig') : t('action-exclude')"
        :label="`${dig ? t('action-undig') : t('action-exclude')} : « ${offer.poste} »`" @click="emit('cross')" />
    </template>
  </article>
</template>
