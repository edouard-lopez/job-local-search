<script setup>
import { ref, watch } from "vue";
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
const turn = ref({ ...sync.turn });
// Pasting Cloudflare's JSON answer into the address field fills the three fields.
watch(() => turn.value.urls, (text) => { const parsed = parseTurnJson(text); if (parsed) turn.value = parsed; });
const saveNetwork = () => sync.setNetwork({ relays: relays.value.split(/\s+/), turn: { ...turn.value } });

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
      <h2 class="text-sm font-semibold">{{ t("sync-title") }}</h2>
      <p class="text-xs" role="status">{{ t(`sync-status-${sync.status}`, sync.error) }}</p>
      <template v-if="sync.enabled">
        <p class="text-xs text-gray-500">{{ t("sync-gist-hint") }} <code class="select-all break-all">{{ sync.settings.gistId }}</code></p>
        <h2 class="text-sm font-semibold">{{ t("diag-title") }}</h2>
        <SyncDiagnostic :diag="sync.diag" />
        <button type="button" class="text-xs text-red-700 underline dark:text-red-400" @click="sync.disconnect()">{{ t("sync-disconnect") }}</button>
      </template>
      <form v-else class="space-y-2 text-sm" @submit.prevent="submit">
        <p class="text-xs text-gray-500">{{ t("sync-help") }}</p>
        <label class="block">{{ t("sync-token") }}
          <input v-model="token" type="password" required autocomplete="off" class="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-950" />
        </label>
        <label class="block">{{ t("sync-gist") }}
          <input v-model="gistId" type="text" autocomplete="off" class="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-950" />
        </label>
        <button type="submit" class="rounded-md bg-emerald-700 px-3 py-1 text-white hover:bg-emerald-600">{{ t("sync-connect") }}</button>
      </form>
      <form class="space-y-1 text-xs" @submit.prevent="saveNetwork">
        <label class="block">{{ t("sync-relays") }}
          <textarea v-model="relays" rows="2" class="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 font-mono dark:border-gray-700 dark:bg-gray-950" />
        </label>
        <p class="text-gray-500">{{ t("sync-relays-help") }}</p>
        <fieldset class="space-y-1">
          <legend class="font-semibold">{{ t("sync-turn") }}</legend>
          <p class="text-gray-500">{{ t("sync-turn-help") }}</p>
          <label class="block">{{ t("sync-turn-urls") }}
            <input v-model="turn.urls" type="text" placeholder="turn:exemple.org:443" autocomplete="off" class="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 font-mono dark:border-gray-700 dark:bg-gray-950" />
          </label>
          <label class="block">{{ t("sync-turn-username") }}
            <input v-model="turn.username" type="text" autocomplete="off" class="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 font-mono dark:border-gray-700 dark:bg-gray-950" />
          </label>
          <label class="block">{{ t("sync-turn-credential") }}
            <input v-model="turn.credential" type="password" autocomplete="off" class="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 font-mono dark:border-gray-700 dark:bg-gray-950" />
          </label>
        </fieldset>
        <button type="submit" class="rounded-md px-2 py-0.5 ring-1 ring-inset ring-gray-300 hover:ring-gray-500 dark:ring-gray-700">{{ t("sync-relays-save") }}</button>
      </form>
    </div>
  </div>
</template>
