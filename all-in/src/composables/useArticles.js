import { ref } from 'vue'
import { getCoins, getGlobal, getTrending } from '@/services/coingecko'
import { buildArticles } from '@/services/articles'

export function useArticles() {
  const articles = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchArticles() {
    loading.value = true
    error.value = null

    try {
      const [coins, global, trending] = await Promise.all([
        getCoins(),
        getGlobal(),
        getTrending(),
      ])

      articles.value = buildArticles({ coins, global, trending })
    } catch (err) {
      error.value = err.message || 'Failed to load articles.'
    } finally {
      loading.value = false
    }
  }

  return {
    articles,
    loading,
    error,
    fetchArticles,
  }
}