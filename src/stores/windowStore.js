import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useWindowStore = defineStore('window', () => {
  const windows = ref([]);
  const activeWindowId = ref(null);
  const zIndexCounter = ref(10);
  const STORAGE_KEY = 'yunyou-windows';

  const getDefaultWindowSize = () => ({
    width: 1100,
    height: 760,
  });

  const saveWindows = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          windows.value.map((window) => ({
            id: window.id,
            title: window.title,
            componentName: window.componentName || null,
            props: window.props || {},
            x: window.x,
            y: window.y,
            width: window.width,
            height: window.height,
            isMinimized: window.isMinimized,
            isMaximized: window.isMaximized,
          }))
        )
      );
    } catch (error) {
      console.warn('[WindowStore] 保存窗口状态失败', error);
    }
  };

  const hydrateWindows = (resolveComponent) => {
    let savedWindows = [];
    try {
      savedWindows = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (error) {
      console.warn('[WindowStore] 读取窗口状态失败', error);
      return;
    }

    windows.value = savedWindows
      .filter((item) => resolveComponent(item.componentName))
      .map((item, index) => {
        const defaultSize = getDefaultWindowSize();
        return {
          id: item.id,
          title: item.title,
          component: resolveComponent(item.componentName),
          componentName: item.componentName,
          props: item.props || {},
          x: Number(item.x) || 0,
          y: Number(item.y) || 0,
          width: defaultSize.width,
          height: defaultSize.height,
          isMinimized: Boolean(item.isMinimized),
          isMaximized: Boolean(item.isMaximized),
          zIndex: 10 + index,
        };
      });

    if (windows.value.length > 0) {
      activeWindowId.value = windows.value[windows.value.length - 1].id;
      zIndexCounter.value = 10 + windows.value.length;
    }

    saveWindows();
  };

  // Actions
  const openWindow = (appId, title, component, componentName = null, props = {}, size = {}) => {
    const defaultSize = getDefaultWindowSize();
    // Check if already open
    const existing = windows.value.find((w) => w.id === appId);
    if (existing) {
      existing.width = defaultSize.width;
      existing.height = defaultSize.height;
      focusWindow(existing.id);
      if (existing.isMinimized) {
        existing.isMinimized = false;
        saveWindows();
      }
      return;
    }

    // Spawn random position slightly offset
    const offset = windows.value.length * 20;
    const initialWidth = size.width || defaultSize.width;
    const initialHeight = size.height || defaultSize.height;
    // Center it roughly
    const x = (window.innerWidth - initialWidth) / 2 + offset;
    const y = (window.innerHeight - initialHeight) / 2 + offset;

    const newWindow = {
      id: appId,
      title,
      component,
      componentName,
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
    saveWindows();
  };

  const closeWindow = (id) => {
    windows.value = windows.value.filter((w) => w.id !== id);
    saveWindows();
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
      saveWindows();
    }
  };

  const restoreWindow = (id) => {
    const win = windows.value.find((w) => w.id === id);
    if (win) {
      win.isMinimized = false;
      focusWindow(id);
      saveWindows();
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
      saveWindows();
    }
  };

  const updateWindowSize = (id, width, height) => {
    const win = windows.value.find((w) => w.id === id);
    if (win) {
      win.width = width;
      win.height = height;
      saveWindows();
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
      saveWindows();
    }
  };

  return {
    windows,
    activeWindowId,
    hydrateWindows,
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
