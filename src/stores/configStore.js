import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useConfigStore = defineStore('config', () => {
  const wallpaper = ref(
    'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=3132&auto=format&fit=crop'
  );

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
  ];

  const setWallpaper = (url) => {
    wallpaper.value = url;
    localStorage.setItem('yunyou-wallpaper', url);
  };

  // Load from local storage
  const savedWallpaper = localStorage.getItem('yunyou-wallpaper');
  if (savedWallpaper) {
    wallpaper.value = savedWallpaper;
  }

  return {
    wallpaper,
    wallpapers,
    setWallpaper,
  };
});
