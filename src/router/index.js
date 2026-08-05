import { createRouter, createWebHistory } from 'vue-router';
import MagazineHome from '../components/home/MagazineHome.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MagazineHome,
    meta: { fullScreen: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../components/apps/ChatApp.vue'),
    meta: { fullScreen: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
