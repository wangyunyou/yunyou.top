<script setup>
import { ref, onMounted } from 'vue';
import {
  Image as ImageIcon,
  RefreshCw,
  Download,
  Heart,
  Share2,
  Sparkles,
  LayoutGrid,
} from 'lucide-vue-next';

const imageSrc = ref('');
const isLoading = ref(true);
const history = ref([]);

const sources = [
  { name: '云优精选', api: 'https://api.yujn.cn/api/heisi.php?' },
  {
    name: '次元壁纸',
    api: 'https://api.btstu.cn/sjbz/api.php?method=mobile&lx=dongman&',
  },
  {
    name: '风景艺术',
    api: 'https://api.btstu.cn/sjbz/api.php?method=mobile&lx=fengjing&',
  },
];

const currentSource = ref(sources[0]);

const refreshImage = () => {
  isLoading.value = true;
  const timestamp = new Date().getTime();
  const api = currentSource.value.api;
  const newSrc = `${api}_t=${timestamp}`;

  const img = new Image();
  img.src = newSrc;
  img.onload = () => {
    imageSrc.value = newSrc;
    isLoading.value = false;
    history.value.unshift(newSrc);
    if (history.value.length > 20) history.value.pop();
  };
  img.onerror = () => {
    isLoading.value = false;
    // Fallback or alert
  };
};

const downloadImage = () => {
  if (!imageSrc.value) return;
  // Create a temporary link to trigger download
  const link = document.createElement('a');
  link.href = imageSrc.value;
  link.download = `yunyou-pic-${Date.now()}.jpg`;
  link.target = '_blank'; // Fallback for some browsers
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const selectSource = (source) => {
  currentSource.value = source;
  refreshImage();
};

onMounted(() => {
  refreshImage();
});
</script>

<template>
  <div class="h-full bg-slate-950 flex flex-col select-none overflow-hidden">
    <!-- Header -->
    <div
      class="p-4 border-b border-white/5 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10"
    >
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-pink-500/20 rounded-lg text-pink-400">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-white font-bold text-sm">云优美图赏析</h3>
            <p class="text-[9px] text-slate-500 uppercase tracking-widest">
              多源负载均衡中
            </p>
          </div>
        </div>

        <!-- Source Selector -->
        <div class="hidden md:flex bg-white/5 rounded-xl p-1 gap-1">
          <button
            v-for="source in sources"
            :key="source.name"
            @click="selectSource(source)"
            class="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
            :class="
              currentSource.name === source.name
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-slate-200'
            "
          >
            {{ source.name }}
          </button>
        </div>
      </div>

      <button
        @click="refreshImage"
        :disabled="isLoading"
        class="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-pink-500/20"
      >
        <RefreshCw class="w-4 h-4" :class="isLoading ? 'animate-spin' : ''" />
        下一张
      </button>
    </div>

    <!-- Image Viewer -->
    <div
      class="flex-1 relative flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black overflow-hidden"
    >
      <!-- Background Blur -->
      <div
        class="absolute inset-0 opacity-10 blur-[120px] transition-all duration-1000 scale-150"
        :style="{
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover',
        }"
      ></div>

      <!-- Main Image Card -->
      <div
        class="relative group h-full max-w-full flex items-center justify-center"
      >
        <div
          v-if="isLoading"
          class="absolute inset-0 flex items-center justify-center z-10 bg-black/20 backdrop-blur-sm rounded-2xl"
        >
          <div class="flex flex-col items-center gap-4">
            <div
              class="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"
            ></div>
            <div
              class="text-[10px] text-pink-400 font-bold tracking-widest animate-pulse"
            >
              资源同步中...
            </div>
          </div>
        </div>

        <img
          v-show="!isLoading"
          :src="imageSrc"
          class="h-full max-w-full rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/10 object-contain transition-all duration-500 hover:scale-[1.01]"
          alt="Discovery"
        />

        <!-- Hover Controls -->
        <div
          class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
        >
          <button
            class="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-pink-500 transition-colors shadow-2xl border border-white/10"
          >
            <Heart class="w-5 h-5" />
          </button>
          <button 
            @click="downloadImage"
            class="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-blue-500 transition-colors shadow-2xl border border-white/10"
            title="下载原图"
          >
            <Download class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- History Bar -->
    <div
      class="h-24 border-t border-white/5 bg-slate-900/50 p-3 flex gap-3 overflow-x-auto scrollbar-none"
    >
      <div
        v-for="(src, idx) in history"
        :key="idx"
        @click="imageSrc = src"
        class="h-full aspect-[3/4] rounded-lg overflow-hidden border transition-all shrink-0 hover:scale-105 active:scale-95"
        :class="
          imageSrc === src
            ? 'border-pink-500 ring-2 ring-pink-500/20 shadow-lg'
            : 'border-white/10'
        "
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
