<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  coin: {
    type: Object,
    required: true,
  },
})

const website = computed(() => props.coin.links?.homepage?.filter(Boolean)[0] || null)
const whitepaper = computed(() => props.coin.links?.whitepaper || null)

const explorers = computed(() => (props.coin.links?.blockchain_site || []).filter(Boolean))
const showAllExplorers = ref(false)

const github = computed(() => (props.coin.links?.repos_url?.github || []).filter(Boolean)[0] || null)

const reddit = computed(() => props.coin.links?.subreddit_url || null)
const twitter = computed(() =>
  props.coin.links?.twitter_screen_name
    ? `https://twitter.com/${props.coin.links.twitter_screen_name}`
    : null
)
const facebook = computed(() =>
  props.coin.links?.facebook_username
    ? `https://facebook.com/${props.coin.links.facebook_username}`
    : null
)
const telegram = computed(() =>
  props.coin.links?.telegram_channel_identifier
    ? `https://t.me/${props.coin.links.telegram_channel_identifier}`
    : null
)
const hasCommunity = computed(() => reddit.value || twitter.value || facebook.value || telegram.value)

const searchTwitterUrl = computed(
  () => `https://twitter.com/search?q=%24${props.coin.symbol?.toUpperCase() || ''}`
)

const categories = computed(() => (props.coin.categories || []).filter(Boolean))
const showAllCategories = ref(false)

const copied = ref(false)
function copyId() {
  navigator.clipboard?.writeText(props.coin.id)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1500)
}
</script>

<template>
  <section class="links">
    <h2>Info</h2>

    <div class="row" v-if="website || whitepaper">
      <span class="label">Website</span>
      <div class="value">
        <a v-if="website" :href="website" target="_blank" rel="noopener noreferrer" class="pill">
          Homepage
        </a>
        <a v-if="whitepaper" :href="whitepaper" target="_blank" rel="noopener noreferrer" class="pill">
          Whitepaper
        </a>
      </div>
    </div>

    <div class="row" v-if="explorers.length">
      <span class="label">Explorers</span>
      <div class="value wrap">
        <a :href="explorers[0]" target="_blank" rel="noopener noreferrer" class="pill">
          Explorer
        </a>

        <template v-if="explorers.length > 1">
          <a
            v-for="(url, i) in explorers.slice(1)"
            v-show="showAllExplorers"
            :key="url + i"
            :href="url"
            target="_blank"
            rel="noopener noreferrer"
            class="pill"
          >
            Explorer {{ i + 2 }}
          </a>

          <button type="button" class="pill toggle" @click="showAllExplorers = !showAllExplorers">
            {{ showAllExplorers ? 'Show less' : `+${explorers.length - 1} more` }}
            <svg class="chevron" :class="{ open: showAllExplorers }" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </template>
      </div>
    </div>

    <div class="row" v-if="hasCommunity">
      <span class="label">Community</span>
      <div class="value">
        <a v-if="reddit" :href="reddit" target="_blank" rel="noopener noreferrer" class="icon-btn" aria-label="Reddit">R</a>
        <a v-if="twitter" :href="twitter" target="_blank" rel="noopener noreferrer" class="icon-btn" aria-label="Twitter / X">X</a>
        <a v-if="facebook" :href="facebook" target="_blank" rel="noopener noreferrer" class="icon-btn" aria-label="Facebook">f</a>
        <a v-if="telegram" :href="telegram" target="_blank" rel="noopener noreferrer" class="icon-btn" aria-label="Telegram">T</a>
      </div>
    </div>

    <div class="row">
      <span class="label">Search on</span>
      <div class="value">
        <a :href="searchTwitterUrl" target="_blank" rel="noopener noreferrer" class="pill">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          Twitter
        </a>
      </div>
    </div>

    <div class="row" v-if="github">
      <span class="label">Source Code</span>
      <div class="value">
        <a :href="github" target="_blank" rel="noopener noreferrer" class="pill">Github</a>
      </div>
    </div>

    <div class="row">
      <span class="label">API ID</span>
      <div class="value">
        <button type="button" class="pill copy" @click="copyId">
          {{ coin.id }}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.6" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" stroke-width="1.6" />
          </svg>
          <span v-if="copied" class="copied-tag">Copied</span>
        </button>
      </div>
    </div>

    <div class="row" v-if="categories.length">
      <span class="label">Categories</span>
      <div class="value wrap">
        <span class="pill static">{{ categories[0] }}</span>

        <template v-if="categories.length > 1">
          <span
            v-for="(cat, i) in categories.slice(1)"
            v-show="showAllCategories"
            :key="cat + i"
            class="pill static"
          >
            {{ cat }}
          </span>

          <button type="button" class="pill toggle" @click="showAllCategories = !showAllCategories">
            {{ showAllCategories ? 'Show less' : `+${categories.length - 1} more` }}
            <svg class="chevron" :class="{ open: showAllCategories }" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.links {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  padding: 24px;
}

.links h2 {
  color: white;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.row:last-child {
  border-bottom: none;
  padding-bottom: 4px;
}

.label {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.value {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.value.wrap {
  flex-wrap: wrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.pill:hover {
  border-color: rgba(168, 133, 247, 0.4);
  background: rgba(168, 133, 247, 0.08);
  color: white;
}

.pill.static {
  cursor: default;
}

.pill.static:hover {
  border-color: rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}

.pill.toggle {
  color: #a78bfa;
  border-color: rgba(168, 133, 247, 0.3);
  background: rgba(168, 133, 247, 0.08);
}

.pill.copy {
  position: relative;
  font-family: inherit;
}

.pill.copy svg {
  width: 13px;
  height: 13px;
}

.copied-tag {
  position: absolute;
  bottom: calc(100% + 6px);
  right: 0;
  background: #1e293b;
  color: #22c55e;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

.search-icon {
  width: 13px;
  height: 13px;
}

.chevron {
  width: 9px;
  height: 6px;
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(180deg);
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s, transform 0.2s;
}

.icon-btn:hover {
  border-color: rgba(168, 133, 247, 0.4);
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 560px) {
  .row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .value {
    justify-content: flex-start;
    width: 100%;
  }
}
</style>