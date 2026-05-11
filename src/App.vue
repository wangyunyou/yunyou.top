<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Desktop from './components/os/Desktop.vue';
import Taskbar from './components/os/Taskbar.vue';
import HackerDashboard from './components/os/HackerDashboard.vue';

const isHackerMode = ref(false);

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
    <!-- Normal OS UI -->
    <Desktop />
    <Taskbar @toggle-hacker="toggleHackerMode" />

    <!-- Extreme Movie Mode Overlay -->
    <HackerDashboard v-if="isHackerMode" @exit="isHackerMode = false" />
  </main>
</template>
