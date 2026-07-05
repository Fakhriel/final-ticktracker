<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useArticles } from '@/composables/useArticles'
import { formatDate } from '@/services/articles'

const { articles, loading, error, fetchArticles } = useArticles()

onMounted(fetchArticles)
</script>

<template>
  <main class="blog-page">
    <div class="page-head">
      <h1>Market Insights</h1>
      <p class="subtitle">
        Auto-generated from live CoinGecko data - refreshed every time you visit.
      </p>
    </div>

    <div v-if="loading" class="loading">
      <span class="spinner"></span>
      Generating articles from live market data...
    </div>

    <div v-else-if="error" class="empty">
      <p>{{ error }}</p>
      <button type="button" class="retry-btn" @click="fetchArticles">Retry</button>
    </div>

    <div v-else-if="!articles.length" class="empty">
      No articles available right now.
    </div>

    <div v-else class="grid">
      <RouterLink
        v-for="article in articles"
        :key="article.slug"
        :to="`/blog/${article.slug}`"
        class="card"
      >
        <span class="tag" :class="article.tagColor">{{ article.tag }}</span>
        <h2>{{ article.title }}</h2>
        <p class="excerpt">{{ article.excerpt }}</p>
        <span class="date">{{ formatDate(article.publishedAt) }}</span>
      </RouterLink>
    </div>

    <p class="source-note">Data source: CoinGecko API (public market data).</p>
  </main>
</template>

<style scoped>
.blog-page {
  --tt-blue: #4c8dff;
  --tt-purple: #a855f7;
  --tt-pink: #e94ff0;
  max-width: 1100px;
  margin: auto;
  padding: 40px 32px 80px;
  background: #06070f;
  min-height: 100vh;
}

.page-head {
  margin-bottom: 32px;
}

h1 {
  color: white;
  font-size: 34px;
  font-weight: 700;
  margin-bottom: 8px;
}

.subtitle {
  color: #94a3b8;
  font-size: 15px;
}

.loading,
.empty {
  color: #94a3b8;
  padding: 60px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 15px;
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
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.03);
  text-decoration: none;
  transition: all 0.2s;
}

.card:hover {
  border-color: rgba(168, 133, 247, 0.4);
  transform: translateY(-2px);
}

.tag {
  align-self: flex-start;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.tag.up {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.tag.down {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
}

.tag.neutral {
  background: rgba(168, 133, 247, 0.15);
  color: #c4b5fd;
}

.card h2 {
  color: white;
  font-size: 19px;
  line-height: 1.35;
}

.excerpt {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
}

.date {
  color: #64748b;
  font-size: 12px;
}

.source-note {
  margin-top: 40px;
  text-align: center;
  color: #475569;
  font-size: 13px;
}

@media (max-width: 640px) {
  .blog-page {
    padding: 28px 18px 60px;
  }

  h1 {
    font-size: 26px;
  }
}
</style>