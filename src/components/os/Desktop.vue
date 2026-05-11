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
  Globe,
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
import { ref, onMounted, onUnmounted, markRaw } from 'vue';
import { Cloud, Sun, CloudRain, Clock } from 'lucide-vue-next';

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

// Widgets Logic
const currentTime = ref(new Date());
const timer = ref(null);
const quotes = [
  { text: '不积跬步，无以至千里。', author: '荀子' },
  { text: 'Stay Hungry, Stay Foolish.', author: 'Steve Jobs' },
  { text: '所有的伟大，都源于一个勇敢的开始。', author: '云优网络' },
  { text: '代码是写给人看的，附带能在机器上运行。', author: 'Donald Knuth' },
];
const dailyQuote = ref(quotes[Math.floor(Math.random() * quotes.length)]);

onMounted(() => {
  timer.value = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
});

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

    <!-- Desktop Widgets -->
    <div
      class="absolute top-12 right-12 flex flex-col gap-8 items-end pointer-events-none select-none"
    >
      <!-- Big Clock -->
      <div class="text-right group cursor-default pointer-events-auto">
        <div
          class="text-7xl font-light text-white tracking-tighter drop-shadow-2xl"
        >
          {{
            currentTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          }}
        </div>
        <div
          class="text-sm text-white/60 font-medium tracking-widest mt-1 uppercase"
        >
          {{
            currentTime.toLocaleDateString([], {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })
          }}
        </div>
      </div>

      <!-- Quote Widget -->
      <div
        class="max-w-[280px] p-6 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl pointer-events-auto hover:bg-white/10 transition-all"
      >
        <div class="text-xs text-white/80 leading-relaxed italic font-serif">
          “{{ dailyQuote.text }}”
        </div>
        <div
          class="text-[10px] text-white/30 font-bold mt-3 text-right uppercase tracking-widest"
        >
          — {{ dailyQuote.author }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.desktop {
  user-select: none;
}

.animate-spin-slow {
  animation: spin 12s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
