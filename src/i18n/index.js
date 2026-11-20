import Banana from "banana-i18n";
import fr from "./fr.json";

const banana = new Banana("fr", { messages: { fr } });

/** Translate a message key; extra arguments fill $1, $2… */
export const t = (key, ...params) => banana.i18n(key, ...params);

export default {
  install(app) {
    app.config.globalProperties.$t = t;
  },
};
