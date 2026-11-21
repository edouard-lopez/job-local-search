<script setup>
import { ref, watch, nextTick } from "vue";
import { t } from "../../i18n/index.js";

/** Modal confirmation built on <dialog>: Esc or "Annuler" closes it, the form submits "confirm". */
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  confirmLabel: { type: String, required: true },
  busy: { type: Boolean, default: false },
  /** false once the action is done: only the confirm button stays. */
  cancelable: { type: Boolean, default: true },
});
const emit = defineEmits(["confirm", "close"]);
const dialog = ref(null);
watch(() => props.open, async (open) => {
  await nextTick();
  if (open && !dialog.value?.open) dialog.value?.showModal?.();
  if (!open && dialog.value?.open) dialog.value.close();
}, { immediate: true });
</script>

<template>
  <dialog ref="dialog" :aria-label="title" @close="emit('close')"
    class="w-96 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-900 shadow-xl backdrop:bg-black/40 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
    <form class="space-y-3" @submit.prevent="emit('confirm')">
      <h2 class="text-base font-semibold">{{ title }}</h2>
      <slot />
      <div class="flex justify-end gap-2">
        <button v-if="cancelable" type="button" class="rounded-md px-3 py-1 ring-1 ring-inset ring-gray-300 hover:ring-gray-500 dark:ring-gray-700" @click="emit('close')">{{ t("cancel") }}</button>
        <button type="submit" :disabled="busy" class="rounded-md bg-emerald-700 px-3 py-1 text-white hover:bg-emerald-600 disabled:opacity-50">{{ confirmLabel }}</button>
      </div>
    </form>
  </dialog>
</template>
