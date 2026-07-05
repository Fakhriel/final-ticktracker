<!-- Navbar.vue -->
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { Menu, X, Home, TrendingUp, Star, ChevronDown, Newspaper, LogOut } from "@lucide/vue";
import logo from "@/assets/logo.png";
import { useAuthStore } from "@/stores/auth";
import { useAuthModal } from "@/composables/useAuthModal";

const authStore = useAuthStore();
const authModal = useAuthModal();

const route = useRoute();
const isOpen = ref(false);
const isMarketOpen = ref(false);
const isMobileMarketOpen = ref(false);
const marketDropdownRef = ref(null);

const navLinksBefore = [{ to: "/", label: "Home", icon: Home }];

const navLinksAfter = [
  { to: "/blog", label: "Blog", icon: Newspaper },
  { to: "/watchlist", label: "Watchlist", icon: Star },
];

const marketChildren = [
  { to: "/market", label: "All Coins", query: {} },
  { to: "/market", label: "Trending", query: { status: "trending" } },
  { to: "/market", label: "Gainers", query: { status: "gainers" } },
  { to: "/market", label: "Losers", query: { status: "losers" } },
  { to: "/market", label: "Categories", query: { view: "categories" } },
];

const isMarketRouteActive = computed(() => route.path.startsWith("/market"));

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function toggleMarketMenu() {
  isMarketOpen.value = !isMarketOpen.value;
}

function handleClickOutside(event) {
  if (marketDropdownRef.value && !marketDropdownRef.value.contains(event.target)) {
    isMarketOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

watch(
  () => route.fullPath,
  () => {
    isOpen.value = false;
    isMarketOpen.value = false;
    isMobileMarketOpen.value = false;
  }
);
</script>

<template>
  <header class="navbar-wrap">
    <nav class="navbar">
      <RouterLink to="/" class="brand" aria-label="TickTracker home">
        <span class="brand-mark">
          <img :src="logo" alt="" class="brand-logo" />
        </span>
        <span class="brand-name">
          <span class="brand-name-a">Tick</span><span class="brand-name-b">Tracker</span>
        </span>
      </RouterLink>

      <div class="links links-desktop">
        <RouterLink
          v-for="link in navLinksBefore"
          :key="link.to"
          :to="link.to"
          class="nav-link"
        >
          <component :is="link.icon" :size="16" :stroke-width="2" class="nav-icon" />
          <span>{{ link.label }}</span>
        </RouterLink>

        <div class="nav-dropdown" ref="marketDropdownRef">
          <button
            type="button"
            class="nav-link dropdown-trigger"
            :class="{ 'router-link-exact-active': isMarketRouteActive }"
            :aria-expanded="isMarketOpen"
            @click="toggleMarketMenu"
          >
            <TrendingUp :size="16" :stroke-width="2" class="nav-icon" />
            <span>Market</span>
            <ChevronDown :size="14" :stroke-width="2" class="chevron" :class="{ open: isMarketOpen }" />
          </button>

          <Transition name="drop">
            <div v-if="isMarketOpen" class="dropdown-panel">
              <RouterLink
                v-for="item in marketChildren"
                :key="item.label"
                :to="{ path: item.to, query: item.query }"
                class="dropdown-item"
                @click="isMarketOpen = false"
              >
                {{ item.label }}
              </RouterLink>
            </div>
          </Transition>
        </div>

        <RouterLink
          v-for="link in navLinksAfter"
          :key="link.to"
          :to="link.to"
          class="nav-link"
        >
          <component :is="link.icon" :size="16" :stroke-width="2" class="nav-icon" />
          <span>{{ link.label }}</span>
        </RouterLink>
      </div>

      <div class="navbar-actions">
        <button
          v-if="!authStore.isAuthenticated"
          type="button"
          class="auth-btn"
          @click="authModal.open('login')"
        >
          Login
        </button>

        <RouterLink
          v-else
          to="/profile"
          class="user-chip"
        >
          <span class="user-avatar">
            <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" alt="" />
            <template v-else>{{ (authStore.user?.name || 'U').charAt(0).toUpperCase() }}</template>
          </span>
          <span class="user-name">{{ authStore.user?.name }}</span>
          <button
            type="button"
            class="logout-btn"
            title="Logout"
            aria-label="Logout"
            @click.stop.prevent="authStore.logout()"
          >
            <LogOut :size="14" />
          </button>
        </RouterLink>

        <button
          type="button"
          class="icon-btn menu-toggle"
          :aria-expanded="isOpen"
          aria-label="Toggle menu"
          @click="toggleMenu"
        >
          <Menu v-if="!isOpen" :size="20" :stroke-width="2" />
          <X v-else :size="20" :stroke-width="2" />
        </button>
      </div>
    </nav>

    <Transition name="drop">
      <div v-if="isOpen" class="mobile-panel">
        <RouterLink
          v-for="link in navLinksBefore"
          :key="link.to"
          :to="link.to"
          class="mobile-link"
        >
          <component :is="link.icon" :size="18" :stroke-width="2" class="nav-icon" />
          <span>{{ link.label }}</span>
        </RouterLink>

        <div class="mobile-group">
          <button
            type="button"
            class="mobile-link mobile-group-trigger"
            :class="{ 'router-link-exact-active': isMarketRouteActive }"
            :aria-expanded="isMobileMarketOpen"
            @click="isMobileMarketOpen = !isMobileMarketOpen"
          >
            <TrendingUp :size="18" :stroke-width="2" class="nav-icon" />
            <span>Market</span>
            <ChevronDown :size="16" :stroke-width="2" class="chevron chevron-end" :class="{ open: isMobileMarketOpen }" />
          </button>

          <div v-if="isMobileMarketOpen" class="mobile-submenu">
            <RouterLink
              v-for="item in marketChildren"
              :key="item.label"
              :to="{ path: item.to, query: item.query }"
              class="mobile-sublink"
            >
              {{ item.label }}
            </RouterLink>
          </div>
        </div>

        <RouterLink
          v-for="link in navLinksAfter"
          :key="link.to"
          :to="link.to"
          class="mobile-link"
        >
          <component :is="link.icon" :size="18" :stroke-width="2" class="nav-icon" />
          <span>{{ link.label }}</span>
        </RouterLink>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.navbar-wrap {
  --tt-blue: #4c8dff;
  --tt-purple: #a855f7;
  --tt-pink: #e94ff0;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(6, 7, 15, 0.72);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border-bottom: 1px solid rgba(140, 150, 200, 0.14);
}

.navbar-wrap::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(76, 141, 255, 0.55),
    rgba(233, 79, 240, 0.55),
    transparent
  );
}

.navbar {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  min-width: 0;
}

.brand-mark {
  position: relative;
  width: 34px;
  height: 34px;
  flex: none;
  display: grid;
  place-items: center;
}

.brand-mark::before {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(76, 141, 255, 0.35), rgba(233, 79, 240, 0.25) 60%, transparent 75%);
  filter: blur(6px);
  opacity: 0.9;
}

.brand-logo {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.brand-name {
  font-family: "Chakra Petch", "Plus Jakarta Sans", sans-serif;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.brand-name-a {
  color: #f4f6ff;
}

.brand-name-b {
  background: linear-gradient(90deg, var(--tt-blue), var(--tt-purple) 55%, var(--tt-pink));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Desktop links */
.links-desktop {
  display: none;
  align-items: center;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 999px;
  color: #a6adc4;
  text-decoration: none;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  transition: color 0.2s ease, background-color 0.2s ease;
}

/* Reset native <button> appearance so the dropdown trigger matches the <a> nav-links */
.dropdown-trigger {
  appearance: none;
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  cursor: pointer;
}

.nav-icon {
  flex: none;
  opacity: 0.85;
}

.nav-link:hover {
  color: #f4f6ff;
  background: rgba(140, 150, 200, 0.1);
}

.nav-link.router-link-exact-active {
  color: #f4f6ff;
  background: linear-gradient(90deg, rgba(76, 141, 255, 0.16), rgba(233, 79, 240, 0.16));
  box-shadow: inset 0 0 0 1px rgba(168, 133, 247, 0.35);
}

.chevron {
  flex: none;
  opacity: 0.7;
  transition: transform 0.2s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

/* Market dropdown (desktop) */
.nav-dropdown {
  position: relative;
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  min-width: 190px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  border-radius: 14px;
  background: rgba(6, 7, 15, 0.96);
  border: 1px solid rgba(140, 150, 200, 0.16);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
  z-index: 10;
}

.dropdown-item {
  padding: 10px 12px;
  border-radius: 9px;
  color: #a6adc4;
  text-decoration: none;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.dropdown-item:hover {
  color: #f4f6ff;
  background: rgba(168, 133, 247, 0.14);
}

/* Actions */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auth-btn {
  padding: 9px 18px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(90deg, #4c8dff, #a855f7);
  color: white;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  white-space: nowrap;
}

.auth-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(168, 133, 247, 0.35);
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 6px 6px;
  border-radius: 999px;
  border: 1px solid rgba(140, 150, 200, 0.16);
  background: rgba(140, 150, 200, 0.08);
  color: #cbd0e6;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.user-chip:hover {
  border-color: rgba(168, 133, 247, 0.5);
  background: rgba(168, 133, 247, 0.1);
}

.user-avatar {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4c8dff, #a855f7);
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.18s ease, background-color 0.18s ease;
}

.logout-btn:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.12);
}

@media (max-width: 640px) {
  .user-name {
    display: none;
  }
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: #cbd0e6;
  background: rgba(140, 150, 200, 0.08);
  border: 1px solid rgba(140, 150, 200, 0.16);
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease, background-color 0.18s ease;
}

.icon-btn:hover {
  color: #f4f6ff;
  border-color: rgba(168, 133, 247, 0.5);
  background: rgba(168, 133, 247, 0.12);
  transform: translateY(-1px);
}

.menu-toggle {
  display: grid;
}

/* Mobile panel — overlay, ga ndorong konten di bawahnya */
.mobile-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 16px 18px;
  border-top: 1px solid rgba(140, 150, 200, 0.12);
  background: rgba(6, 7, 15, 0.96);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px;
  border-radius: 10px;
  color: #cbd0e6;
  text-decoration: none;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 15px;
  font-weight: 500;
  width: 100%;
}

.mobile-link.router-link-exact-active {
  color: #f4f6ff;
  background: linear-gradient(90deg, rgba(76, 141, 255, 0.16), rgba(233, 79, 240, 0.16));
}

/* Market accordion (mobile) */
.mobile-group {
  display: flex;
  flex-direction: column;
}

.mobile-group-trigger {
  appearance: none;
  background: transparent;
  border: none;
  font-family: inherit;
  cursor: pointer;
  justify-content: flex-start;
}

.chevron-end {
  margin-left: auto;
}

.mobile-submenu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 10px 6px 40px;
}

.mobile-sublink {
  padding: 10px 12px;
  border-radius: 9px;
  color: #a6adc4;
  text-decoration: none;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 14px;
  font-weight: 500;
}

.mobile-sublink:hover,
.mobile-sublink.router-link-exact-active {
  color: #f4f6ff;
  background: rgba(168, 133, 247, 0.14);
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Breakpoints: reveal desktop nav on medium screens and up */
@media (min-width: 760px) {
  .links-desktop {
    display: flex;
  }

  .menu-toggle {
    display: none;
  }

  .mobile-panel {
    display: none;
  }
}

@media (min-width: 1024px) {
  .navbar {
    padding: 14px 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .drop-enter-active,
  .drop-leave-active {
    transition: none;
  }
}
</style>