import { defineStore } from 'pinia';
import { ref } from 'vue';

const DEFAULT_WALLPAPER =
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=3132&auto=format&fit=crop';

const DEFAULT_SETTINGS = { particles: true };

// 全部本地存储键（供清除数据使用）
export const STORAGE_KEYS = [
  'yunyou-wallpaper',
  'yunyou-settings',
  'yunyou-chat-username',
  'yunyou-ai-messages',
  'snake-best',
  '2048-best',
  'tetris-best',
];

function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('yunyou-settings') || '{}') };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export const useConfigStore = defineStore('config', () => {
  const wallpaper = ref(localStorage.getItem('yunyou-wallpaper') || DEFAULT_WALLPAPER);
  const settings = ref(loadSettings());

  const wallpapers = [
    {
      id: 'aurora',
      name: '极光之境',
      url: 'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=3132&auto=format&fit=crop',
    },
    {
      id: 'cyber',
      name: '赛博都市',
      url: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?q=80&w=2940&auto=format&fit=crop',
    },
    {
      id: 'minimal',
      name: '极简主义',
      url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop',
    },
    {
      id: 'nature',
      name: '静谧森林',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2942&auto=format&fit=crop',
    },
    {
      id: 'sunrise',
      name: '晨光山巅',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2940&auto=format&fit=crop',
    },
    {
      id: 'milkyway',
      name: '银河之夜',
      url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2940&auto=format&fit=crop',
    },
    {
      id: 'citynight',
      name: '都市夜景',
      url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2940&auto=format&fit=crop',
    },
    {
      id: 'beach',
      name: '碧海白沙',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2940&auto=format&fit=crop',
    },
    {
      id: 'snowpeak',
      name: '雪岭云海',
      url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=2940&auto=format&fit=crop',
    },
    {
      id: 'sunset',
      name: '落日余晖',
      url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=2940&auto=format&fit=crop',
    },
  ];

  const setWallpaper = (url) => {
    wallpaper.value = url;
    localStorage.setItem('yunyou-wallpaper', url);
  };

  const setSetting = (key, value) => {
    settings.value = { ...settings.value, [key]: value };
    localStorage.setItem('yunyou-settings', JSON.stringify(settings.value));
  };

  // 清除全部本地数据，恢复默认
  const resetAll = () => {
    STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    wallpaper.value = DEFAULT_WALLPAPER;
    settings.value = { ...DEFAULT_SETTINGS };
  };

  return {
    wallpaper,
    settings,
    wallpapers,
    setWallpaper,
    setSetting,
    resetAll,
  };
});
