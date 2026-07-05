import { createRouter, createWebHistory } from "vue-router";

import HomeView from "@/views/HomeView.vue";
import MarketView from "@/views/MarketView.vue";
import CoinDetailView from "@/views/CoinDetailView.vue";
import WatchListView from "@/views/WatchListView.vue";
import SearchView from "@/views/SearchView.vue";
import BlogView from "@/views/BlogView.vue";
import BlogDetailView from "@/views/BlogDetailView.vue";
import ProfileView from "@/views/ProfileView.vue";
import NotFoundView from "@/views/NotFoundView.vue";

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: "/",
      component: HomeView,
    },
    {
      path: "/market",
      component: MarketView,
    },
    {
      path: "/coin/:id",
      component: CoinDetailView,
    },
    {
      path: "/watchlist",
      component: WatchListView,
    },
    // "/favorites" points to the same WatchListView so there is only
    // ONE favorite implementation (Pinia store) instead of two that
    // could drift out of sync.
    {
      path: "/favorites",
      component: WatchListView,
    },
    {
      path: "/search",
      component: SearchView,
    },
    {
      path: "/blog",
      component: BlogView,
    },
    {
      path: "/blog/:slug",
      component: BlogDetailView,
    },
    {
      path: "/profile",
      component: ProfileView,
    },
    {
      path: "/:pathMatch(.*)*",
      component: NotFoundView,
    },
  ],
});

export default router;