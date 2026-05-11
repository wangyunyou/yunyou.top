<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import Taskbar from './components/os/Taskbar.vue';
import HackerDashboard from './components/os/HackerDashboard.vue';

const route = useRoute();
const isHackerMode = ref(false);

const isFullScreen = computed(() => route.meta.fullScreen);

const toggleHackerMode = () => {
  isHackerMode.value = !isHackerMode.value;
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && isHackerMode.value) {
    isHackerMode.value = false;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
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
      <Taskbar @toggle-hacker="toggleHackerMode" />
      <HackerDashboard v-if="isHackerMode" @exit="isHackerMode = false" />
    </template>
  </main>
</template>
