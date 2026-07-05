<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import {
  createChart,
  LineSeries,
  CandlestickSeries,
} from "lightweight-charts";

import { useChart } from "@/composables/useChart";

import TimeframeSelector from "./TimeframeSelector.vue";
import ChartToolbar from "./ChartToolbar.vue";

const props = defineProps({
  coinId: {
    type: String,
    required: true,
  },
});

const chartContainer = ref(null);

let chart = null;
let series = null;

const {
  chartData,
  loading,
  error,
  chartType,
  timeframe,
  loadChart,
  changeTimeframe,
  changeChartType,
} = useChart();

function buildChart() {
  if (!chartContainer.value) return;

  chart?.remove();

  chart = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: 450,

    layout: {
      background: {
        color: "transparent",
      },
      textColor: "#94a3b8",
    },

    grid: {
      vertLines: {
        color: "rgba(148, 163, 184, 0.08)",
      },
      horzLines: {
        color: "rgba(148, 163, 184, 0.08)",
      },
    },

    crosshair: {
      mode: 0,
    },

    rightPriceScale: {
      borderVisible: false,
    },

    timeScale: {
      borderVisible: false,
    },
  });

  if (chartType.value === "line") {
    series = chart.addSeries(LineSeries);
  } else {
    series = chart.addSeries(CandlestickSeries);
  }

  series.setData(chartData.value);

  chart.timeScale().fitContent();
}

watch(chartData, async () => {
  await nextTick();

  buildChart();
});

watch(
  () => props.coinId,
  async () => {
    await loadChart(props.coinId);
  }
);

onMounted(async () => {
  await loadChart(props.coinId);
});
</script>

<template>
  <section class="chart-wrapper">
    <ChartToolbar
      :chart-type="chartType"
      @change="type => changeChartType(props.coinId, type)"
    />

    <TimeframeSelector
      :timeframe="timeframe"
      @change="days => changeTimeframe(props.coinId, days)"
    />

    <div
      v-if="loading"
      class="loading"
    >
      Loading chart...
    </div>

    <div
      v-else-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <div
      ref="chartContainer"
      class="chart"
    />
  </section>
</template>

<style scoped>

.chart-wrapper{

margin-top:0;

background:rgba(255, 255, 255, 0.03);

border: 1px solid rgba(148, 163, 184, 0.12);

padding:20px;

border-radius:16px;

}

.chart{

width:100%;

height:450px;

}

.loading{

padding:50px;

text-align:center;

font-weight:600;

color:#94a3b8;

}

.error{

padding:50px;

text-align:center;

color:#ef4444;

font-weight:600;

}

</style>