<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useWindowStore } from '../../stores/windowStore';
import { Monitor, Square, Minus, X, Radio } from 'lucide-vue-next';

const windowStore = useWindowStore();

const emit = defineEmits(['toggle-hacker']);
const time = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
let timer;

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
</script>

<template>
  <div
    class="h-12 w-full bg-slate-900/60 backdrop-blur-xl border-t border-white/10 absolute bottom-0 left-0 flex items-center px-4 justify-between z-[100]"
  >
    <!-- Start Button & Active Apps -->
    <div class="flex items-center gap-4 h-full">
      <button class="p-2 rounded-lg hover:bg-white/10 transition-all active:scale-90 group">
        <Monitor class="w-6 h-6 text-sky-400 group-hover:drop-shadow-[0_0_8px_#38bdf8]" />
      </button>

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
      <!-- Hacker Mode Toggle -->
      <button 
        @click="$emit('toggle-hacker')"
        class="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 hover:border-sky-500/40 transition-all duration-300 group"
      >
        <Radio class="w-4 h-4 text-sky-400 animate-pulse" />
        <span class="text-[10px] font-bold text-sky-400 group-hover:text-sky-300 transition-colors uppercase tracking-widest">电影模式</span>
      </button>

      <div class="flex items-center gap-4 text-slate-200 text-xs font-mono tracking-tighter">
        <span>{{ time }}</span>
      </div>
    </div>
  </div>
</template>
