<script setup>
import { ref, computed } from 'vue';
import { useWindowStore } from '@/stores/windowStore';
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
    class="absolute flex flex-col rounded-lg overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 transition-opacity duration-100"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      width: `${window.width}px`,
      height: `${window.height}px`,
      zIndex: window.zIndex,
      opacity: window.isMinimized ? 0 : 1,
    }"
    @mousedown="handleMouseDown"
  >
    <!-- Window Title Bar -->
    <div
      ref="headerRef"
      class="h-9 flex items-center justify-between px-3 bg-slate-800 border-b border-slate-700 select-none cursor-default"
      :class="isActive ? 'bg-slate-800' : 'bg-slate-900 text-slate-500'"
    >
      <div class="flex items-center gap-2 text-sm font-medium text-slate-200">
        <span>{{ window.title }}</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click.stop="windowStore.minimizeWindow(window.id)"
          class="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
        >
          <Minus class="w-3 h-3" />
        </button>
        <!-- Maximize not implemented fully yet, dummy button or toggle size -->
        <button
          class="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
        >
          <Square class="w-3 h-3" />
        </button>
        <button
          @click.stop="windowStore.closeWindow(window.id)"
          class="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white transition-colors"
        >
          <X class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- Window Content -->
    <div class="flex-1 overflow-auto bg-slate-950/50 relative">
      <component :is="window.component" v-bind="window.props" />
    </div>
  </div>
</template>
