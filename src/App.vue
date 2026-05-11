<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import Taskbar from './components/os/Taskbar.vue';
import { usePresenceStore } from './stores/presenceStore';
import { version } from '../package.json';

const route = useRoute();
const presenceStore = usePresenceStore();
const isHackerMode = ref(false);

const isFullScreen = computed(() => route.meta.fullScreen);

onMounted(() => {
  presenceStore.initPresence();
  // Global key listeners if needed
});

onUnmounted(() => {
  // Cleanup
});
</script>

<template>
  <main
    class="h-screen w-screen overflow-hidden relative font-sans text-slate-200 bg-slate-950"
  >
    <!-- System Version Indicator -->
    <div class="fixed top-4 right-6 z-[9999] pointer-events-none select-none">
      <div class="px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2 group hover:bg-white/10 transition-all duration-500">
        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
        <span class="text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-[0.2em]">Build v{{ version }}</span>
      </div>
    </div>

    <!-- Content Area (Desktop or standalone apps like Chat) -->
    <router-view />

    <!-- OS UI - Only show if not in full-screen mode -->
    <template v-if="!isFullScreen">
      <Taskbar />
    </template>
  </main>
</template>
