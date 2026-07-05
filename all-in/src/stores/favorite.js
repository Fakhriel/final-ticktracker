import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'

// Watchlist sekarang nempel ke akun (tabel `favorites` di backend),
// bukan localStorage lagi. Store ini cuma nyimpen daftar coinId di memori
// buat sesi berjalan, di-hydrate dari backend lewat fetchFavorites().
export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref([])
  const loading = ref(false)
  const error = ref(null)

  function isFavorite(id) {
    return favorites.value.includes(id)
  }

  // Dipanggil dari App.vue setelah tau user login (fetchMe berhasil).
  async function fetchFavorites() {
    loading.value = true
    error.value = null
    try {
      const data = await api.get('/api/favorites')
      favorites.value = (data || []).map((item) => item.coinId)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addFavorite(id) {
    if (favorites.value.includes(id)) return

    // Optimistic update biar UI responsif, rollback kalau request gagal.
    favorites.value = [...favorites.value, id]
    try {
      await api.post('/api/favorites', { coinId: id })
    } catch (err) {
      favorites.value = favorites.value.filter((item) => item !== id)
      error.value = err.message
    }
  }

  async function removeFavorite(id) {
    const previous = favorites.value
    favorites.value = favorites.value.filter((item) => item !== id)
    try {
      await api.delete(`/api/favorites/${id}`)
    } catch (err) {
      favorites.value = previous
      error.value = err.message
    }
  }

  async function toggleFavorite(id) {
    if (isFavorite(id)) {
      await removeFavorite(id)
    } else {
      await addFavorite(id)
    }
  }

  // Dipanggil pas logout / delete account biar watchlist user sebelumnya
  // gak "kebawa" ke sesi guest / user lain di browser yang sama.
  function reset() {
    favorites.value = []
  }

  return {
    favorites,
    loading,
    error,
    isFavorite,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    reset,
  }
})