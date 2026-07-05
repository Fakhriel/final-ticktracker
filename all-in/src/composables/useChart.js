import { ref } from "vue";
import { getChart, getOHLC } from "@/services/coingecko";

const chartData = ref([]);
const loading = ref(false);
const error = ref("");

const timeframe = ref(7);
const chartType = ref("line");

/**
 * Load Line Chart
 */

async function loadLineChart(id) {

    loading.value = true;
    error.value = "";

    try {

        const data = await getChart(id, timeframe.value);

        chartData.value = data.prices.map((price) => ({

            time: price[0] / 1000,

            value: price[1],

        }));

    } catch (err) {

        error.value = err.message;

    } finally {

        loading.value = false;

    }

}

/**
 * Load Candlestick
 */

async function loadCandlestick(id) {

    loading.value = true;
    error.value = "";

    try {

        const data = await getOHLC(id, timeframe.value);

        chartData.value = data.map((item) => ({

            time: item[0] / 1000,

            open: item[1],

            high: item[2],

            low: item[3],

            close: item[4],

        }));

    } catch (err) {

        error.value = err.message;

    } finally {

        loading.value = false;

    }

}

/**
 * Main Loader
 */

async function loadChart(id) {

    if (chartType.value === "line") {

        await loadLineChart(id);

    } else {

        await loadCandlestick(id);

    }

}

/**
 * Change Timeframe
 */

async function changeTimeframe(id, days) {

    timeframe.value = days;

    await loadChart(id);

}

/**
 * Change Chart Type
 */

async function changeChartType(id, type) {

    chartType.value = type;

    await loadChart(id);

}

export function useChart() {

    return {

        chartData,

        loading,

        error,

        timeframe,

        chartType,

        loadChart,

        changeTimeframe,

        changeChartType,

    };

}