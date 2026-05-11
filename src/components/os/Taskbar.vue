<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useWindowStore } from '@/stores/windowStore';
import { Monitor, Square, Minus, X } from 'lucide-vue-next';

const windowStore = useWindowStore();

const time = ref(new Date().toLocaleTimeString());
let timer;

onMounted(() => {
  timer = setInterval(() => {
    time.value = new Date().toLocaleTimeString();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const activeWindows = computed(() => {
  // Filter out hidden windows if we had any logic for that,
  // but for now show all open windows on taskbar
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
    class="h-12 w-full bg-slate-900/80 backdrop-blur-md border-t border-slate-700/50 absolute bottom-0 left-0 flex items-center px-4 justify-between z-50"
  >
    <!-- Start Button & Active Apps -->
    <div class="flex items-center gap-4 h-full">
      <button class="p-2 rounded hover:bg-white/10 transition-colors">
        <Monitor class="w-6 h-6 text-sky-400" />
      </button>

      <div class="h-8 w-[1px] bg-slate-700"></div>

      <!-- Application Strip -->
      <div class="flex items-center gap-2">
        <button
          v-for="win in activeWindows"
          :key="win.id"
          @click="handleTaskbarClick(win)"
          class="px-3 h-10 rounded flex items-center gap-2 transition-all min-w-[120px] max-w-[200px]"
          :class="[
            win.id === windowStore.activeWindowId && !win.isMinimized
              ? 'bg-slate-700 border-b-2 border-sky-400'
              : 'hover:bg-slate-800 border-b-2 border-transparent hover:border-slate-600',
          ]"
        >
          <div
            class="w-2 h-2 rounded-full"
            :class="
              win.id === windowStore.activeWindowId
                ? 'bg-sky-400'
                : 'bg-slate-400'
            "
          ></div>
          <span class="text-sm truncate text-slate-200">{{ win.title }}</span>
        </button>
      </div>
    </div>

    <!-- System Tray -->
    <div class="flex items-center gap-4 text-slate-200 text-sm">
      <span>{{ time }}</span>
    </div>
  </div>
</template>
