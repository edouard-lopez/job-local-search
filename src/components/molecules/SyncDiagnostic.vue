<script setup>
import { t } from "../../i18n/index.js";

/** Peer-to-peer health: WebRTC support, each signalling server, the room and direct links. */
defineProps({ diag: { type: Object, required: true } });
</script>

<template>
  <ul class="space-y-0.5 text-xs" :aria-label="t('diag-title')">
    <li :class="diag.webrtc ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'">
      {{ diag.webrtc ? "✓" : "✗" }} {{ t(diag.webrtc ? "diag-webrtc-ok" : "diag-webrtc-ko") }}
    </li>
    <li v-for="s in diag.servers" :key="s.url" class="break-all" :class="s.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'">
      {{ s.ok ? "✓" : "✗" }} {{ t(s.ok ? "diag-server-ok" : "diag-server-ko", s.url) }}
    </li>
    <li :class="diag.room ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500'">
      {{ diag.room ? "✓" : "…" }} {{ t(diag.room ? "diag-room-ok" : "diag-room-ko") }}
    </li>
    <li class="text-gray-500">{{ t("diag-links", diag.links) }}</li>
  </ul>
</template>
