<script setup>
import { computed, onMounted, ref, useId } from "vue";
import AppIcon from "../atoms/AppIcon.vue";
import ConfirmDialog from "../molecules/ConfirmDialog.vue";
import SearchButton from "../molecules/SearchButton.vue";
import { useUpdatesStore } from "../../stores/updates.js";
import { dispatchWorkflow, runsUrl } from "../../domain/github.js";
import { t } from "../../i18n/index.js";

/**
 * Starts the paid "update offers" workflow after a confirmation, then follows it (see the updates store).
 * The GitHub token (Actions: write, this repository only) stays in this browser.
 */
const WORKFLOW = "update-offers.yml";
const KEY = "github-actions-token";
const read = () => { try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; } };
const save = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* storage unavailable */ } };

const updates = useUpdatesStore();
const phase = computed(() => (updates.phase === "failed" ? "idle" : updates.phase));
const uid = useId();
const open = ref(false);
const saved = ref(read());
const token = ref("");
const state = ref("idle"); // idle | sending | done | error
const error = ref("");

onMounted(() => updates.resume(saved.value));

function show() { state.value = "idle"; open.value = true; }
function forget() { save(""); saved.value = ""; }
async function run() {
  if (state.value === "done") { open.value = false; return; }
  const value = saved.value || token.value.trim();
  if (!value) return;
  state.value = "sending";
  const startedAt = Date.now();
  try {
    await dispatchWorkflow(value, WORKFLOW);
    save(value); saved.value = value; token.value = "";
    state.value = "done";
    updates.track(value, startedAt);
  } catch (e) {
    error.value = e.message;
    state.value = "error";
  }
}
</script>

<template>
  <SearchButton :phase="phase" @click="show" />
  <p v-if="updates.phase === 'failed'" role="alert" class="flex items-center gap-1 text-red-700 dark:text-red-400">
    <AppIcon name="x" />{{ t("update-offers-failed", updates.error) }}
  </p>
  <ConfirmDialog v-if="open" :open="open" :title="t('update-offers')" :busy="state === 'sending'" :cancelable="state !== 'done'"
    :confirm-label="state === 'done' ? t('close') : t('update-offers-run')" @confirm="run" @close="open = false">
    <template v-if="state === 'done'">
      <p role="status" class="flex items-center gap-1"><AppIcon name="check" class="text-emerald-700" />{{ t("update-offers-started") }}</p>
      <a :href="runsUrl(WORKFLOW)" target="_blank" rel="noopener" class="underline">{{ t("update-offers-follow") }}<span class="sr-only">{{ t("opens-github") }}</span></a>
    </template>
    <template v-else>
      <p>{{ t("update-offers-confirm") }}</p>
      <label v-if="!saved" class="block">{{ t("update-offers-token") }}
        <input :id="`${uid}-token`" v-model="token" name="actions-token" type="password" required autocomplete="off" class="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-950" />
        <span class="mt-0.5 block text-xs text-gray-500">{{ t("update-offers-token-help") }}</span>
      </label>
      <p v-else class="text-xs text-gray-500">{{ t("update-offers-token-saved") }}
        <button type="button" class="underline" @click="forget">{{ t("update-offers-token-forget") }}</button></p>
      <p v-if="state === 'error'" role="alert" class="flex items-center gap-1 text-red-700 dark:text-red-400"><AppIcon name="x" />{{ t("update-offers-error", error) }}</p>
    </template>
  </ConfirmDialog>
</template>
