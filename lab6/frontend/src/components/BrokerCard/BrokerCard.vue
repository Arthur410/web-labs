<template>
  <v-card variant="tonal" class="pa-3 rounded">
    <v-card-text >
      <v-row style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div>
          <v-card-title class="py-0">
            {{broker.name}}
          </v-card-title>
          <v-card-subtitle>{{broker.quote}}</v-card-subtitle>
        </div>
        <div style="display: flex; flex-direction: column">
          <span>Текущий баланс:</span>
          <span>{{broker.initialValue.toFixed(2)}}</span>
        </div>
      </v-row>

      <v-row class="border pa-2 rounded">
        <v-col cols="2" v-for="stock in broker.ownedStocks" class="d-flex flex-column justify-center align-center">
          <img style="max-width:100%; height: 50px; margin-bottom: 15px;" :src="getPathToImage(stock.symbol)" alt="logo">
          <span>{{stock.symbol}} {{stock.amount}} шт.</span>
          <span>Потрачено: {{stock.spendMoney}}</span>
          <span style="text-align: center">По текущему курсу: {{stockChangeCoef(stock).currentPrice.toFixed(2)}}</span>
          <span :id="stock.symbol + 'percentage'" :style="{color: stockChangeCoef(stock).color}">{{stockChangeCoef(stock).percentage.toFixed(2)}} %</span>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { IBroker } from "@/interfaces/IBroker";
import { IStock } from "@/interfaces/IStock";
import { onMounted, ref } from "vue";

const stocks  = ref<IStock[]>([]);

const props = defineProps<{
  broker: IBroker,
  stocks: IStock[]
}>()

const getPathToImage = (symbol: string) => {
  return new URL(`../../assets/images/${symbol}.png`, import.meta.url).href
}

const totalGainedOrLostMoney = ref(0);

onMounted(() => {
  props.broker.ownedStocks.forEach(stock => {
    const findedStock = props.stocks.filter(propsStock => propsStock.symbol === stock.symbol)[0] as IStock;
    const lastStockPrice = +findedStock.historicalData[findedStock.historicalData.length - 1].price.split('$')[1];
    const stockCostWithCurrentAmount = +(lastStockPrice * stock.amount).toFixed(2)
    const stockCost = stock.spendMoney;
    totalGainedOrLostMoney.value += (stockCostWithCurrentAmount - stockCost)
  })
})

const stockChangeCoef = (stock) => {
  const findedStock = props.stocks.filter(propsStock => propsStock.symbol === stock.symbol)[0] as IStock;
  const lastStockPrice = +findedStock.historicalData[findedStock.historicalData.length - 1].price.split('$')[1];
  const stockCostWithCurrentAmount = +(lastStockPrice * stock.amount).toFixed(2)
  const stockCost = stock.spendMoney;
  let coefColor;

  const result = 100 - stockCost / stockCostWithCurrentAmount * 100;

  if (result === 0) {
    coefColor = 'gray'
  } else if (result < 0) {
    coefColor = 'red'
  } else if (result > 0) {
    coefColor = 'green'
  }

  return {
    color: coefColor,
    currentPrice: stockCostWithCurrentAmount,
    percentage: result,
  }
}

</script>

