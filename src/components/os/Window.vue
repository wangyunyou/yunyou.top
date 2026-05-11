<script setup>
import { ref, computed } from 'vue';
import { useWindowStore } from '../../stores/windowStore';
import { useDraggable } from '@vueuse/core';
import { Minus, Square, X } from 'lucide-vue-next';

const props = defineProps({
  window: {
    type: Object,
    required: true,
  },
});

const windowStore = useWindowStore();
const windowRef = ref(null);
const headerRef = ref(null);

// Use VueUse for dragging
// We drag the whole window, but the handle is the header
const { x, y, style } = useDraggable(windowRef, {
  initialValue: { x: props.window.x, y: props.window.y },
  preventDefault: true,
  handle: headerRef,
  onEnd: () => {
    // Sync back to store
    windowStore.updateWindowPosition(props.window.id, x.value, y.value);
  },
});

// Sync generic window updates from store if they change externally (e.g. initial spawn)
// Note: This is a simplified two-way sync. For a robust OS, we usually let local state drive drag, and sync to store on end.

const isActive = computed(() => windowStore.activeWindowId === props.window.id);

const handleMouseDown = () => {
  windowStore.focusWindow(props.window.id);
};
</script>

<template>
  <div
    ref="windowRef"
    v-show="!window.isMinimized"
    class="absolute flex flex-col rounded-xl overflow-hidden shadow-2xl border transition-all duration-300 ease-out"
    :class="[
      isActive 
        ? 'border-white/20 ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
        : 'border-white/5 opacity-90 grayscale-[0.2]'
    ]"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      width: `${window.width}px`,
      height: `${window.height}px`,
      zIndex: window.zIndex,
      background: isActive 
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)' 
        : 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(16px)',
    }"
    @mousedown="handleMouseDown"
  >
    <!-- Window Title Bar -->
    <div
      ref="headerRef"
      class="h-10 flex items-center justify-between px-4 select-none cursor-default border-b border-white/5"
      :class="isActive ? 'bg-white/5' : 'bg-transparent text-slate-500'"
    >
      <div class="flex items-center gap-2 text-sm font-semibold tracking-wide" :class="isActive ? 'text-white' : 'text-slate-400'">
        <div class="w-2 h-2 rounded-full" :class="isActive ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'"></div>
        <span>{{ window.title }}</span>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          @click.stop="windowStore.minimizeWindow(window.id)"
          class="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
        >
          <Minus class="w-3.5 h-3.5" />
        </button>
        <button
          class="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
        >
          <Square class="w-3 h-3" />
        </button>
        <button
          @click.stop="windowStore.closeWindow(window.id)"
          class="w-7 h-7 flex items-center justify-center hover:bg-rose-500/80 rounded-full text-slate-400 hover:text-white transition-all"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Window Content -->
    <div class="flex-1 overflow-auto bg-transparent relative">
      <component :is="window.component" v-bind="window.props" />
    </div>
  </div>
</template>
