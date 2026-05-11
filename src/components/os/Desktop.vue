<script setup>
import { useWindowStore } from '@/stores/windowStore';
import DesktopIcon from './DesktopIcon.vue';
import Window from './Window.vue';
import { User, Terminal, Briefcase, Settings } from 'lucide-vue-next';

// Import Apps (we will create these next)
import AboutApp from '@/components/apps/AboutApp.vue';
import ProjectsApp from '@/components/apps/ProjectsApp.vue';
import TerminalApp from '@/components/apps/TerminalApp.vue';
import SettingsApp from '@/components/apps/SettingsApp.vue';
import SystemMonitorApp from '@/components/apps/SystemMonitorApp.vue';
import { markRaw } from 'vue';

const windowStore = useWindowStore();

const backgroundUrl =
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=3132&auto=format&fit=crop';

// Map strings to components
const appMap = {
  AboutApp: markRaw(AboutApp),
  ProjectsApp: markRaw(ProjectsApp),
  TerminalApp: markRaw(TerminalApp),
  SettingsApp: markRaw(SettingsApp),
  SystemMonitorApp: markRaw(SystemMonitorApp),
};

const openApp = (id, title, componentName) => {
  const comp = appMap[componentName];
  if (comp) {
    windowStore.openWindow(id, title, comp);
  }
};
</script>

<template>
  <div
    class="desktop h-screen w-screen relative overflow-hidden bg-cover bg-center select-none"
    :style="{ backgroundImage: `url(${backgroundUrl})` }"
    @click.self="windowStore.activeWindowId = null"
  >
    <!-- Background Overlay for Depth -->
    <div class="absolute inset-0 bg-slate-900/10 backdrop-brightness-75 pointer-events-none"></div>

    <!-- Desktop Icons Grid -->
    <div
      class="grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-6 p-8 absolute top-0 left-0 bottom-12 w-fit z-0"
    >
      <DesktopIcon
        label="About Me"
        :icon-component="User"
        @dblclick="openApp('about', 'About Me', 'AboutApp')"
      />
      <DesktopIcon
        label="Projects"
        :icon-component="Briefcase"
        @dblclick="openApp('projects', 'Projects', 'ProjectsApp')"
      />
      <DesktopIcon
        label="Terminal"
        :icon-component="Terminal"
        @dblclick="openApp('terminal', 'Terminal', 'TerminalApp')"
      />
      <DesktopIcon
        label="System"
        :icon-component="Activity"
        @dblclick="openApp('monitor', 'System Monitor', 'SystemMonitorApp')"
      />
      <DesktopIcon
        label="Settings"
        :icon-component="Settings"
        @dblclick="openApp('settings', 'Settings', 'SettingsApp')"
      />
    </div>

    <!-- Windows Layer -->
    <Window v-for="win in windowStore.windows" :key="win.id" :window="win" />
  </div>
</template>

<style scoped>
.desktop {
  user-select: none;
}
</style>
