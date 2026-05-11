<script setup>
import Desktop from '@/components/os/Desktop.vue';
import Taskbar from '@/components/os/Taskbar.vue';
</script>

<template>
  <main
    class="h-screen w-screen overflow-hidden relative font-sans text-slate-200"
  >
    <Desktop />
    <Taskbar />
  </main>
</template>
