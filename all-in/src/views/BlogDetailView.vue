<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useArticles } from '@/composables/useArticles'
import { formatDate } from '@/services/articles'

const route = useRoute()
const { articles, loading, error, fetchArticles } = useArticles()

const article = computed(() =>
  articles.value.find((a) => a.slug === route.params.slug)
)

onMounted(fetchArticles)
</script>

<template>
  <main class="detail-page">
    <RouterLink to="/blog" class="back-link">&larr; Back to Market Insights</RouterLink>

    <div v-if="loading" class="loading">
      <span class="spinner"></span>
      Loading article...
    </div>

    <div v-else-if="error" class="empty">
      <p>{{ error }}</p>
      <button type="button" class="retry-btn" @click="fetchArticles">Retry</button>
    </div>

    <div v-else-if="!article" class="empty">
      <p>Article not found - it may have shifted as market data refreshed.</p>
      <RouterLink to="/blog" class="retry-btn">Back to Market Insights</RouterLink>
    </div>

    <article v-else>
      <span class="tag" :class="article.tagColor">{{ article.tag }}</span>
      <h1>{{ article.title }}</h1>
      <span class="date">{{ formatDate(article.publishedAt) }} &middot; Data via CoinGecko</span>

      <div v-if="article.stats" class="stats-grid">
        <div v-for="stat in article.stats" :key="stat.label" class="stat">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.value }}</span>
        </div>
      </div>

      <section v-for="section in article.sections" :key="section.heading" class="section">
        <h2>{{ section.heading }}</h2>
        <p v-for="(p, i) in section.paragraphs" :key="i">{{ p }}</p>
      </section>

      <section v-if="article.coinList" class="coin-list">
        <div v-for="coin in article.coinList" :key="coin.id" class="coin-row">
          <span class="coin-rank" v-if="coin.rank">#{{ coin.rank }}</span>
          <img :src="coin.image" :alt="coin.name" class="coin-icon" />
          <div class="coin-name-block">
            <span class="coin-name">{{ coin.name }}</span>
            <span class="coin-symbol">{{ coin.symbol }}</span>
          </div>
          <span class="coin-price">{{ coin.price }}</span>
          <span
            class="coin-change"
            :class="(coin.change || '').startsWith('-') ? 'down' : 'up'"
          >
            {{ coin.change }}
          </span>
        </div>
      </section>
    </article>
  </main>
</template>

<style scoped>
.detail-page {
  --tt-blue: #4c8dff;
  --tt-purple: #a855f7;
  --tt-pink: #e94ff0;
  max-width: 760px;
  margin: auto;
  padding: 40px 32px 100px;
  background: #06070f;
  min-height: 100vh;
}

.back-link {
  display: inline-block;
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 28px;
  transition: color 0.2s;
}

.back-link:hover {
  color: white;
}

.loading,
.empty {
  color: #94a3b8;
  padding: 60px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(168, 133, 247, 0.25);
  border-top-color: var(--tt-purple);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255, 255, 255, 0.03);
  color: white;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
}

.tag {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 16px;
}

.tag.up { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
.tag.down { background: rgba(248, 113, 113, 0.15); color: #f87171; }
.tag.neutral { background: rgba(168, 133, 247, 0.15); color: #c4b5fd; }

h1 {
  color: white;
  font-size: 30px;
  line-height: 1.3;
  margin-bottom: 12px;
}

.date {
  display: block;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.02);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  color: #64748b;
  font-size: 12px;
}

.stat-value {
  color: white;
  font-size: 17px;
  font-weight: 700;
}

.section {
  margin-bottom: 28px;
}

.section h2 {
  color: white;
  font-size: 18px;
  margin-bottom: 10px;
}

.section p {
  color: #cbd5e1;
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 10px;
}

.coin-list {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  overflow: hidden;
}

.coin-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.coin-row:last-child {
  border-bottom: none;
}

.coin-rank {
  color: #64748b;
  font-size: 12px;
  width: 28px;
}

.coin-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
}

.coin-name-block {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.coin-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.coin-symbol {
  color: #64748b;
  font-size: 12px;
}

.coin-price {
  color: #cbd5e1;
  font-size: 14px;
}

.coin-change {
  font-size: 13px;
  font-weight: 700;
  min-width: 70px;
  text-align: right;
}

.coin-change.up { color: #4ade80; }
.coin-change.down { color: #f87171; }

@media (max-width: 640px) {
  .detail-page {
    padding: 28px 18px 80px;
  }

  h1 {
    font-size: 24px;
  }
}
</style>