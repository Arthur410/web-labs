<template>
  <v-container>
    <v-row>
      <h1>{{ tradeDateStart }}</h1>
    </v-row>
    <v-row>
      <v-card variant="tonal" class="pa-3 rounded w-100 my-2">
        <v-card-title>Купить</v-card-title>
        <v-col v-if="tradingStocks?.length !== 0" style="display:flex;">
          <v-col cols="2" v-for="tradingStock in tradingStocks" class="d-flex flex-column justify-center align-center">
            <Modal :data="tradingStock.stock.symbol">
              <img style="max-width:100%; height: 50px; margin-bottom: 15px;" :src="getPathToImage(tradingStock.stock.symbol)" alt="logo">
            </Modal>
            <span>{{tradingStock.stock.symbol}} {{tradingStock.amount}} шт.</span>
            <span>Текущий курс: {{getLastStockPrice(getStockFromSymbol(tradingStock.stock.symbol))}}</span>

            <div class="d-flex flex-column align-center justify-center">
              <v-row class="py-3">
                <div class="d-flex flex-column px-2" style="gap:5px">
                  <v-btn :id="tradingStock.stock.symbol + 'plusBuy'" density="compact" icon="mdi-plus" @click="handlePlusBuyButton(tradingStock)"></v-btn>
                  <v-btn :id="tradingStock.stock.symbol + 'minusBuy'" density="compact" icon="mdi-minus" @click="handleMinusBuyButton(tradingStock)"></v-btn>
                </div>
                <div class="d-flex align-center">
                  <v-btn :id="tradingStock.stock.symbol + 'buy'" @click="handleBuyButton(tradingStock)" variant="elevated">
                    {{buyCountArray.filter(buyStock => buyStock.symbol === tradingStock.stock.symbol)[0].count}} Купить
                  </v-btn>
                </div>
              </v-row>
            </div>

          </v-col>
        </v-col>
        <v-col v-else>
          Пока никто не выложил на продажу ни одной акции...
        </v-col>
      </v-card>
    </v-row>
    <v-row>
      <v-card variant="tonal" class="pa-3 rounded w-100 my-2">
        <v-card-title>Продать</v-card-title>
        <v-row class="pa-2">
          <v-col v-if="broker.ownedStocks.length !== 0 && stocks" style="display: flex">
            <v-col  cols="2" v-for="stock in broker.ownedStocks" class="d-flex flex-column justify-center align-center">
              <Modal :data="stock.symbol">
                <img style="max-width:100%; height: 50px; margin-bottom: 15px;" :src="getPathToImage(stock.symbol)" alt="logo">
              </Modal>

              <span>{{stock.symbol}} {{stock.amount}} шт.</span>
              <span>Потрачено: {{stock.spendMoney.toFixed(2)}}</span>
              <span style="text-align: center">По текущему курсу: {{stockChangeCoef(stock).currentPrice.toFixed(2)}}</span>
              <span :style="{color: stockChangeCoef(stock).color}">{{stockChangeCoef(stock).percentage.toFixed(2)}} %</span>
              <div class="d-flex flex-column align-center justify-center my-2">
                <v-row class="py-3">
                  <div class="d-flex flex-column px-2" style="gap:5px">
                    <v-btn :id="stock.symbol + 'plusSell'" density="compact" icon="mdi-plus" @click="handlePlusSellButton(stock)"></v-btn>
                    <v-btn :id="stock.symbol + 'minusSell'" density="compact" icon="mdi-minus" @click="handleMinusSellButton(stock)"></v-btn>
                  </div>
                  <div class="d-flex align-center">
                    <v-btn :id="stock.symbol + 'sell'" @click="handleSellButton(stock)" variant="elevated">
                      {{sellCountArray.filter(sellStock => sellStock.symbol === stock.symbol)[0].count}} Продать
                    </v-btn>
                  </div>
                </v-row>
              </div>
            </v-col>
          </v-col  >
          <v-col v-else>
            У вас нет акций в портфеле...
          </v-col>
        </v-row>
      </v-card>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import {IBroker} from "@/interfaces/IBroker";
import {UserService} from "@/services/userService";
import {computed, onMounted, ref} from "vue";
import websocketService from "@/services/websocketService";
import {IStock} from "@/interfaces/IStock";
import {IOwnedStock} from "@/interfaces/IOwnedStock";
import Modal from "@/components/Modal/Modal.vue"

const tradeDateStart = computed(() => {
  if (tradeDate.value === null) return 'Торговля еще не началась';

  return `Торговля началась ` + new Date(tradeDate.value).toLocaleDateString('ru')
})

const stocks = ref<IStock[]>();
const tradingStocks = ref<ITradingStock[]>();
const emits = defineEmits(['onBrokerBalanceChange'])

const broker = ref<IBroker>({
  name: null,
  initialValue: null,
  quote: null,
  password: null,
  ownedStocks: [{
    symbol: null,
    amount: null,
    spendMoney: null
  }]
});
const tradeDate = ref();

const sellCountArray = ref<{
  symbol: string,
  count: number
}[]>([]);

const buyCountArray = ref<{
  symbol: string,
  count: number
}[]>([]);


onMounted(() => {
  websocketService.emit('getStartTradeDate');
  websocketService.emit('stocks');
  broker.value = UserService.getCreatedInstance()?.getLoginedUser();

  websocketService.on('getStartTradeDate', date => {
    tradeDate.value = date;
  });

  websocketService.on('tradeStart', () => {
    playAudio('tradeStart')
  })

  websocketService.on('tradeEnd', () => {
    tradeDate.value = null;
    playAudio('tradeEnd')
  })

  websocketService.on('stocks', data => {
    stocks.value = data;
    stocks.value?.forEach(stock => {
      sellCountArray.value.push({
        symbol: stock.symbol,
        count: 0
      })
    })
  })

  websocketService.emit('getTradeStock');
  websocketService.on('getTradeStock', data => {
    tradingStocks.value = data;
    tradingStocks.value?.forEach(tradingStock => {
      buyCountArray.value.push({
        symbol: tradingStock.stock.symbol,
        count: 0
      })
    })
  });

  websocketService.on('updateStockData', data => {
    stocks.value = data;
  })

})

const getStockFromSymbol = (symbol: string): IStock => {
  return stocks.value.filter(propsStock => propsStock.symbol === symbol)[0] as IStock;
}

const getLastStockPrice = (stock: IStock) => {
  return +stock.historicalData[stock.historicalData.length - 1].price.split('$')[1];
}

const stockChangeCoef = (stock) => {
  const findedStock = getStockFromSymbol(stock.symbol);
  const lastStockPrice = getLastStockPrice(findedStock);

  const stockCostWithCurrentAmount = lastStockPrice * stock.amount;
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

const getPathToImage = (symbol: string) => {
  return new URL(`../assets/images/${symbol}.png`, import.meta.url).href
}

const handlePlusSellButton = (stock: IOwnedStock) => {
  const currentStock = sellCountArray.value.filter(sellStock => sellStock.symbol === stock.symbol)[0];
  if (currentStock.count === stock.amount) return;

  currentStock.count += 1
}

const handleMinusSellButton = (stock: IOwnedStock) => {
  const currentStock = sellCountArray.value.filter(sellStock => sellStock.symbol === stock.symbol)[0];
  if (currentStock.count === 0) return;

  currentStock.count -= 1
}

function playAudio(name) {
  const audio = new Audio();
  audio.src = new URL(`../assets/sounds/${name}.mp3`, import.meta.url).href;
  audio.autoplay = true;
}

const handleSellButton = (ownedStock: IOwnedStock) => {
  if (tradeDate.value === null) {
    alert('Торговля еще не началась!');
    return;
  }

  const sellStock = sellCountArray.value.filter(sellStock => sellStock.symbol === ownedStock.symbol)[0];
  const stock = getStockFromSymbol(ownedStock.symbol);
  const lastStockPrice = getLastStockPrice(stock);

  if (ownedStock.amount >= sellStock.count) {
    ownedStock.amount -= sellStock.count;
    if (ownedStock.amount === 0) {
      broker.value.ownedStocks = broker.value.ownedStocks.filter((stock) => stock.symbol !== ownedStock.symbol);
    }
  } else {
    alert('Вы хотите продать слишком много акций!');
    return;
  }

  websocketService.emit('addTradeStock', {
    stock: stock,
    amount: sellStock.count
  })

  websocketService.on('addTradeStock', data => {
    if (data !== null) {
      websocketService.emit('getTradeStock');
      websocketService.on('getTradeStock', data => {
        tradingStocks.value = data;
      });
    }
  })

  ownedStock.spendMoney -= lastStockPrice * sellStock.count;

  broker.value.initialValue += lastStockPrice * sellStock.count;
  broker.value.initialValue = broker.value.initialValue;

  websocketService.emit('updateBroker', broker.value);
  UserService.setInstance(broker.value);

  sellStock.count = 0;

  emits('onBrokerBalanceChange');

  playAudio('sell');
}

const handlePlusBuyButton = (tradingStock: ITradingStock) => {
  const currentStock = buyCountArray.value.filter(sellStock => sellStock.symbol === tradingStock.stock.symbol)[0];
  if (currentStock.count >= tradingStock.amount) return;

  currentStock.count += 1
}

const handleMinusBuyButton = (tradingStock: ITradingStock) => {
  const currentStock = buyCountArray.value.filter(sellStock => sellStock.symbol === tradingStock.stock.symbol)[0];
  if (currentStock.count === 0) return;

  currentStock.count -= 1
}

const handleBuyButton = (tradingStock: ITradingStock) => {
  if (tradeDate.value === null) {
    alert('Торговля еще не началась!');
    return;
  }

  const currentTradeStock = buyCountArray.value.filter(sellStock => sellStock.symbol === tradingStock.stock.symbol)[0];

  const currentStock = getStockFromSymbol(currentTradeStock.symbol);
  const currentStockPrice = getLastStockPrice(currentStock);
  const spendMoney = currentStockPrice * currentTradeStock.count;

  const boughtStock: IOwnedStock = {
    symbol: currentTradeStock.symbol,
    amount: currentTradeStock.count,
    spendMoney
  }

  if (spendMoney > broker.value.initialValue) {
    alert(`У вас недостаточно средств на счету! Не хватает ${spendMoney - broker.value.initialValue}`);
    return;
  }

  const newTradingStocks = [];

  tradingStocks.value?.forEach(stock => {
    if (stock.stock.symbol === tradingStock.stock.symbol) {
      if (stock.amount < currentTradeStock.count) {
        alert('Вы хотите купить больше, чем есть на складе!');
        return;
      } else {
        stock.amount -= currentTradeStock.count;

        if (stock.amount === 0) {
          websocketService.emit('removeTradeStock', stock.stock.symbol);
        } else {
          newTradingStocks.push(stock);
        }
      }
    } else {
      newTradingStocks.push(stock);
    }
  });

  tradingStocks.value = newTradingStocks;

  broker.value.initialValue -= spendMoney;

  const alreadyHasStock = broker.value.ownedStocks.filter(ownedStock => ownedStock.symbol === boughtStock.symbol).length !== 0;

  // Обновляем данные у брокера
  if (alreadyHasStock) {
    broker.value.ownedStocks.forEach(ownedStock => {
      if (ownedStock.symbol === boughtStock.symbol) {
        ownedStock.amount += boughtStock.amount;
        ownedStock.spendMoney += boughtStock.spendMoney;
      }
    })
  } else {
    broker.value.ownedStocks.push(boughtStock);
  }

  websocketService.emit('updateBroker', broker.value);
  UserService.setInstance(broker.value);

  emits('onBrokerBalanceChange');

  currentTradeStock.count = 0;

  playAudio('buy');
}

</script>
