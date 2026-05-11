<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
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
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

// Window Position
const { x, y } = useDraggable(windowRef, {
  initialValue: { x: props.window.x, y: props.window.y },
  preventDefault: true,
  handle: headerRef,
  onEnd: () => {
    if (!props.window.isMaximized && !isMobile.value) {
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
  if (props.window.isMaximized || isMobile.value) return;
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
    class="absolute flex flex-col overflow-hidden shadow-2xl border select-none"
    :class="[
      isActive 
        ? 'border-white/20 ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50' 
        : 'border-white/5 opacity-90 grayscale-[0.2]',
      window.isMaximized || isMobile ? 'rounded-none' : 'rounded-xl transition-[opacity,transform,border] duration-300 ease-out',
      isMobile ? '!fixed !top-0 !left-0 !w-full !h-full !m-0' : ''
    ]"
    :style="!isMobile ? {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      zIndex: window.zIndex,
      background: isActive 
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)' 
        : 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(20px)',
    } : {
      zIndex: window.zIndex,
      background: 'rgba(15, 23, 42, 0.95)',
    }"
    @mousedown="handleMouseDown"
  >
    <!-- Window Title Bar -->
    <div
      ref="headerRef"
      class="h-10 flex items-center justify-between px-4 select-none cursor-default border-b border-white/5"
      :class="[isActive ? 'bg-white/10' : 'bg-transparent text-slate-500', !isMobile ? 'active:cursor-grabbing' : '']"
      @dblclick="!isMobile && windowStore.toggleMaximize(window.id)"
    >
      <div class="flex items-center gap-2 text-sm font-semibold tracking-wide" :class="isActive ? 'text-white' : 'text-slate-400'">
        <div class="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]" :class="isActive ? 'bg-sky-400' : 'bg-slate-600'"></div>
        <span>{{ window.title }}</span>
      </div>

      <div class="flex items-center gap-1">
        <button
          v-if="!isMobile"
          @click.stop="windowStore.minimizeWindow(window.id)"
          class="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
        >
          <Minus class="w-4 h-4" />
        </button>
        <button
          v-if="!isMobile"
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
      v-if="!window.isMaximized && !isMobile"
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
