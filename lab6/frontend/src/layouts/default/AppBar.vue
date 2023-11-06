<template>
  <v-container>
    <v-app-bar flat class="position-relative">
      <v-row align-content="space-between">
        <v-col>
          <router-link v-if="isLogined" to="/brokers">
            <v-btn id="brokers" class="ma-1" variant="outlined">
              Брокеры
            </v-btn>
          </router-link>

          <router-link v-if="isLogined" to="/trade">
            <v-btn id="trade" class="ma-1" variant="outlined">
              Торговля
            </v-btn>
          </router-link>

          <router-link v-if="!isLogined" to="/login">
            <v-btn id="login" class="ma-1" variant="outlined">
              Логин
            </v-btn>
          </router-link>
        </v-col>
        <v-col>
          <img src="../../assets/images/stocksLogo.png" alt="Logo"
               style="position: absolute; top: 10px; left:50%; transform:translateX(-50%); width: 100px; height: 50px">
        </v-col>
        <v-col v-if="isLogined" style="display: flex; align-items: center; justify-content: end; gap: 15px;">
          <span class="font-weight-bold">{{getLoginedUser.name}}</span>
          <span id="balance">Баланс: {{balance.toFixed(2)}}</span>
          <v-btn id="exit" color="red" @click="exit">Выйти</v-btn>
        </v-col>
      </v-row>
    </v-app-bar>
  </v-container>
</template>

<script lang="ts" setup>
import router from "@/router";
import {UserService} from "@/services/userService";
import {computed, ref} from "vue";
import {IBroker} from "@/interfaces/IBroker";

const emits = defineEmits(['onExit'])
const props = defineProps<{
  isLogined: boolean,
  balance: number,
}>()

const getLoginedUser = computed((): IBroker | null => {
  if (props.isLogined) {
    return <IBroker>UserService.getCreatedInstance()?.getLoginedUser();
  }
})

const exit = () => {
  if (confirm('Вы уверены?')) {
    emits('onExit')
  }
}
</script>
