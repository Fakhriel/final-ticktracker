import { ref } from "vue";
import { getCoins } from "@/services/coingecko";

export function useCrypto() {
  const coins = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchCoins() {
    loading.value = true;
    error.value = null;

    try {
      coins.value = await getCoins();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  return {
    coins,
    loading,
    error,
    fetchCoins,
  };
}