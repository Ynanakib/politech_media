import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TestingView from '../views/TestingView.vue'
import VkCallbackView from '@/views/VkCallbackView.vue'
import LogoutView from '@/views/LogoutView.vue'
import DebugView from '@/views/DebugView.vue'
import AuthParsingView from '@/views/AuthParsingView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title : "Абитуриент 360°"
    }
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../views/AuthView.vue'),
    meta: {
      title : "Абитуриент 360° - регистрация"
    }
  },
  {
    path: "/auth/:id",
    name: 'parseAuth',
    component: AuthParsingView,
    meta: {
      title : "Абитуриент 360°"
    }
  },
  {
    path: '/testing',
    name: 'testing',
    component: TestingView,
    meta: {
      title : "Абитуриент 360° - профориентационный тест"
    }
  },
  {
    path: '/vk-callback',
    name: 'vkCallback',
    component: VkCallbackView,
    meta: {
      title : "Абитуриент 360°"
    }
  },
  {
    path: '/logout',
    name: 'logout',
    component: LogoutView,
    meta: {
      title : "Абитуриент 360°"
    }
  },
  {
    path: "/debug",
    name: "debug",
    component: DebugView,
    meta:{
      title: "DEBUG"
    }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: {
      title: 'Admin Panel'
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
router.beforeEach((to, from, next) => {
  document.title = to.meta.title; // Set title, or a default if not defined
  next(); // Continue with navigation
});

export default router
