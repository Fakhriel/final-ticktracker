<script setup>
import { ref, watch } from 'vue'
import { X, Loader2 } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useAuthModal } from '@/composables/useAuthModal'

const authStore = useAuthStore()
const { isOpen, mode, message, close, setMode } = useAuthModal()

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ name: '', email: '', password: '', confirmPassword: '' })
const formError = ref('')

function resetForms() {
  loginForm.value = { email: '', password: '' }
  registerForm.value = { name: '', email: '', password: '', confirmPassword: '' }
  formError.value = ''
  authStore.error = null
}

watch(isOpen, (open) => {
  if (open) resetForms()
})

watch(mode, resetForms)

async function handleLogin() {
  formError.value = ''
  const ok = await authStore.login({ ...loginForm.value })
  if (ok) close()
  else formError.value = authStore.error
}

async function handleRegister() {
  formError.value = ''
  const ok = await authStore.register({ ...registerForm.value })
  if (ok) close()
  else formError.value = authStore.error
}

function handleOAuth(provider) {
  formError.value = ''
  // Full-page redirect ke backend - bukan API call biasa, jadi gak ada
  // "hasil" buat di-await di sini (browser langsung pindah halaman).
  authStore.loginWithProvider(provider)
}

function handleBackdrop(e) {
  if (e.target === e.currentTarget) close()
}

function handleKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) close()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="modal-backdrop"
      @click="handleBackdrop"
      @keydown="handleKeydown"
      tabindex="-1"
    >
      <div class="modal" role="dialog" aria-modal="true" :aria-label="mode === 'login' ? 'Login' : 'Register'">
        <button type="button" class="close-btn" aria-label="Close" @click="close">
          <X :size="18" />
        </button>

        <div class="modal-head">
          <span class="brand-name">
            <span class="brand-name-a">Tick</span><span class="brand-name-b">Tracker</span>
          </span>
          <h2>{{ mode === 'login' ? 'Welcome back' : 'Create your account' }}</h2>
          <p v-if="message" class="context-msg">{{ message }}</p>
        </div>

        <div class="tabs">
          <button
            type="button"
            class="tab"
            :class="{ active: mode === 'login' }"
            @click="setMode('login')"
          >
            Login
          </button>
          <button
            type="button"
            class="tab"
            :class="{ active: mode === 'register' }"
            @click="setMode('register')"
          >
            Register
          </button>
        </div>

        <p v-if="formError" class="form-error">{{ formError }}</p>

        <form v-if="mode === 'login'" class="form" @submit.prevent="handleLogin">
          <label class="field">
            <span>Email</span>
            <input v-model="loginForm.email" type="email" placeholder="you@example.com" required />
          </label>
          <label class="field">
            <span>Password</span>
            <input v-model="loginForm.password" type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required />
          </label>
          <button type="submit" class="submit-btn" :disabled="authStore.loading">
            <Loader2 v-if="authStore.loading" :size="16" class="spin" />
            <span>{{ authStore.loading ? 'Signing in...' : 'Login' }}</span>
          </button>
        </form>

        <form v-else class="form" @submit.prevent="handleRegister">
          <label class="field">
            <span>Name</span>
            <input v-model="registerForm.name" type="text" placeholder="Your name" required />
          </label>
          <label class="field">
            <span>Email</span>
            <input v-model="registerForm.email" type="email" placeholder="you@example.com" required />
          </label>
          <label class="field">
            <span>Password</span>
            <input v-model="registerForm.password" type="password" placeholder="At least 6 characters" required />
          </label>
          <label class="field">
            <span>Confirm Password</span>
            <input v-model="registerForm.confirmPassword" type="password" placeholder="Repeat your password" required />
          </label>
          <button type="submit" class="submit-btn" :disabled="authStore.loading">
            <Loader2 v-if="authStore.loading" :size="16" class="spin" />
            <span>{{ authStore.loading ? 'Creating account...' : 'Create Account' }}</span>
          </button>
        </form>

        <div class="divider">
          <span>or continue with</span>
        </div>

        <div class="oauth-row">
          <button
            type="button"
            class="oauth-btn"
            :disabled="authStore.loading"
            @click="handleOAuth('google')"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1C3.25 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27v-3.1H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.37l4-3.1z"/>
              <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.63l4 3.1c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            class="oauth-btn"
            :disabled="authStore.loading"
            @click="handleOAuth('github')"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.66.5 12.03c0 5.1 3.29 9.42 7.86 10.95.57.1.78-.25.78-.55 0-.27-.01-1.15-.02-2.09-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.28-1.7-1.28-1.7-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.73 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.07.78 2.15 0 1.55-.01 2.81-.01 3.19 0 .3.2.66.79.55A10.53 10.53 0 0 0 23.5 12.03C23.5 5.66 18.35.5 12 .5z"/>
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        <p class="switch-note">
          <template v-if="mode === 'login'">
            Don't have an account?
            <button type="button" class="link-btn" @click="setMode('register')">Register</button>
          </template>
          <template v-else>
            Already have an account?
            <button type="button" class="link-btn" @click="setMode('login')">Login</button>
          </template>
        </p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(6, 7, 15, 0.75);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  --tt-blue: #4c8dff;
  --tt-purple: #a855f7;
  --tt-pink: #e94ff0;
  position: relative;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  background: #0c0e18;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 20px;
  padding: 32px 28px 28px;
  animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.04);
  color: #94a3b8;
  cursor: pointer;
  transition: 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.modal-head {
  text-align: center;
  margin-bottom: 20px;
}

.brand-name {
  display: block;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
}

.brand-name-a { color: white; }
.brand-name-b {
  background: linear-gradient(90deg, var(--tt-blue), var(--tt-purple) 60%, var(--tt-pink));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.modal-head h2 {
  color: white;
  font-size: 20px;
  margin-bottom: 6px;
}

.context-msg {
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.5;
}

.tabs {
  display: flex;
  gap: 6px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 18px;
}

.tab {
  flex: 1;
  padding: 9px 0;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: #94a3b8;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
}

.tab.active {
  background: rgba(168, 133, 247, 0.15);
  color: white;
}

.form-error {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.25);
  color: #f87171;
  font-size: 13px;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 14px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field span {
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 600;
}

.field input {
  padding: 11px 14px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.03);
  color: white;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus {
  border-color: var(--tt-purple);
}

.field input::placeholder {
  color: #475569;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, var(--tt-blue), var(--tt-purple));
  color: white;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 8px 24px rgba(168, 133, 247, 0.35);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 22px 0 16px;
  color: #475569;
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(148, 163, 184, 0.15);
}

.oauth-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.03);
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.oauth-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(148, 163, 184, 0.35);
}

.oauth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-note {
  text-align: center;
  margin-top: 20px;
  color: #64748b;
  font-size: 13px;
}

.link-btn {
  background: none;
  border: none;
  color: var(--tt-blue);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  padding: 0 0 0 4px;
}

.link-btn:hover {
  color: var(--tt-purple);
}

@media (max-width: 480px) {
  .modal {
    padding: 26px 20px 22px;
  }
}
</style>