<template>
  <v-dialog width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" style="height:60px; padding-bottom: 5px;">
        <slot></slot>
      </v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card :title="`Статистика ${stockForChart?.symbol}`">
        <v-card-text>
          <Line :data="chartData" :options="options" />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="red"
            text="Закрыть"
            @click="isActive.value = false"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts" setup>
import {IStock} from "@/interfaces/IStock";
import websocketService from "@/services/websocketService";
import {computed, onBeforeMount, onMounted, ref} from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps<{
  data: string,
}>()

const stockForChart = ref<IStock>()

const labels = computed(() => {
  return stockForChart.value?.historicalData.map((dataPoint) => dataPoint.date);
})

const dataPoints = computed(() => {
  return stockForChart.value?.historicalData.map((dataPoint) =>
    parseFloat(dataPoint.price.replace('$', ''))
  );
})

const chartData = computed(() => {
  return {
    labels: labels.value,
    datasets: [
      {
        label: 'Цена акции',
        data: dataPoints.value,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
})

const options = computed(() => {
  return {
    responsive: true,

    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Статистика изменения курса ' + stockForChart.value?.name,
      },
    },
  }
})

onBeforeMount( () => {
  websocketService.emit('stocks');

  websocketService.on('stocks', data => {
    stockForChart.value = data.filter(propsStock => propsStock.symbol === props.data)[0];
  })

  websocketService.on('updateStockData', data => {
    stockForChart.value = data.filter(propsStock => propsStock.symbol === props.data)[0]
  })
})

</script>

<style scoped>

</style>
