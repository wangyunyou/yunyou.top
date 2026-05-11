<script setup>
import { ref, onMounted } from 'vue';
import { Image as ImageIcon, RefreshCw, Download, Heart, Share2, Sparkles } from 'lucide-vue-next';

const imageSrc = ref('');
const isLoading = ref(true);
const history = ref([]);

const refreshImage = () => {
  isLoading.value = true;
  const timestamp = new Date().getTime();
  // Using the API from the other YunYou project
  const api = 'https://api.yujn.cn/api/heisi.php?';
  const newSrc = `${api}_t=${timestamp}`;
  
  // Preload image
  const img = new Image();
  img.src = newSrc;
  img.onload = () => {
    imageSrc.value = newSrc;
    isLoading.value = false;
    history.value.unshift(newSrc);
    if (history.value.length > 10) history.value.pop();
  };
};

onMounted(() => {
  refreshImage();
});
</script>

<template>
  <div class="h-full bg-slate-950 flex flex-col select-none overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b border-white/5 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-pink-500/20 rounded-lg text-pink-400">
          <Sparkles class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-white font-bold text-sm">云优美图赏析</h3>
          <p class="text-[9px] text-slate-500 uppercase tracking-widest">实时接口：api.yujn.cn</p>
        </div>
      </div>
      <button 
        @click="refreshImage" 
        :disabled="isLoading"
        class="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-pink-500/20"
      >
        <RefreshCw class="w-4 h-4" :class="isLoading ? 'animate-spin' : ''" />
        换一张
      </button>
    </div>

    <!-- Image Viewer -->
    <div class="flex-1 relative flex items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black overflow-hidden">
      <!-- Background Blur -->
      <div 
        class="absolute inset-0 opacity-20 blur-[100px] transition-all duration-1000 scale-150"
        :style="{ backgroundImage: `url(${imageSrc})`, backgroundSize: 'cover' }"
      ></div>

      <!-- Main Image Card -->
      <div class="relative group h-full max-w-full flex items-center justify-center">
        <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center z-10">
          <div class="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
        
        <img 
          v-show="!isLoading"
          :src="imageSrc" 
          class="h-full max-w-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 object-contain transition-all duration-500 hover:scale-[1.01]"
          alt="Discovery"
        />

        <!-- Hover Controls -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button class="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-pink-500 transition-colors shadow-2xl">
            <Heart class="w-5 h-5" />
          </button>
          <button class="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-blue-500 transition-colors shadow-2xl">
            <Download class="w-5 h-5" />
          </button>
          <button class="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-emerald-500 transition-colors shadow-2xl">
            <Share2 class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- History Bar -->
    <div class="h-24 border-t border-white/5 bg-slate-900/50 p-3 flex gap-3 overflow-x-auto scrollbar-none">
      <div 
        v-for="(src, idx) in history" 
        :key="idx"
        @click="imageSrc = src"
        class="h-full aspect-[3/4] rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-pink-500 transition-all shrink-0"
      >
        <img :src="src" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
