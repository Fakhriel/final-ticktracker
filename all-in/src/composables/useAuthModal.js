import { ref } from 'vue'

// State module-level (singleton) - biar bisa dipanggil dari komponen mana
// aja (FavoriteButton, MarketView, dst) tanpa prop-drilling / event bus.
const isOpen = ref(false)
const mode = ref('login') // 'login' | 'register'
const message = ref('')

export function useAuthModal() {
  function open(initialMode = 'login', initialMessage = '') {
    mode.value = initialMode
    message.value = initialMessage
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    message.value = ''
  }

  function setMode(newMode) {
    mode.value = newMode
  }

  return {
    isOpen,
    mode,
    message,
    open,
    close,
    setMode,
  }
}