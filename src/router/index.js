import { createRouter, createWebHistory } from 'vue-router';
import MagazineHome from '../components/home/MagazineHome.vue';
import AppLayout from '../components/os/AppLayout.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MagazineHome,
  },
  {
    path: '/chat',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Chat',
        component: () => import('../components/apps/ChatApp.vue'),
        meta: { title: '匿名聊天', accent: 'cyan' },
      },
    ],
  },
  {
    path: '/ai',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'AI',
        component: () => import('../components/apps/AIApp.vue'),
        meta: { title: '云优 AI', accent: 'violet' },
      },
    ],
  },
  {
    path: '/video',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Video',
        component: () => import('../components/apps/VideoApp.vue'),
        meta: { title: '云优短视频', accent: 'rose' },
      },
    ],
  },
  {
    path: '/gallery',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Gallery',
        component: () => import('../components/apps/GalleryApp.vue'),
        meta: { title: '云优相册', accent: 'amber' },
      },
    ],
  },
  {
    path: '/game',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Game',
        component: () => import('../components/apps/GameCenterApp.vue'),
        meta: { title: '游戏厅', accent: 'indigo' },
      },
    ],
  },
  {
    path: '/music',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Music',
        component: () => import('../components/apps/MusicApp.vue'),
        meta: { title: '云优音乐', accent: 'pink' },
      },
    ],
  },
  {
    path: '/monitor',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Monitor',
        component: () => import('../components/apps/SystemMonitorApp.vue'),
        meta: { title: '系统监控', accent: 'emerald' },
      },
    ],
  },
  {
    path: '/settings',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Settings',
        component: () => import('../components/apps/SettingsApp.vue'),
        meta: { title: '设置中心', accent: 'slate' },
      },
    ],
  },
  {
    path: '/landing',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Landing',
        component: () => import('../components/apps/LandingGeneratorApp.vue'),
        meta: { title: 'AI 落地页生成器', accent: 'orange' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
