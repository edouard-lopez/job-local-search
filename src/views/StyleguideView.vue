<script setup>
import { ref } from "vue";
import AppIcon from "../components/atoms/AppIcon.vue";
import BaseChip from "../components/atoms/BaseChip.vue";
import IconButton from "../components/atoms/IconButton.vue";
import StatusMark from "../components/atoms/StatusMark.vue";
import MetricItem from "../components/atoms/MetricItem.vue";
import TechTag from "../components/atoms/TechTag.vue";
import FilterGroup from "../components/molecules/FilterGroup.vue";
import OfferMetrics from "../components/molecules/OfferMetrics.vue";
import TechList from "../components/molecules/TechList.vue";
import PeerList from "../components/molecules/PeerList.vue";
import SyncDiagnostic from "../components/molecules/SyncDiagnostic.vue";
import SyncMenu from "../components/organisms/SyncMenu.vue";
import OfferCard from "../components/organisms/OfferCard.vue";
import { ICONS } from "../components/atoms/icons.js";
import { isKnown } from "../domain/technos.js";
import { t } from "../i18n/index.js";

// Sample data: one offer shown in every state, so each component is visible here.
const sample = {
  id: 0, poste: "Ingénieur DevOps", entite: "Exemple de Société Coopérative du Numérique", commune: "Bayonne",
  secteur: "privé", contrat: "CDI", publie: "2026-11-20", lien: "#", score_techno: 4, score_libre: 2, salaire: "38-45 k€ brut/an",
  velo_min: 25, voiture_min: 31, distance_km: 18.4, technos: ["Kubernetes", "Ansible", "Docker", "Rust"],
  mission: "Exemple de mission, pour montrer le texte déplié.", email: "", telephone: "",
};
const selected = ref(["Docker"]);
const toggle = (v) => (selected.value = selected.value.includes(v) ? selected.value.filter((x) => x !== v) : [...selected.value, v]);
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-8 overflow-auto px-4 py-6">
    <h2 class="text-xl font-semibold">{{ t("styleguide-title") }}</h2>

    <section class="space-y-3">
      <h3 class="font-semibold">Atomes</h3>
      <div class="flex flex-wrap gap-3 text-gray-700 dark:text-gray-300">
        <span v-for="name in Object.keys(ICONS)" :key="name" class="inline-flex items-center gap-1 text-xs"><AppIcon :name="name" />{{ name }}</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <BaseChip label="Docker" :count="3" />
        <BaseChip label="Rust" :count="1" :known="false" />
        <BaseChip label="CDI" :count="10" pressed />
      </div>
      <ul class="flex gap-1"><TechTag name="Kubernetes" /><TechTag name="Rust" /></ul>
      <div class="flex gap-2">
        <IconButton icon="star" title="Marquer À creuser" label="Exemple : marquer À creuser" />
        <IconButton icon="pen" title="Générer un CV" label="Exemple : générer un CV" href="#" />
        <IconButton icon="x" title="Marquer comme exclue" label="Exemple : exclure" />
      </div>
      <p class="text-sm">Synchronisation<StatusMark state="ok" /> · Diagnostic<StatusMark state="ko" /> · Réseau<StatusMark /></p>
      <ul class="flex gap-3"><MetricItem icon="braces" label="Score techno" value="4/5" good /><MetricItem icon="car" label="Voiture" value="~31 min" /></ul>
    </section>

    <section class="space-y-3">
      <h3 class="font-semibold">Molécules</h3>
      <FilterGroup title="Technos" label="Exemple de filtre" :counts="{ Docker: 3, Kubernetes: 2, Rust: 1 }"
        :order="['Docker', 'Kubernetes', 'Rust']" :selected="selected" :is-known="isKnown" @toggle="toggle" />
      <OfferMetrics :offer="sample" />
      <TechList :technos="sample.technos" />
      <PeerList :peers="[{ id: 1, device: 'Linux · Firefox', self: true }, { id: 2, device: 'Android · Firefox' }, { id: 3, device: 'macOS · Safari' }]" />
      <SyncDiagnostic :diag="{ webrtc: true, servers: [{ url: 'wss://relay.exemple.org', ok: true }, { url: 'wss://nos.exemple.net', ok: false }], room: true, links: 1, turn: false, error: 'could not connect to peer after exchanging SDP' }" />
    </section>

    <section class="space-y-3">
      <h3 class="font-semibold">Organismes : menu des pairs</h3>
      <div class="flex justify-end"><SyncMenu /></div>
    </section>

    <section class="space-y-3">
      <h3 class="font-semibold">Organismes : carte d'offre</h3>
      <OfferCard :offer="sample" />
      <OfferCard :offer="sample" status="dig" route-text="Vélo : 18.4 km, ~55 min (20 km/h) · Voiture : 19.1 km, ~24 min" focused />
      <OfferCard :offer="sample" status="out" />
    </section>
  </div>
</template>
