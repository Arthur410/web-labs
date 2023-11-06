<template>
  <v-app>
    <default-bar :is-logined="isUserLogined" :balance="balance" @onExit="handleExit"/>

    <default-view @loginSuccessEvent="handleSuccessLogin" @onBrokerBalanceChange="handleBalanceChange" class="pa-0"/>
  </v-app>
</template>

<script lang="ts" setup>
import {UserService} from "@/services/userService";
import {onMounted, ref} from "vue";
import DefaultBar from './AppBar.vue'
import DefaultView from './View.vue'

const emits = defineEmits(['loginSuccessEvent', 'onBrokerBalanceChange', 'onExit']);
const isUserLogined = ref(false);

onMounted(() => {
  if (UserService.getCreatedInstance() !== null) {
    isUserLogined.value = true
    balance.value = <number>UserService.getCreatedInstance()?.getLoginedUser().initialValue;
  }
})

const handleSuccessLogin = () => {
  isUserLogined.value = true;
  emits('loginSuccessEvent');
  balance.value = <number>UserService.getCreatedInstance()?.getLoginedUser().initialValue;
}

const balance = ref(0);
const handleBalanceChange = () => {
  balance.value = <number>UserService.getCreatedInstance()?.getLoginedUser().initialValue;
}

const handleExit = () => {
  emits('onExit');
  isUserLogined.value = false;
}

</script>
