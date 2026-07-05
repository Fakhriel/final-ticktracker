<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Camera, Check, Loader2, Mail, Star, ArrowRight, AlertTriangle, Trash2, X } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useAuthModal } from '@/composables/useAuthModal'
import { useFavoriteStore } from '@/stores/favorite'
import { API_BASE_URL } from '@/services/api'

const authStore = useAuthStore()
const authModal = useAuthModal()
const favoriteStore = useFavoriteStore()

function resolveAvatarUrl(path) {
  if (!path) return null
  // Preview base64 lokal (belum di-save) atau URL absolut dibiarin apa adanya,
  // sisanya (path relatif dari backend, misal /uploads/avatars/x.png) di-prefix.
  if (path.startsWith('data:') || path.startsWith('http')) return path
  return `${API_BASE_URL}${path}`
}

const nameInput = ref(authStore.user?.name || '')
const avatarPreview = ref(resolveAvatarUrl(authStore.user?.avatar))
const avatarFile = ref(null)
const avatarFileInput = ref(null)
const profileSaved = ref(false)
const profileError = ref('')

// authStore.user bisa keisi belakangan (fetchMe di App.vue itu async),
// jadi form perlu ikut ke-update begitu datanya nongol/berubah.
watch(
  () => authStore.user,
  (u) => {
    nameInput.value = u?.name || ''
    if (!avatarFile.value) {
      avatarPreview.value = resolveAvatarUrl(u?.avatar)
    }
  }
)

const showDeleteModal = ref(false)
const connectError = ref('')

const providers = [
  { key: 'email', label: 'Email', icon: Mail },
  {
    key: 'google',
    label: 'Google',
    svg: 'M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81zM12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1C3.25 21.3 7.31 24 12 24zM5.27 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27v-3.1H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.37l4-3.1zM12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.63l4 3.1c.95-2.85 3.6-4.96 6.73-4.96z',
  },
  {
    key: 'github',
    label: 'GitHub',
    svg: 'M12 .5C5.65.5.5 5.66.5 12.03c0 5.1 3.29 9.42 7.86 10.95.57.1.78-.25.78-.55 0-.27-.01-1.15-.02-2.09-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.28-1.7-1.28-1.7-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.73 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.07.78 2.15 0 1.55-.01 2.81-.01 3.19 0 .3.2.66.79.55A10.53 10.53 0 0 0 23.5 12.03C23.5 5.66 18.35.5 12 .5z',
  },
]

const favoriteCount = computed(() => favoriteStore.favorites.length)

function isConnected(providerKey) {
  return (authStore.user?.connectedProviders || []).includes(providerKey)
}

function triggerAvatarPicker() {
  avatarFileInput.value?.click()
}

function handleAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // Simpen File asli buat di-upload beneran pas Save Changes, preview-nya
  // aja yang base64 (biar user langsung liat hasilnya sebelum di-save).
  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    avatarPreview.value = reader.result
  }
  reader.readAsDataURL(file)
}

async function handleSaveProfile() {
  profileError.value = ''
  profileSaved.value = false

  const nameOk = await authStore.updateProfile({ name: nameInput.value })
  if (!nameOk) {
    profileError.value = authStore.error
    return
  }

  if (avatarFile.value) {
    const avatarOk = await authStore.uploadAvatar(avatarFile.value)
    if (!avatarOk) {
      profileError.value = authStore.error
      return
    }
    avatarFile.value = null
  }

  profileSaved.value = true
  setTimeout(() => (profileSaved.value = false), 2500)
}

function handleConnect(providerKey) {
  connectError.value = ''
  // Full-page redirect ke backend (bagian dari OAuth flow), bukan API call.
  authStore.connectProvider(providerKey)
}

async function handleDisconnect(providerKey) {
  connectError.value = ''
  const ok = await authStore.disconnectProvider(providerKey)
  if (!ok) connectError.value = authStore.error
}

async function handleDeleteAccount() {
  const ok = await authStore.deleteAccount()
  if (ok) showDeleteModal.value = false
}
</script>

<template>
  <div class="profile-page">
    <div v-if="!authStore.initialized" class="state-msg">
      <span class="spinner"></span>
      Loading...
    </div>

    <div v-else-if="!authStore.isAuthenticated" class="auth-gate">
      <span class="gate-icon">👤</span>
      <h2>Login to view your profile</h2>
      <p>Sign in or create an account to manage your profile.</p>
      <div class="gate-actions">
        <button type="button" class="primary-btn" @click="authModal.open('login')">Login</button>
        <button type="button" class="secondary-btn" @click="authModal.open('register')">
          Create Account
        </button>
      </div>
    </div>

    <template v-else>
      <div class="page-head">
        <h1>Profile</h1>
        <p class="subtitle">Manage your account details and preferences.</p>
      </div>

      <div class="panel">
        <h2 class="panel-title">Basic Info</h2>

        <div class="avatar-row">
          <div class="avatar-wrap">
            <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" class="avatar-img" />
            <span v-else class="avatar-fallback">
              {{ (nameInput || 'U').charAt(0).toUpperCase() }}
            </span>
            <button
              type="button"
              class="avatar-edit-btn"
              aria-label="Change avatar"
              @click="triggerAvatarPicker"
            >
              <Camera :size="14" />
            </button>
            <input
              ref="avatarFileInput"
              type="file"
              accept="image/*"
              class="visually-hidden"
              @change="handleAvatarChange"
            />
          </div>

          <div class="field-group">
            <label class="field">
              <span>Name</span>
              <input v-model="nameInput" type="text" placeholder="Your name" />
            </label>
            <label class="field">
              <span>Email</span>
              <input :value="authStore.user?.email" type="email" disabled />
            </label>
          </div>
        </div>

        <p v-if="profileError" class="form-error">{{ profileError }}</p>

        <div class="panel-actions">
          <span v-if="profileSaved" class="saved-note">
            <Check :size="14" /> Saved
          </span>
          <button
            type="button"
            class="primary-btn slim"
            :disabled="authStore.loading"
            @click="handleSaveProfile"
          >
            <Loader2 v-if="authStore.loading" :size="15" class="spin" />
            <span>{{ authStore.loading ? 'Saving...' : 'Save Changes' }}</span>
          </button>
        </div>
      </div>

      <div class="panel">
        <h2 class="panel-title">Connected Accounts</h2>
        <p v-if="connectError" class="form-error">{{ connectError }}</p>

        <div class="provider-list">
          <div v-for="p in providers" :key="p.key" class="provider-row">
            <div class="provider-info">
              <span class="provider-icon">
                <component :is="p.icon" v-if="p.icon" :size="18" />
                <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path :d="p.svg" />
                </svg>
              </span>
              <span class="provider-name">{{ p.label }}</span>
            </div>

            <button
              v-if="isConnected(p.key)"
              type="button"
              class="status-btn connected"
              :disabled="authStore.loading"
              @click="handleDisconnect(p.key)"
            >
              Connected · Disconnect
            </button>
            <button
              v-else
              type="button"
              class="status-btn"
              :disabled="authStore.loading"
              @click="handleConnect(p.key)"
            >
              Connect
            </button>
          </div>
        </div>
      </div>

      <RouterLink to="/watchlist" class="panel shortcut-panel">
        <div class="shortcut-left">
          <span class="shortcut-icon"><Star :size="18" /></span>
          <div>
            <h2 class="panel-title no-margin">Your Watchlist</h2>
            <p class="shortcut-note">
              {{ favoriteCount }} coin{{ favoriteCount === 1 ? '' : 's' }} saved
            </p>
          </div>
        </div>
        <ArrowRight :size="18" class="shortcut-arrow" />
      </RouterLink>

      <div class="panel danger-panel">
        <h2 class="panel-title danger-title">
          <AlertTriangle :size="16" /> Danger Zone
        </h2>
        <p class="danger-note">
          Deleting your account is permanent and cannot be undone. All your saved data will be lost.
        </p>
        <button type="button" class="danger-btn" @click="showDeleteModal = true">
          <Trash2 :size="15" /> Delete Account
        </button>
      </div>
    </template>

    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-backdrop" @click.self="showDeleteModal = false">
        <div class="confirm-modal" role="dialog" aria-modal="true" aria-label="Delete account confirmation">
          <button
            type="button"
            class="close-btn"
            aria-label="Close"
            @click="showDeleteModal = false"
          >
            <X :size="16" />
          </button>
          <span class="confirm-icon"><AlertTriangle :size="20" /></span>
          <h3>Delete your account?</h3>
          <p>This action is permanent. You'll lose access to your watchlist and profile data.</p>
          <div class="confirm-actions">
            <button type="button" class="secondary-btn" @click="showDeleteModal = false">
              Cancel
            </button>
            <button
              type="button"
              class="danger-btn"
              :disabled="authStore.loading"
              @click="handleDeleteAccount"
            >
              <Loader2 v-if="authStore.loading" :size="15" class="spin" />
              <span>{{ authStore.loading ? 'Deleting...' : 'Yes, Delete' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.profile-page {
  --tt-blue: #4c8dff;
  --tt-purple: #a855f7;
  --tt-pink: #e94ff0;
  min-height: 70vh;
  background: #06070f;
  padding: 40px 32px 90px;
}

.page-head {
  max-width: 640px;
  margin: 0 auto 28px;
}

.page-head h1 {
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.subtitle {
  color: #94a3b8;
  font-size: 14px;
}

.panel {
  max-width: 640px;
  margin: 0 auto 20px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.03);
}

.panel-title {
  color: white;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title.no-margin {
  margin-bottom: 4px;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 18px;
}

.avatar-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.avatar-img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--tt-blue), var(--tt-purple));
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.avatar-edit-btn {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #06070f;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: 0.2s;
}

.avatar-edit-btn:hover {
  background: rgba(168, 133, 247, 0.5);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.field-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field span {
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
}

.field input {
  padding: 10px 12px;
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

.field input:disabled {
  color: #64748b;
  cursor: not-allowed;
}

.panel-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.saved-note {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4ade80;
  font-size: 13px;
  font-weight: 600;
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

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, var(--tt-blue), var(--tt-purple));
  color: white;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
}

.primary-btn.slim {
  padding: 9px 18px;
}

.primary-btn:hover:not(:disabled) {
  box-shadow: 0 8px 24px rgba(168, 133, 247, 0.35);
  transform: translateY(-1px);
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary-btn {
  padding: 11px 20px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: transparent;
  color: white;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(168, 133, 247, 0.5);
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Connected accounts */
.provider-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.provider-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.provider-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.provider-icon {
  display: flex;
  color: #cbd5e1;
}

.status-btn {
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: transparent;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  white-space: nowrap;
}

.status-btn:hover:not(:disabled) {
  border-color: rgba(168, 133, 247, 0.5);
  color: white;
}

.status-btn.connected {
  color: #4ade80;
  border-color: rgba(74, 222, 128, 0.3);
  background: rgba(74, 222, 128, 0.08);
}

.status-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Watchlist shortcut */
.shortcut-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
}

.shortcut-panel:hover {
  border-color: rgba(168, 133, 247, 0.4);
  background: rgba(255, 255, 255, 0.045);
}

.shortcut-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.shortcut-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(168, 133, 247, 0.12);
  color: var(--tt-purple);
  flex-shrink: 0;
}

.shortcut-note {
  color: #94a3b8;
  font-size: 13px;
}

.shortcut-arrow {
  color: #64748b;
}

/* Danger zone */
.danger-panel {
  border-color: rgba(248, 113, 113, 0.2);
  background: rgba(248, 113, 113, 0.04);
}

.danger-title {
  color: #f87171;
}

.danger-note {
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid rgba(248, 113, 113, 0.4);
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.danger-btn:hover:not(:disabled) {
  background: rgba(248, 113, 113, 0.2);
}

.danger-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Loading (initial session check) */
.state-msg {
  max-width: 1180px;
  margin: 0 auto;
  padding: 100px 0;
  text-align: center;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(168, 133, 247, 0.25);
  border-top-color: #a855f7;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Auth gate (matches Watchlist pattern) */
.auth-gate {
  max-width: 420px;
  margin: 60px auto 0;
  text-align: center;
  padding: 40px 32px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.03);
}

.gate-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--tt-blue), var(--tt-purple));
  font-size: 24px;
  margin-bottom: 18px;
}

.auth-gate h2 {
  color: white;
  font-size: 19px;
  margin-bottom: 10px;
}

.auth-gate p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.gate-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Delete confirm modal */
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
}

.confirm-modal {
  position: relative;
  width: 100%;
  max-width: 360px;
  background: #0c0e18;
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 18px;
  padding: 28px 24px 24px;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.04);
  color: #94a3b8;
  cursor: pointer;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.confirm-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
  margin-bottom: 14px;
}

.confirm-modal h3 {
  color: white;
  font-size: 17px;
  margin-bottom: 8px;
}

.confirm-modal p {
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 22px;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.confirm-actions .secondary-btn,
.confirm-actions .danger-btn {
  flex: 1;
  justify-content: center;
}

@media (max-width: 640px) {
  .profile-page {
    padding: 28px 18px 60px;
  }

  .avatar-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>