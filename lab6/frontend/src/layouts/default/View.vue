<template>
  <v-main>
    <router-view @loginSuccessEvent="emits('loginSuccessEvent')"
                 @onBrokerBalanceChange="emits('onBrokerBalanceChange')"
    />
  </v-main>
</template>

<script lang="ts" setup>

const emits = defineEmits(['loginSuccessEvent', 'onBrokerBalanceChange'])
</script>
