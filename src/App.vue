<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Taskbar from './components/os/Taskbar.vue';
import { usePresenceStore } from './stores/presenceStore';

const route = useRoute();
const presenceStore = usePresenceStore();

const isFullScreen = computed(() => route.meta.fullScreen);

onMounted(() => {
  presenceStore.initPresence();
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
