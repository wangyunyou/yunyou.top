import { defineAsyncComponent } from 'vue';

export const appRegistry = {
  SettingsApp: defineAsyncComponent(() => import('../components/apps/SettingsApp.vue')),
  SystemMonitorApp: defineAsyncComponent(() => import('../components/apps/SystemMonitorApp.vue')),
  ChatApp: defineAsyncComponent(() => import('../components/apps/ChatApp.vue')),
  MusicApp: defineAsyncComponent(() => import('../components/apps/MusicApp.vue')),
  VideoApp: defineAsyncComponent(() => import('../components/apps/VideoApp.vue')),
  GalleryApp: defineAsyncComponent(() => import('../components/apps/GalleryApp.vue')),
  AIApp: defineAsyncComponent(() => import('../components/apps/AIApp.vue')),
  GameCenterApp: defineAsyncComponent(() => import('../components/apps/GameCenterApp.vue')),
};
