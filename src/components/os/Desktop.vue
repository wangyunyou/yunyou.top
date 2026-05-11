<script setup>
import { useWindowStore } from '../../stores/windowStore';
import { useConfigStore } from '../../stores/configStore';
import DesktopIcon from './DesktopIcon.vue';
import Window from './Window.vue';
import {
  User,
  Terminal,
  Briefcase,
  Settings,
  Activity,
  MessagesSquare,
  Music,
  Gamepad2,
  Film,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-vue-next';
import ContextMenu from './ContextMenu.vue';

// Import Apps
import SettingsApp from '../apps/SettingsApp.vue';
import SystemMonitorApp from '../apps/SystemMonitorApp.vue';
import ChatApp from '../apps/ChatApp.vue';
import MusicApp from '../apps/MusicApp.vue';
import VideoApp from '../apps/VideoApp.vue';
import GalleryApp from '../apps/GalleryApp.vue';
import AIApp from '../apps/AIApp.vue';
import { markRaw, onMounted, ref } from 'vue';

const windowStore = useWindowStore();
const configStore = useConfigStore();

// Map strings to components
const appMap = {
  SettingsApp: markRaw(SettingsApp),
  SystemMonitorApp: markRaw(SystemMonitorApp),
  ChatApp: markRaw(ChatApp),
  MusicApp: markRaw(MusicApp),
  VideoApp: markRaw(VideoApp),
  GalleryApp: markRaw(GalleryApp),
  AIApp: markRaw(AIApp),
};

const openApp = (id, title, componentName) => {
  const comp = appMap[componentName];
  if (comp) {
    windowStore.openWindow(id, title, comp);
  }
};

// Context Menu State
const showContextMenu = ref(false);
const contextMenuPos = ref({ x: 0, y: 0 });

const handleContextMenu = (e) => {
  e.preventDefault();
  contextMenuPos.value = { x: e.clientX, y: e.clientY };
  showContextMenu.value = true;
};

const handleMenuAction = (id) => {
  switch (id) {
    case 'refresh':
      window.location.reload();
      break;
    case 'wallpaper':
    case 'settings':
      openApp('settings', '系统设置', 'SettingsApp');
      break;
    case 'monitor':
      openApp('monitor', '系统监视器', 'SystemMonitorApp');
      break;
    case 'github':
      window.open('https://github.com/wangyunyou/yunyou.top', '_blank');
      break;
  }
};
</script>

<template>
  <div
    class="desktop h-screen w-screen relative overflow-hidden bg-cover bg-center select-none"
    :style="{ backgroundImage: `url(${configStore.wallpaper})` }"
    @click.self="windowStore.activeWindowId = null"
    @contextmenu="handleContextMenu"
  >
    <!-- Background Overlay for Depth -->
    <div
      class="absolute inset-0 bg-slate-900/10 backdrop-brightness-75 pointer-events-none"
    ></div>

    <!-- Desktop Icons Grid -->
    <div
      class="grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-6 p-8 absolute top-0 left-0 bottom-12 w-fit z-10"
    >
      <!-- Primary Apps (Reordered per user request) -->
      <DesktopIcon
        label="匿名聊天"
        :icon-component="MessagesSquare"
        @click="openApp('chat', '匿名聊天室', 'ChatApp')"
      />
      <DesktopIcon
        label="云优 AI"
        :icon-component="Sparkles"
        @click="openApp('ai', '云优 AI 助手', 'AIApp')"
      />
      <DesktopIcon
        label="云优短视频"
        :icon-component="Film"
        @click="openApp('video', '云优短视频', 'VideoApp')"
      />
      <DesktopIcon
        label="云优相册"
        :icon-component="ImageIcon"
        @click="openApp('gallery', '云优相册', 'GalleryApp')"
      />

      <!-- Context Menu -->
      <ContextMenu
        :x="contextMenuPos.x"
        :y="contextMenuPos.y"
        :visible="showContextMenu"
        @close="showContextMenu = false"
        @action="handleMenuAction"
      />

      <!-- Secondary Apps -->
      <DesktopIcon
        label="系统监控"
        :icon-component="Activity"
        @click="openApp('monitor', '系统监视器', 'SystemMonitorApp')"
      />
      <DesktopIcon
        label="设置中心"
        :icon-component="Settings"
        @click="openApp('settings', '系统设置', 'SettingsApp')"
      />
      <DesktopIcon
        label="云优音乐"
        :icon-component="Music"
        @click="openApp('music', '云优音乐', 'MusicApp')"
      />
    </div>

    <!-- Windows Layer -->
    <Window v-for="win in windowStore.windows" :key="win.id" :window="win" />
  </div>
</template>

<style scoped>
.desktop {
  user-select: none;
}
</style>
