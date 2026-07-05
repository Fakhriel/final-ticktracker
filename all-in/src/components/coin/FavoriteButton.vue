<script setup>
import { computed } from 'vue'
import { useFavoriteStore } from '@/stores/favorite'
import { useAuthStore } from '@/stores/auth'
import { useAuthModal } from '@/composables/useAuthModal'

const props = defineProps({
  coinId: {
    type: String,
    required: true,
  },
})

const favoriteStore = useFavoriteStore()
const authStore = useAuthStore()
const authModal = useAuthModal()

const isFavorite = computed(() => {
  return favoriteStore.isFavorite(props.coinId)
})

const toggleFavorite = () => {
  const isAdding = !isFavorite.value

  if (isAdding && !authStore.isAuthenticated) {
    authModal.open('login', 'Login atau daftar dulu buat nambahin coin ini ke favorite.')
    return
  }

  favoriteStore.toggleFavorite(props.coinId)
}
</script>

<template>
  <button
    class="favorite-button"
    :class="{ active: isFavorite }"
    @click="toggleFavorite"
    aria-label="Favorite"
  >
    <span v-if="isFavorite">★</span>
    <span v-else>☆</span>
  </button>
</template>

<style scoped>
.favorite-button {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #2b3445;
  border-radius: 10px;

  background: #171b26;
  color: #8f98aa;

  cursor: pointer;

  font-size: 20px;

  transition: .2s ease;
}

.favorite-button:hover {
  border-color: #f5b301;
  color: #f5b301;
}

.favorite-button.active {
  background: rgba(245,179,1,.12);
  border-color: #f5b301;
  color: #f5b301;
}

.favorite-button:active {
  transform: scale(.95);
}
</style>