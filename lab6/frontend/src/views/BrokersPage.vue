<template>
  <v-container>
    <BrokerCard v-for="broker in brokers" :broker="broker" :stocks="stocks" class="my-2"/>
  </v-container>
</template>

<script lang="ts" setup>
import {IBroker} from "@/interfaces/IBroker";
import {UserService} from "@/services/userService";
import websocketService from "@/services/websocketService";
import {onMounted, reactive, ref} from "vue";
import BrokerCard from "../components/BrokerCard/BrokerCard.vue";

const loginedUser = ref<IBroker | undefined>(undefined);
loginedUser.value = UserService.getCreatedInstance()?.getLoginedUser();

const stocks = ref();
const brokers = ref();

onMounted(() => {
  websocketService.emit('stocks');
  websocketService.emit('brokers');

  websocketService.on('stocks', data => {
    stocks.value = data;
  })

  websocketService.on('updateStocks', () => {
    websocketService.emit('stocks');
  })

  websocketService.on('brokers', data => {
    brokers.value = data;
  })
})


</script>
