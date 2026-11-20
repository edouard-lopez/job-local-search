import { createApp } from "vue";
import { createPinia } from "pinia";
import "leaflet/dist/leaflet.css";
import "./assets/main.css";
import App from "./App.vue";
import router from "./router/index.js";
import i18n from "./i18n/index.js";
import { useSyncStore } from "./stores/sync.js";
import { useTriageStore } from "./stores/triage.js";

const app = createApp(App).use(createPinia()).use(router).use(i18n);
// Restore the shared triage before the first render.
useSyncStore().init();
useTriageStore().init();
app.mount("#app");
