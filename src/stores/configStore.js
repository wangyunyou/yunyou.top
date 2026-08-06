import { defineStore } from 'pinia';
import { ref } from 'vue';

const DEFAULT_WALLPAPER = '/wallpapers/aurora.jpg';

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
  // 兼容旧数据：老版本 localStorage 存的是 Unsplash 远程 URL，迁移到本地壁纸路径
  const migrateLegacyWallpaper = (url) => {
    if (typeof url !== 'string') return DEFAULT_WALLPAPER;
    if (url.startsWith('/wallpapers/')) return url; // 已是本地路径
    // 老 URL 形如 .../photo-<id>?...,映射到本地壁纸
    const m = url.match(/photo-(\d+)/);
    if (!m) return DEFAULT_WALLPAPER;
    const map = {
      '1635776062127-d379bfcba9f8': 'aurora',
      '1605142859862-978be7eba909': 'cyber',
      '1550684848-fac1c5b4e853': 'minimal',
      '1441974231531-c6227db76b6e': 'nature',
      '1506905925346-21bda4d32df4': 'sunrise',
      '1419242902214-272b3f66ee7a': 'milkyway',
      '1477959858617-67f85cf4f1df': 'citynight',
      '1507525428034-b723cf961d3e': 'beach',
      '1454496522488-7a8e488e8606': 'snowpeak',
      '1470252649378-9c29740c9fa8': 'sunset',
    };
    const local = map[m[1]];
    return local ? `/wallpapers/${local}.jpg` : DEFAULT_WALLPAPER;
  };

  const storedWallpaper = localStorage.getItem('yunyou-wallpaper');
  const wallpaper = ref(migrateLegacyWallpaper(storedWallpaper));
  const settings = ref(loadSettings());

  const wallpapers = [
    {
      id: 'aurora',
      name: '极光之境',
      url: '/wallpapers/aurora.jpg',
    },
    {
      id: 'cyber',
      name: '赛博都市',
      url: '/wallpapers/cyber.jpg',
    },
    {
      id: 'minimal',
      name: '极简主义',
      url: '/wallpapers/minimal.jpg',
    },
    {
      id: 'nature',
      name: '静谧森林',
      url: '/wallpapers/nature.jpg',
    },
    {
      id: 'sunrise',
      name: '晨光山巅',
      url: '/wallpapers/sunrise.jpg',
    },
    {
      id: 'milkyway',
      name: '银河之夜',
      url: '/wallpapers/milkyway.jpg',
    },
    {
      id: 'citynight',
      name: '都市夜景',
      url: '/wallpapers/citynight.jpg',
    },
    {
      id: 'beach',
      name: '碧海白沙',
      url: '/wallpapers/beach.jpg',
    },
    {
      id: 'snowpeak',
      name: '雪岭云海',
      url: '/wallpapers/snowpeak.jpg',
    },
    {
      id: 'sunset',
      name: '落日余晖',
      url: '/wallpapers/sunset.jpg',
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
