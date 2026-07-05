<script setup>
import { ref, onMounted, watch } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import AppNavbar from "@/components/ui/AppNavbar.vue";
import AppFooter from "@/components/ui/AppFooter.vue";
import AuthModal from "@/components/auth/AuthModal.vue";
import { useAuthStore } from "@/stores/auth";
import { useFavoriteStore } from "@/stores/favorite";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const favoriteStore = useFavoriteStore();

const oauthError = ref("");

onMounted(async () => {
  // Backend redirect balik ke sini dengan ?oauth_error=... kalau OAuth
  // gagal/dibatalkan. Tangkep dulu sebelum query-nya dibersihin dari URL.
  if (route.query.oauth_error) {
    oauthError.value = String(route.query.oauth_error);
    const { oauth_error, ...rest } = route.query;
    router.replace({ path: route.path, query: rest });
  }

  // Cek sesi login dari cookie httpOnly (bukan localStorage lagi).
  await authStore.fetchMe();
  if (authStore.isAuthenticated) {
    favoriteStore.fetchFavorites();
  }
});

// Nangkep login yang kejadian di TENGAH sesi (lewat AuthModal), bukan cuma
// pas app pertama kali mount - biar watchlist langsung ke-load abis login.
watch(
  () => authStore.isAuthenticated,
  (loggedIn) => {
    if (loggedIn) favoriteStore.fetchFavorites();
  }
);
</script>

<template>
  <AppNavbar />
  <div v-if="oauthError" class="oauth-error-banner">
    <span>{{ oauthError }}</span>
    <button type="button" @click="oauthError = ''" aria-label="Tutup">×</button>
  </div>
  <RouterView />
  <AppFooter />
  <AuthModal />
</template>

<style>
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body{
  font-family: Arial, Helvetica, sans-serif;
  background: #f5f5f5;
}

#app{
  min-height: 100vh;
}

.oauth-error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 20px;
  background: #451a1a;
  color: #fca5a5;
  font-size: 14px;
  border-bottom: 1px solid rgba(252, 165, 165, 0.25);
}

.oauth-error-banner button {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}
</style>