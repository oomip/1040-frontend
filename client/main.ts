import "@/assets/main.css";
import "purecss";

import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import { createApp } from "vue";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faCalendarDays, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

library.add(faCalendarDays, faLocationDot);
app.component("font-awesome-icon", FontAwesomeIcon);

app.use(pinia);
app.use(router);

app.mount("#app");
