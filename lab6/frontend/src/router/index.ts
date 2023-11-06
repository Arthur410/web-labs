// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/brokers',
        name: 'Brokers',
        component: () => import('@/views/BrokersPage.vue'),
      },
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginPage.vue'),
      },
      {
        path: '/trade',
        name: 'Trade',
        component: () => import('@/views/TradePage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
