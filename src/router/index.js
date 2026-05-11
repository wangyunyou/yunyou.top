import { createRouter, createWebHistory } from 'vue-router';
import Desktop from '../components/os/Desktop.vue';
import ChatApp from '../components/apps/ChatApp.vue';

const routes = [
  {
    path: '/',
    name: 'OS',
    component: Desktop
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatApp,
    meta: { fullScreen: true } // 标记这个组件需要全屏（不带 OS 外壳）
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
