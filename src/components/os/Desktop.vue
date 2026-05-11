<script setup>
import { useWindowStore } from '../../stores/windowStore';
import { useConfigStore } from '../../stores/configStore';
import DesktopIcon from './DesktopIcon.vue';
import Window from './Window.vue';
import { User, Terminal, Briefcase, Settings, Activity, MessagesSquare, Music, Gamepad2, Film, Image as ImageIcon } from 'lucide-vue-next';

// Import Apps
import AboutApp from '../apps/AboutApp.vue';
import ProjectsApp from '../apps/ProjectsApp.vue';
import TerminalApp from '../apps/TerminalApp.vue';
import SettingsApp from '../apps/SettingsApp.vue';
import SystemMonitorApp from '../apps/SystemMonitorApp.vue';
import ChatApp from '../apps/ChatApp.vue';
import MusicApp from '../apps/MusicApp.vue';
import SnakeGameApp from '../apps/SnakeGameApp.vue';
import VideoApp from '../apps/VideoApp.vue';
import GalleryApp from '../apps/GalleryApp.vue';
import { markRaw, onMounted } from 'vue';

const windowStore = useWindowStore();
const configStore = useConfigStore();

// Map strings to components
const appMap = {
  AboutApp: markRaw(AboutApp),
  ProjectsApp: markRaw(ProjectsApp),
  TerminalApp: markRaw(TerminalApp),
  SettingsApp: markRaw(SettingsApp),
  SystemMonitorApp: markRaw(SystemMonitorApp),
  ChatApp: markRaw(ChatApp),
  MusicApp: markRaw(MusicApp),
  SnakeGameApp: markRaw(SnakeGameApp),
  VideoApp: markRaw(VideoApp),
  GalleryApp: markRaw(GalleryApp),
};

const openApp = (id, title, componentName) => {
  const comp = appMap[componentName];
  if (comp) {
    windowStore.openWindow(id, title, comp);
  }
};

</script>

<template>
  <div
    class="desktop h-screen w-screen relative overflow-hidden bg-cover bg-center select-none"
    :style="{ backgroundImage: `url(${configStore.wallpaper})` }"
    @click.self="windowStore.activeWindowId = null"
  >
    <!-- Background Overlay for Depth -->
    <div class="absolute inset-0 bg-slate-900/10 backdrop-brightness-75 pointer-events-none"></div>

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
        label="云优短视频"
        :icon-component="Film"
        @click="openApp('video', '云优短视频', 'VideoApp')"
      />
      <DesktopIcon
        label="云优相册"
        :icon-component="ImageIcon"
        @click="openApp('gallery', '云优相册', 'GalleryApp')"
      />

      <!-- Secondary Apps -->
      <DesktopIcon
        label="关于我"
        :icon-component="User"
        @click="openApp('about', '关于我', 'AboutApp')"
      />
      <DesktopIcon
        label="我的项目"
        :icon-component="Briefcase"
        @click="openApp('projects', '我的项目', 'ProjectsApp')"
      />
      <DesktopIcon
        label="终端"
        :icon-component="Terminal"
        @click="openApp('terminal', '系统终端', 'TerminalApp')"
      />
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
      <DesktopIcon
        label="贪吃蛇"
        :icon-component="Gamepad2"
        @click="openApp('snake', '贪吃蛇大作战', 'SnakeGameApp')"
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
