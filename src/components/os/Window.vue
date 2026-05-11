<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useWindowStore } from '../../stores/windowStore';
import { useDraggable } from '@vueuse/core';
import { Minus, Square, X, Maximize2 } from 'lucide-vue-next';

const props = defineProps({
  window: {
    type: Object,
    required: true,
  },
});

const windowStore = useWindowStore();
const windowRef = ref(null);
const headerRef = ref(null);
const resizerRef = ref(null);

// Window Position
const { x, y } = useDraggable(windowRef, {
  initialValue: { x: props.window.x, y: props.window.y },
  preventDefault: true,
  handle: headerRef,
  onEnd: () => {
    if (!props.window.isMaximized) {
      windowStore.updateWindowPosition(props.window.id, x.value, y.value);
    }
  },
});

// Window Size
const width = ref(props.window.width);
const height = ref(props.window.height);

// Resizing logic
const isResizing = ref(false);

const startResizing = (e) => {
  if (props.window.isMaximized) return;
  isResizing.value = true;
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = width.value;
  const startHeight = height.value;

  const onMouseMove = (moveEvent) => {
    if (!isResizing.value) return;
    const newWidth = startWidth + (moveEvent.clientX - startX);
    const newHeight = startHeight + (moveEvent.clientY - startY);
    
    width.value = Math.max(300, newWidth);
    height.value = Math.max(200, newHeight);
  };

  const onMouseUp = () => {
    isResizing.value = false;
    windowStore.updateWindowSize(props.window.id, width.value, height.value);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

// Sync from store (for maximize/restore)
watch(() => props.window.x, (val) => x.value = val);
watch(() => props.window.y, (val) => y.value = val);
watch(() => props.window.width, (val) => width.value = val);
watch(() => props.window.height, (val) => height.value = val);

const isActive = computed(() => windowStore.activeWindowId === props.window.id);

const handleMouseDown = () => {
  windowStore.focusWindow(props.window.id);
};
</script>

<template>
  <div
    ref="windowRef"
    v-show="!window.isMinimized"
    class="absolute flex flex-col rounded-xl overflow-hidden shadow-2xl border select-none"
    :class="[
      isActive 
        ? 'border-white/20 ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50' 
        : 'border-white/5 opacity-90 grayscale-[0.2]',
      window.isMaximized ? 'rounded-none' : 'transition-[opacity,transform,border] duration-300 ease-out'
    ]"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      zIndex: window.zIndex,
      background: isActive 
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)' 
        : 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(20px)',
    }"
    @mousedown="handleMouseDown"
  >
    <!-- Window Title Bar -->
    <div
      ref="headerRef"
      class="h-10 flex items-center justify-between px-4 select-none cursor-default border-b border-white/5 active:cursor-grabbing"
      :class="isActive ? 'bg-white/10' : 'bg-transparent text-slate-500'"
      @dblclick="windowStore.toggleMaximize(window.id)"
    >
      <div class="flex items-center gap-2 text-sm font-semibold tracking-wide" :class="isActive ? 'text-white' : 'text-slate-400'">
        <div class="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]" :class="isActive ? 'bg-sky-400' : 'bg-slate-600'"></div>
        <span>{{ window.title }}</span>
      </div>

      <div class="flex items-center gap-1">
        <button
          @click.stop="windowStore.minimizeWindow(window.id)"
          class="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
        >
          <Minus class="w-4 h-4" />
        </button>
        <button
          @click.stop="windowStore.toggleMaximize(window.id)"
          class="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
        >
          <Square v-if="!window.isMaximized" class="w-3 h-3" />
          <Maximize2 v-else class="w-3 h-3" />
        </button>
        <button
          @click.stop="windowStore.closeWindow(window.id)"
          class="w-8 h-8 flex items-center justify-center hover:bg-rose-500/80 rounded-lg text-slate-400 hover:text-white transition-all group"
        >
          <X class="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>

    <!-- Window Content -->
    <div class="flex-1 overflow-auto bg-transparent relative">
      <component :is="window.component" v-bind="window.props" />
    </div>

    <!-- Resize Handle -->
    <div 
      v-if="!window.isMaximized"
      class="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize group"
      @mousedown.stop.prevent="startResizing"
    >
      <div class="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-white/20 group-hover:border-sky-400 transition-colors"></div>
    </div>
  </div>
</template>

<style scoped>
.z-50 {
  z-index: 999;
}
</style>
