import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, API_BASE_URL } from '@/services/api'
import { useFavoriteStore } from '@/stores/favorite'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  // Session dicek lewat cookie httpOnly (fetchMe), bukan localStorage lagi.
  // `initialized` dipakai halaman kayak Profile/Watchlist biar gak keburu
  // nampilin "silakan login" sebelum tau hasil fetchMe pas reload.
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  // Dipanggil sekali di App.vue saat app pertama kali mount, buat cek
  // apakah ada sesi login yang masih valid dari cookie.
  async function fetchMe() {
    try {
      user.value = await api.get('/api/auth/me')
    } catch {
      user.value = null
    } finally {
      initialized.value = true
    }
  }

  async function login({ email, password }) {
    loading.value = true
    error.value = null
    try {
      user.value = await api.post('/api/auth/login', { email, password })
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function register({ name, email, password, confirmPassword }) {
    loading.value = true
    error.value = null
    try {
      if (password !== confirmPassword) {
        throw new Error('Konfirmasi password tidak cocok.')
      }
      user.value = await api.post('/api/auth/register', { name, email, password })
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // OAuth login/register = full-page redirect ke backend (bagian dari OAuth
  // flow, bukan fetch biasa). Browser pindah halaman, lalu backend redirect
  // balik ke '/' dengan cookie sesi udah keset - App.vue yang nangkep lewat
  // fetchMe() pas mount ulang.
  function loginWithProvider(provider) {
    window.location.href = `${API_BASE_URL}/api/auth/${provider}`
  }

  async function updateProfile({ name }) {
    loading.value = true
    error.value = null
    try {
      if (!name || !name.trim()) throw new Error('Nama gak boleh kosong.')
      user.value = await api.put('/api/profile', { name: name.trim() })
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function uploadAvatar(file) {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      user.value = await api.post('/api/profile/avatar', formData)
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // "Connect" akun (dari ProfileView, user udah login) - juga full-page
  // redirect, sama alasannya kayak loginWithProvider di atas.
  function connectProvider(provider) {
    window.location.href = `${API_BASE_URL}/api/profile/providers/${provider}/connect`
  }

  async function disconnectProvider(provider) {
    loading.value = true
    error.value = null
    try {
      user.value = await api.delete(`/api/profile/providers/${provider}`)
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteAccount() {
    loading.value = true
    error.value = null
    try {
      await api.delete('/api/profile')
      user.value = null
      useFavoriteStore().reset()
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout')
    } finally {
      user.value = null
      useFavoriteStore().reset()
    }
  }

  return {
    user,
    loading,
    error,
    initialized,
    isAuthenticated,
    fetchMe,
    login,
    register,
    loginWithProvider,
    updateProfile,
    uploadAvatar,
    connectProvider,
    disconnectProvider,
    deleteAccount,
    logout,
  }
})