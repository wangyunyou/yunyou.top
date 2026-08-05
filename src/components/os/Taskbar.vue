<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { onClickOutside } from '@vueuse/core';
import { useWindowStore } from '../../stores/windowStore';
import { appRegistry } from '../../lib/appRegistry';
import {
  Monitor,
  MessagesSquare,
  Sparkles,
  Settings,
  Activity,
  RefreshCw,
  ExternalLink,
} from 'lucide-vue-next';
import { usePresenceStore } from '../../stores/presenceStore';

const windowStore = useWindowStore();
const presenceStore = usePresenceStore();
const router = useRouter();

const time = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
let timer;

const startMenuRef = ref(null);
const startMenuOpen = ref(false);

onClickOutside(startMenuRef, () => {
  startMenuOpen.value = false;
});

onMounted(() => {
  timer = setInterval(() => {
    time.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const activeWindows = computed(() => {
  return windowStore.windows;
});

const handleTaskbarClick = (win) => {
  if (win.id === windowStore.activeWindowId && !win.isMinimized) {
    windowStore.minimizeWindow(win.id);
  } else {
    if (win.isMinimized) {
      windowStore.restoreWindow(win.id);
    } else {
      windowStore.focusWindow(win.id);
    }
  }
};

const startActions = [
  { id: 'chat', label: '匿名聊天', icon: MessagesSquare },
  { id: 'ai', label: '云优 AI', icon: Sparkles },
  { id: 'settings', label: '系统设置', icon: Settings },
  { id: 'monitor', label: '系统监控', icon: Activity },
  { divider: true },
  { id: 'refresh', label: '刷新页面', icon: RefreshCw },
  { id: 'github', label: '源码地址', icon: ExternalLink },
];

const openApp = (id, title, componentName) => {
  const component = appRegistry[componentName];
  if (component) {
    windowStore.openWindow(id, title, component, componentName);
  }
};

const handleStartAction = (id) => {
  startMenuOpen.value = false;

  switch (id) {
    case 'chat':
      router.push('/chat');
      break;
    case 'ai':
      openApp('ai', '云优 AI 助手', 'AIApp');
      break;
    case 'settings':
      openApp('settings', '系统设置', 'SettingsApp');
      break;
    case 'monitor':
      openApp('monitor', '系统监视器', 'SystemMonitorApp');
      break;
    case 'refresh':
      window.location.reload();
      break;
    case 'github':
      window.open('https://github.com/wangyunyou/yunyou.top', '_blank');
      break;
  }
};
</script>

<template>
  <div
    class="h-12 w-full bg-slate-900/60 backdrop-blur-xl border-t border-white/10 absolute bottom-0 left-0 flex items-center px-4 justify-between z-[100]"
  >
    <!-- Start Button & Active Apps -->
    <div class="flex items-center gap-4 h-full">
      <div ref="startMenuRef" class="relative flex items-center h-full">
        <button
          class="p-2 rounded-lg hover:bg-white/10 transition-all active:scale-90 group"
          aria-label="开始菜单"
          @click="startMenuOpen = !startMenuOpen"
        >
          <Monitor class="w-6 h-6 text-sky-400 group-hover:drop-shadow-[0_0_8px_#38bdf8]" />
        </button>

        <div
          v-if="startMenuOpen"
          class="absolute bottom-14 left-0 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 z-[120]"
        >
          <template v-for="(item, index) in startActions" :key="index">
            <div v-if="item.divider" class="h-px bg-white/5 my-1 mx-2"></div>
            <button
              v-else
              class="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-sky-500 hover:text-white rounded-lg transition-all text-left"
              @click="handleStartAction(item.id)"
            >
              <component :is="item.icon" class="w-4 h-4 text-slate-400" />
              {{ item.label }}
            </button>
          </template>
        </div>
      </div>

      <div class="h-6 w-[1px] bg-white/10"></div>

      <!-- Application Strip -->
      <div class="flex items-center gap-2">
        <button
          v-for="win in activeWindows"
          :key="win.id"
          @click="handleTaskbarClick(win)"
          class="px-4 h-9 rounded-lg flex items-center gap-3 transition-all min-w-[140px] max-w-[220px] border border-transparent"
          :class="[
            win.id === windowStore.activeWindowId && !win.isMinimized
              ? 'bg-white/10 border-white/20 shadow-lg'
              : 'hover:bg-white/5',
          ]"
        >
          <div
            class="w-1.5 h-1.5 rounded-full"
            :class="
              win.id === windowStore.activeWindowId && !win.isMinimized
                ? 'bg-sky-400 animate-pulse'
                : 'bg-slate-500'
            "
          ></div>
          <span class="text-xs font-medium truncate text-slate-100">{{ win.title }}</span>
        </button>
      </div>
    </div>

    <!-- System Tray -->
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold">
        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        {{ presenceStore.onlineCount }} 人在线
      </div>

      <div class="flex items-center gap-4 text-slate-200 text-xs font-mono tracking-tighter">
        <span>{{ time }}</span>
      </div>
    </div>
  </div>
</template>
