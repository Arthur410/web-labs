<template>
  <router-view @loginSuccessEvent="handleLoginSuccess" @onExit="handleExit"/>
</template>

<script lang="ts" setup>
import router from "@/router";
import {UserService} from "@/services/userService";
import {onMounted} from "vue";

onMounted(() => {
  const savedUserInstance = localStorage.getItem('userInstance');

  if (savedUserInstance) {
    UserService.setInstance(JSON.parse(savedUserInstance));
  }

})

const handleLoginSuccess = () => {
  const savedUserInstance = localStorage.getItem('userInstance');

  if (savedUserInstance) {
    UserService.setInstance(JSON.parse(savedUserInstance));
    router.push('/brokers');
  }
}

const handleExit = () => {
  localStorage.clear();
  UserService.exit();
  router.push('/login');
}

</script>
