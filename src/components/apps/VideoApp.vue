<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import {
  Play,
  Pause,
  Volume2,
  Maximize,
  RefreshCw,
  Zap,
  Flame,
  Heart,
  Share2,
  MessageCircle,
  Activity,
  ShieldAlert,
} from 'lucide-vue-next';

const videoRef = ref(null);
const isPlaying = ref(false);
const volume = ref(0.8);
const showControls = ref(true);
let controlsTimeout = null;

const shortVideoTypes = [
  {
    id: 'zzxjj',
    name: '随机视频',
    icon: Flame,
    api: 'https://api.yujn.cn/api/zzxjj.php?type=video',
  },
  {
    id: 'nvda',
    name: '热门精选',
    icon: Zap,
    api: 'https://api.yujn.cn/api/nvda.php?type=video',
  },
  {
    id: 'tianmei',
    name: '甜美可爱',
    icon: Heart,
    api: 'https://api.yujn.cn/api/tianmei.php?type=video',
  },
];

const currentType = ref(shortVideoTypes[0]);
const videoUrl = ref('');
const isLoading = ref(true);
const loadError = ref(false);

const refreshVideo = () => {
  isLoading.value = true;
  loadError.value = false;
  const timestamp = new Date().getTime();
  const api = currentType.value.api;
  const separator = api.includes('?') ? '&' : '?';
  videoUrl.value = `${api}${separator}_t=${timestamp}`;
  isPlaying.value = false;
  if (videoRef.value) videoRef.value.load();
};

const selectType = (type) => {
  currentType.value = type;
  refreshVideo();
};

const togglePlay = () => {
  if (videoRef.value.paused) {
    videoRef.value.play();
    isPlaying.value = true;
  } else {
    videoRef.value.pause();
    isPlaying.value = false;
  }
};

const onVideoPlay = () => {
  isLoading.value = false;
  isPlaying.value = true;
  loadError.value = false;
};

const onVideoError = () => {
  isLoading.value = false;
  loadError.value = true;
  console.error('Video loading failed or timed out.');
};

const handleMouseMove = () => {
  showControls.value = true;
  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(() => {
    if (isPlaying.value) showControls.value = false;
  }, 3000);
};

onMounted(() => {
  refreshVideo();
});

onUnmounted(() => {
  clearTimeout(controlsTimeout);
});
</script>

<template>
  <div class="h-full bg-black flex overflow-hidden select-none font-sans">
    <!-- Sidebar: Categories -->
    <div
      class="w-20 md:w-48 border-r border-white/5 bg-slate-900/80 backdrop-blur-xl flex flex-col items-center py-6 gap-6"
    >
      <div class="mb-4 px-4 text-center">
        <div
          class="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 mx-auto mb-2"
        >
          <Play class="w-6 h-6 text-white fill-current" />
        </div>
        <h2
          class="hidden md:block text-xs font-black uppercase tracking-tighter text-white"
        >
          云优短视频
        </h2>
      </div>

      <div class="flex-1 w-full px-3 space-y-3">
        <button
          v-for="type in shortVideoTypes"
          :key="type.id"
          @click="selectType(type)"
          class="w-full p-3 rounded-2xl flex flex-col md:flex-row items-center gap-3 transition-all duration-300"
          :class="
            currentType.id === type.id
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105'
              : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
          "
        >
          <component :is="type.icon" class="w-5 h-5" />
          <span class="hidden md:block text-xs font-bold">{{ type.name }}</span>
        </button>
      </div>

      <button
        @click="refreshVideo"
        class="w-12 h-12 md:w-40 md:h-12 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl flex items-center justify-center gap-2 transition-all"
      >
        <RefreshCw class="w-5 h-5" :class="isLoading ? 'animate-spin' : ''" />
        <span class="hidden md:block text-xs font-bold">换一个</span>
      </button>
    </div>

    <!-- Main Content: Vertical Player -->
    <div
      class="flex-1 relative flex flex-col group overflow-hidden bg-slate-950"
      @mousemove="handleMouseMove"
    >
      <!-- Player Container -->
      <div
        class="flex-1 min-h-0 flex items-center justify-center p-4 md:p-6 lg:p-8"
      >
        <div
          class="relative h-full max-h-full aspect-[9/16] bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(244,63,94,0.1)] border-[6px] border-white/5 ring-1 ring-white/10"
        >
          <!-- Loading State -->
          <div
            v-if="isLoading"
            class="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 backdrop-blur-md"
          >
            <div
              class="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mb-4"
            ></div>
            <div
              class="text-[10px] text-rose-500 font-bold uppercase tracking-widest animate-pulse"
            >
              正在穿透网络负载...
            </div>
          </div>

          <!-- Error State -->
          <div
            v-if="loadError"
            class="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/90 p-8 text-center"
          >
            <ShieldAlert class="w-12 h-12 text-rose-500 mb-4" />
            <div class="text-sm font-bold text-white mb-2">
              当前资源节点响应缓慢
            </div>
            <div class="text-xs text-slate-500 mb-6">
              第三方接口压力过大，建议切换分类或重试
            </div>
            <button
              @click="refreshVideo"
              class="px-6 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-400 transition-colors"
            >
              重新加载
            </button>
          </div>

          <video
            ref="videoRef"
            class="w-full h-full object-cover"
            :src="videoUrl"
            loop
            @playing="onVideoPlay"
            @click="togglePlay"
            @error="onVideoError"
            autoplay
          ></video>

          <!-- UI Overlays (Same as before) -->
          <div
            class="absolute bottom-10 right-4 flex flex-col gap-6 items-center z-30"
          >
            <div class="flex flex-col items-center gap-1">
              <div
                class="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white cursor-pointer"
              >
                <Heart class="w-6 h-6" />
              </div>
              <span class="text-[10px] font-bold text-white/50">99k+</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white cursor-pointer"
              >
                <MessageCircle class="w-6 h-6" />
              </div>
              <span class="text-[10px] font-bold text-white/50">1.2k</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white cursor-pointer"
              >
                <Share2 class="w-6 h-6" />
              </div>
              <span class="text-[10px] font-bold text-white/50">分享</span>
            </div>
          </div>

          <div
            class="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"
          >
            <div class="text-white font-bold mb-2">@云优官方节点</div>
            <div class="text-xs text-white/70 line-clamp-2">
              当前线路：{{
                currentType.name
              }}。如果播放缓慢，请尝试点击右上角刷新。
            </div>
          </div>

          <div
            v-if="!isPlaying && !isLoading && !loadError"
            class="absolute inset-0 flex items-center justify-center z-40 bg-black/20"
            @click="togglePlay"
          >
            <Play class="w-20 h-20 text-white/50 fill-current" />
          </div>
        </div>
      </div>

      <!-- Floating Controls -->
      <div
        class="absolute top-8 left-8 right-8 flex items-center justify-between pointer-events-none"
      >
        <div
          class="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3"
        >
          <div class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <span
            class="text-[10px] font-black text-white uppercase tracking-widest"
            >{{ currentType.name }} 频道</span
          >
        </div>

        <div class="flex items-center gap-4 pointer-events-auto">
          <button
            @click="refreshVideo"
            class="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-rose-500 transition-all active:scale-90 shadow-xl"
          >
            <RefreshCw
              class="w-5 h-5"
              :class="isLoading ? 'animate-spin' : ''"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
}
</style>
