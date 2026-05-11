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
import { markRaw } from 'vue';

const windowStore = useWindowStore();

const backgroundUrl =
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

// Map strings to components
const appMap = {
  AboutApp: markRaw(AboutApp),
  ProjectsApp: markRaw(ProjectsApp),
  TerminalApp: markRaw(TerminalApp),
  SettingsApp: markRaw(SettingsApp),
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
    <!-- Desktop Icons Grid -->
    <div
      class="grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-4 p-4 absolute top-0 left-0 bottom-12 w-fit z-0"
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
