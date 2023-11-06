<template>
  <v-container>
    <h1 style="text-align:center; font-size:24px">Логин</h1>
    <v-form v-model="isValid">
      <v-container>
        <v-row class="justify-center flex">
          <v-col
            cols="12"
            md="4"
            style="text-align: center"
          >

            <v-text-field
              :error="isError"
              v-model="userName"
              :counter="10"
              label="Введите имя"
              :rules="[rules.required]"
              required
              hide-details
            ></v-text-field>

            <div class="ma-2"></div>

            <v-text-field
              :error="isError"
              style="position: relative"
              :append-icon="isPasswordShowed ? 'mdi-eye' : 'mdi-eye-off'"
              v-model="password"
              :counter="10"
              :type="isPasswordShowed ? 'text' : 'password'"
              label="Введите пароль"
              :rules="[rules.required]"
              required
              hide-details
              @click:append="isPasswordShowed = !isPasswordShowed"
            ></v-text-field>

            <div class="ma-2"></div>

            <v-btn id="loginButton" variant="outlined" @click="handleLogin">Войти</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, reactive } from 'vue';
import websocketService from "@/services/websocketService";
import { IBroker } from "@/interfaces/IBroker";
import { UserService } from "@/services/userService";
import router from "@/router";

const rules = {
    required: value => !!value || 'Field is required',
};
const totalUsers = ref<IBroker[]>([]);
const password = ref('');
const userName = ref('')

const isValid = ref(true);
const isPasswordShowed = ref(false);
const isError = ref(false);

const emits = defineEmits(['loginSuccessEvent']);

onMounted(async () => {
  if (UserService.getCreatedInstance() !== null) {
    await router.push('/brokers');
  }

  websocketService.emit('brokers');

  await websocketService.on('brokers', data => {
    totalUsers.value = data;
  })
})

const handleLogin = () => {
  websocketService.emit('login', {
    name: userName.value,
    password: password.value,
  })

  websocketService.on('loginSuccess', loginedUser => {
    UserService.setInstance(loginedUser);
    emits('loginSuccessEvent');
  })

  websocketService.on('loginFailure', loginedUser => {
    isError.value = true;
    alert('Логин или пароль неправильные');
  })
}

</script>

<style>
.v-input__append {
  position: absolute;
  top: 50%;
  transform:translateY(-50%);
  right: 5px;
}
</style>
