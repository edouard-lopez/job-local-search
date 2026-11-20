import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

// Hash history: GitHub Pages serves a single static index.html.
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/styleguide", name: "styleguide", component: () => import("../views/StyleguideView.vue") },
    { path: "/changelog", name: "changelog", component: () => import("../views/ChangelogView.vue") },
  ],
});
