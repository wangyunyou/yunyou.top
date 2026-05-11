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

    <!-- Content Area (Desktop or standalone apps like Chat) -->
    <router-view />

    <!-- OS UI - Only show if not in full-screen mode -->
    <template v-if="!isFullScreen">
      <Taskbar />
    </template>
  </main>
</template>
