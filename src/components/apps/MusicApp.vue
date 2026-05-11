<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, ListMusic, Heart } from 'lucide-vue-next';

const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.7);
const showPlaylist = ref(false);

const playlist = reactive([
  {
    id: 1,
    title: 'Neon Nights',
    artist: 'SynthWave Explorer',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '6:12'
  },
  {
    id: 2,
    title: 'Digital Dreams',
    artist: 'Cloud Traveler',
    cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '7:05'
  },
  {
    id: 3,
    title: 'Cyberpunk Soul',
    artist: 'Matrix Beats',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '5:48'
  }
]);

const currentTrackIndex = ref(0);
const currentTrack = computed(() => playlist[currentTrackIndex.value]);

const audio = new Audio();

const togglePlay = () => {
  if (isPlaying.value) {
    audio.pause();
  } else {
    audio.play();
  }
  isPlaying.value = !isPlaying.value;
};

const nextTrack = () => {
  currentTrackIndex.value = (currentTrackIndex.value + 1) % playlist.length;
  playCurrentTrack();
};

const prevTrack = () => {
  currentTrackIndex.value = (currentTrackIndex.value - 1 + playlist.length) % playlist.length;
  playCurrentTrack();
};

const playCurrentTrack = () => {
  audio.src = currentTrack.value.url;
  if (isPlaying.value) audio.play();
};

const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

onMounted(() => {
  audio.src = currentTrack.value.url;
  audio.volume = volume.value;
  
  audio.ontimeupdate = () => {
    currentTime.value = audio.currentTime;
  };
  
  audio.onloadedmetadata = () => {
    duration.value = audio.duration;
  };

  audio.onended = () => {
    nextTrack();
  };
});

onUnmounted(() => {
  audio.pause();
  audio.src = '';
});

const progress = computed(() => {
  if (!duration.value) return 0;
  return (currentTime.value / duration.value) * 100;
});

const seek = (e) => {
  const percent = e.target.value / 100;
  audio.currentTime = percent * duration.value;
};
</script>

<template>
  <div class="h-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden select-none">
    <!-- Player Main Area -->
    <div class="flex-1 min-h-0 flex flex-col items-center justify-center p-6 md:p-8 relative">
      <!-- Animated Background Mesh -->
      <div class="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div class="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/20 blur-[120px] animate-pulse"></div>
        <div class="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500/20 blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
      </div>

      <!-- Album Art -->
      <div class="relative group mb-8">
        <div class="absolute -inset-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
        <div class="relative w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img :src="currentTrack.cover" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt="Cover" />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Music class="w-12 h-12 text-white/50" />
          </div>
        </div>
      </div>

      <!-- Track Info -->
      <div class="text-center z-10">
        <h2 class="text-2xl font-bold tracking-tight mb-1 text-white">{{ currentTrack.title }}</h2>
        <p class="text-slate-400 font-medium">{{ currentTrack.artist }}</p>
      </div>

      <!-- Progress Bar -->
      <div class="w-full max-w-md mt-8 md:mt-12 z-10 px-4">
        <input 
          type="range" 
          min="0" 
          max="100" 
          :value="progress"
          @input="seek"
          class="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
        />
        <div class="flex justify-between mt-2 text-[10px] font-mono text-slate-500">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-8 mt-6 md:mt-8 z-10 mb-4">
        <button @click="prevTrack" class="p-2 text-slate-400 hover:text-white transition-colors">
          <SkipBack class="w-6 h-6" />
        </button>
        
        <button 
          @click="togglePlay"
          class="w-16 h-16 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <Pause v-if="isPlaying" class="w-8 h-8 fill-current" />
          <Play v-else class="w-8 h-8 fill-current translate-x-0.5" />
        </button>

        <button @click="nextTrack" class="p-2 text-slate-400 hover:text-white transition-colors">
          <SkipForward class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="h-16 border-t border-white/5 bg-white/5 backdrop-blur-md px-6 flex items-center justify-between z-20">
      <div class="flex items-center gap-4">
        <button @click="showPlaylist = !showPlaylist" :class="showPlaylist ? 'text-purple-400' : 'text-slate-400'" class="hover:text-white transition-colors">
          <ListMusic class="w-5 h-5" />
        </button>
        <button class="text-slate-400 hover:text-red-400 transition-colors">
          <Heart class="w-5 h-5" />
        </button>
      </div>

      <div class="flex items-center gap-3 group">
        <Volume2 class="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          v-model="volume"
          @input="audio.volume = volume"
          class="w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
        />
      </div>
    </div>

    <!-- Playlist Overlay -->
    <Transition name="slide-up">
      <div v-if="showPlaylist" class="absolute inset-0 bg-slate-950/90 backdrop-blur-xl z-30 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-white">播放列表</h3>
          <button @click="showPlaylist = false" class="text-slate-400 hover:text-white">关闭</button>
        </div>
        <div class="space-y-2">
          <div 
            v-for="(track, index) in playlist" 
            :key="track.id"
            @click="currentTrackIndex = index; playCurrentTrack(); showPlaylist = false"
            class="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
            :class="currentTrackIndex === index ? 'bg-white/10 text-white' : 'text-slate-400'"
          >
            <div class="flex items-center gap-4">
              <img :src="track.cover" class="w-10 h-10 rounded-lg object-cover" />
              <div>
                <div class="font-medium text-sm">{{ track.title }}</div>
                <div class="text-xs opacity-50">{{ track.artist }}</div>
              </div>
            </div>
            <div class="text-xs font-mono">{{ track.duration }}</div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

input[type='range']::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  border: none;
}
</style>
