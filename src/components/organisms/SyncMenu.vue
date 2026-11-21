<script setup>
import { computed, ref } from "vue";
import AppIcon from "../atoms/AppIcon.vue";
import PeerList from "../molecules/PeerList.vue";
import SyncDiagnostic from "../molecules/SyncDiagnostic.vue";
import { useSyncStore } from "../../stores/sync.js";
import { parseTurnJson } from "../../domain/turn.js";
import { t } from "../../i18n/index.js";

/** Top-bar button: number of other open devices; opens their list and the Gist settings. */
const sync = useSyncStore();
const open = ref(false);
const token = ref("");
const gistId = ref(sync.settings.gistId);
const relays = ref(sync.relays.join("\n"));
/** TURN is configured by pasting the provider's iceServers snippet; it is checked as you type. */
const turnText = ref("");
const turnParsed = computed(() => (turnText.value.trim() ? parseTurnJson(turnText.value) : null));
const turnInvalid = computed(() => Boolean(turnText.value.trim()) && !turnParsed.value);
function saveNetwork() {
  const turn = turnParsed.value ?? sync.turn;
  sync.setNetwork({ relays: relays.value.split(/\s+/), turn });
  turnText.value = "";
}
const clearTurn = () => sync.setNetwork({ relays: sync.relays, turn: null });
const turnCount = (turn) => (turn?.urls ? turn.urls.split(" ").length : 0);

async function submit() {
  await sync.configure(token.value, gistId.value);
  gistId.value = sync.settings.gistId;
  token.value = "";
}
</script>

<template>
  <div class="relative">
    <button type="button" :aria-expanded="open" aria-controls="sync-menu" :aria-label="t('peers-button', sync.peerCount)"
      :title="t('peers-title')" data-testid="peers"
      class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-500 dark:ring-gray-700"
      :class="{ 'text-emerald-700 dark:text-emerald-400': sync.peerCount > 0 }" @click="open = !open">
      <AppIcon name="users" /><span aria-hidden="true">{{ sync.peerCount }}</span>
    </button>
    <div v-if="open" id="sync-menu" role="dialog" :aria-label="t('peers-title')"
      class="absolute right-0 z-[1000] mt-2 w-80 max-w-[calc(100vw-2rem)] space-y-3 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-900"
      @keydown.esc="open = false">
      <h2 class="text-sm font-semibold">{{ t("peers-title") }}</h2>
      <PeerList :peers="sync.peers" />
      <p class="text-xs" role="status">{{ t(`sync-status-${sync.status}`, sync.error) }}</p>
      <form v-if="!sync.enabled" class="space-y-2 text-sm" @submit.prevent="submit">
        <p class="text-xs text-gray-500">{{ t("sync-help") }}</p>
        <label class="block">{{ t("sync-token") }}
          <input v-model="token" type="password" required autocomplete="off" class="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-950" />
        </label>
        <label class="block">{{ t("sync-gist") }}
          <input v-model="gistId" type="text" autocomplete="off" class="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-950" />
        </label>
        <button type="submit" class="rounded-md bg-emerald-700 px-3 py-1 text-white hover:bg-emerald-600">{{ t("sync-connect") }}</button>
      </form>
      <template v-else>
        <details class="text-xs">
          <summary class="cursor-pointer font-semibold">{{ t("sync-title") }}</summary>
          <p class="mt-1 text-gray-500">{{ t("sync-gist-hint") }} <code class="select-all break-all">{{ sync.settings.gistId }}</code></p>
          <button type="button" class="mt-1 text-red-700 underline dark:text-red-400" @click="sync.disconnect()">{{ t("sync-disconnect") }}</button>
        </details>
        <details class="text-xs">
          <summary class="cursor-pointer font-semibold">{{ t("diag-title") }}</summary>
          <SyncDiagnostic class="mt-1" :diag="sync.diag" />
        </details>
      </template>
      <details class="text-xs">
        <summary class="cursor-pointer font-semibold">{{ t("sync-network") }}</summary>
        <form class="mt-1 space-y-2" @submit.prevent="saveNetwork">
          <label class="block">{{ t("sync-relays") }}
            <textarea v-model="relays" rows="2" class="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 font-mono dark:border-gray-700 dark:bg-gray-950" />
          </label>
          <p class="text-gray-500">{{ t("sync-relays-help") }}</p>
          <label class="block">{{ t("sync-turn") }}
            <textarea v-model="turnText" rows="3" :placeholder="t('sync-turn-placeholder')" :aria-invalid="turnInvalid" aria-describedby="turn-check"
              class="mt-0.5 w-full rounded border px-2 py-1 font-mono dark:bg-gray-950"
              :class="turnInvalid ? 'border-red-600' : turnParsed ? 'border-emerald-600' : 'border-gray-300 dark:border-gray-700'" />
          </label>
          <p id="turn-check" class="flex items-center gap-1" role="status">
            <template v-if="turnParsed"><AppIcon name="check" class="text-emerald-700" />{{ t("sync-turn-valid", turnCount(turnParsed)) }}</template>
            <template v-else-if="turnInvalid"><AppIcon name="x" class="text-red-700" />{{ t("sync-turn-invalid") }}</template>
            <template v-else-if="sync.turn?.urls">{{ t("sync-turn-current", turnCount(sync.turn)) }}
              <button type="button" class="text-red-700 underline dark:text-red-400" @click="clearTurn">{{ t("sync-turn-clear") }}</button></template>
            <span v-else class="text-gray-500">{{ t("sync-turn-help") }}</span>
          </p>
          <button type="submit" :disabled="turnInvalid" class="rounded-md px-2 py-0.5 ring-1 ring-inset ring-gray-300 hover:ring-gray-500 disabled:opacity-50 dark:ring-gray-700">{{ t("sync-relays-save") }}</button>
        </form>
      </details>
    </div>
  </div>
</template>
