<script setup>
import { onMounted, onBeforeUnmount, watch } from "vue";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useOffersStore } from "../../stores/offers.js";
import { useRouteStore } from "../../stores/route.js";
import { ORX } from "../../domain/geo.js";
import { t } from "../../i18n/index.js";

// Bundlers break Leaflet's default icon URLs: point them at the bundled files.
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const offers = useOffersStore();
const route = useRouteStore();
let map, markers, routeLayer;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const popup = (o) => `<b>${esc(o.poste)}</b><br>${esc(o.entite)}<br>${esc(o.commune)} · ${esc(o.contrat)}<br><a href="${esc(o.lien)}" target="_blank" rel="noopener">Annonce</a>`;

function publishBounds() {
  const b = map.getBounds();
  offers.setBounds([[b.getSouth(), b.getWest()], [b.getNorth(), b.getEast()]]);
}

function drawMarkers() {
  markers.clearLayers();
  offers.filtered.forEach((o) => L.marker([o.lat, o.lon]).bindPopup(popup(o)).addTo(markers));
}

function drawRoute() {
  routeLayer?.remove();
  routeLayer = null;
  const offer = offers.offers.find((o) => o.id === route.offerId);
  if (route.status === "ready") {
    const bike = route.route.mode === "bike";
    routeLayer = L.geoJSON(route.route.geometry, { style: { color: bike ? "#16a34a" : "#2563eb", weight: 5, opacity: 0.8 } }).addTo(map);
    map.fitBounds(routeLayer.getBounds(), { padding: [30, 30] });
  } else if (route.status === "failed" && offer) {
    map.setView([offer.lat, offer.lon], 13);
  }
}

onMounted(() => {
  map = L.map("map").setView([43.5, -1.3], 9);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© contributeurs OpenStreetMap" }).addTo(map);
  L.circleMarker(ORX, { radius: 8, color: "#c0392b", fillOpacity: 0.9 }).addTo(map).bindTooltip(t("home-tooltip"));
  markers = L.layerGroup().addTo(map);
  drawMarkers();
  map.on("moveend", publishBounds);
  publishBounds();
});
onBeforeUnmount(() => map?.remove());

watch(() => offers.filtered, drawMarkers);
watch(() => [route.status, route.offerId], drawRoute);
</script>

<template>
  <div id="map" class="h-[55vh] md:h-full" role="region" :aria-label="t('map-label')" />
</template>
