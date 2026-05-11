import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useWindowStore = defineStore('window', () => {
  const windows = ref([]);
  const activeWindowId = ref(null);
  const zIndexCounter = ref(10);

  // Actions
  const openWindow = (appId, title, component, props = {}) => {
    // Check if already open
    const existing = windows.value.find((w) => w.id === appId);
    if (existing) {
      focusWindow(existing.id);
      if (existing.isMinimized) {
        existing.isMinimized = false;
      }
      return;
    }

    // Spawn random position slightly offset
    const offset = windows.value.length * 20;
    const initialWidth = 800;
    const initialHeight = 600;
    // Center it roughly
    const x = (window.innerWidth - initialWidth) / 2 + offset;
    const y = (window.innerHeight - initialHeight) / 2 + offset;

    const newWindow = {
      id: appId,
      title,
      component,
      props,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: initialWidth,
      height: initialHeight,
      isMinimized: false,
      isMaximized: false,
      zIndex: ++zIndexCounter.value,
    };

    windows.value.push(newWindow);
    activeWindowId.value = newWindow.id;
  };

  const closeWindow = (id) => {
    windows.value = windows.value.filter((w) => w.id !== id);
    if (activeWindowId.value === id) {
      // Focus the next top-most window
      if (windows.value.length > 0) {
        const topWindow = windows.value.reduce((prev, current) =>
          prev.zIndex > current.zIndex ? prev : current
        );
        activeWindowId.value = topWindow.id;
      } else {
        activeWindowId.value = null;
      }
    }
  };

  const minimizeWindow = (id) => {
    const win = windows.value.find((w) => w.id === id);
    if (win) {
      win.isMinimized = true;
      activeWindowId.value = null; // Deselect
    }
  };

  const restoreWindow = (id) => {
    const win = windows.value.find((w) => w.id === id);
    if (win) {
      win.isMinimized = false;
      focusWindow(id);
    }
  };

  const focusWindow = (id) => {
    const win = windows.value.find((w) => w.id === id);
    if (win) {
      win.zIndex = ++zIndexCounter.value;
      activeWindowId.value = id;
    }
  };

  const updateWindowPosition = (id, x, y) => {
    const win = windows.value.find((w) => w.id === id);
    if (win) {
      win.x = x;
      win.y = y;
    }
  };

  const updateWindowSize = (id, width, height) => {
    const win = windows.value.find((w) => w.id === id);
    if (win) {
      win.width = width;
      win.height = height;
    }
  };

  const toggleMaximize = (id) => {
    const win = windows.value.find((w) => w.id === id);
    if (win) {
      if (!win.isMaximized) {
        win.oldX = win.x;
        win.oldY = win.y;
        win.oldWidth = win.width;
        win.oldHeight = win.height;
        
        win.x = 0;
        win.y = 0;
        win.width = window.innerWidth;
        win.height = window.innerHeight - 48;
        win.isMaximized = true;
      } else {
        win.x = win.oldX || 0;
        win.y = win.oldY || 0;
        win.width = win.oldWidth || 800;
        win.height = win.oldHeight || 600;
        win.isMaximized = false;
      }
    }
  };

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    toggleMaximize,
  };
});
