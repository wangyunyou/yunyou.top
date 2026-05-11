<script setup>
import { ref } from 'vue';
import { Globe, ArrowLeft, ArrowRight, RotateCw, ExternalLink, Search } from 'lucide-vue-next';

const urlInput = ref('https://www.bing.com');
const currentUrl = ref('https://www.bing.com');
const iframeRef = ref(null);

const navigate = () => {
  let url = urlInput.value.trim();
  if (!url) return;
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  currentUrl.value = url;
  urlInput.value = url;
};

const refresh = () => {
  const oldUrl = currentUrl.value;
  currentUrl.value = '';
  setTimeout(() => {
    currentUrl.value = oldUrl;
  }, 10);
};

const openExternal = () => {
  window.open(currentUrl.value, '_blank');
};
</script>

<template>
  <div class="h-full flex flex-col bg-white overflow-hidden">
    <!-- Browser Toolbar -->
    <div class="h-12 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-4 shrink-0">
      <div class="flex items-center gap-1">
        <button class="p-1.5 hover:bg-slate-200 rounded text-slate-400 cursor-not-allowed">
          <ArrowLeft class="w-4 h-4" />
        </button>
        <button class="p-1.5 hover:bg-slate-200 rounded text-slate-400 cursor-not-allowed">
          <ArrowRight class="w-4 h-4" />
        </button>
        <button @click="refresh" class="p-1.5 hover:bg-slate-200 rounded text-slate-600 active:rotate-180 transition-transform duration-500">
          <RotateCw class="w-4 h-4" />
        </button>
      </div>

      <div class="flex-1 flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1 gap-2 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
        <Globe class="w-3.5 h-3.5 text-slate-400" />
        <input 
          v-model="urlInput"
          @keydown.enter="navigate"
          type="text" 
          class="flex-1 text-xs outline-none text-slate-700 font-sans"
          placeholder="输入网址或搜索..."
        />
        <button @click="navigate" class="text-slate-400 hover:text-sky-600">
          <Search class="w-3.5 h-3.5" />
        </button>
      </div>

      <button @click="openExternal" class="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="在浏览器打开">
        <ExternalLink class="w-4 h-4" />
      </button>
    </div>

    <!-- Webview Area -->
    <div class="flex-1 bg-slate-50 relative">
      <iframe 
        v-if="currentUrl"
        ref="iframeRef"
        :src="currentUrl" 
        class="w-full h-full border-none bg-white"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
      
      <!-- Safe Content Warning overlay (only visible if content fails to load or for first time) -->
      <div class="absolute bottom-4 right-4 max-w-xs p-3 bg-white/90 backdrop-blur shadow-xl border border-slate-200 rounded-xl pointer-events-none transition-opacity duration-500">
        <div class="flex items-start gap-3">
          <div class="p-1.5 bg-amber-100 rounded text-amber-600 shrink-0">
            <Globe class="w-3 h-3" />
          </div>
          <div>
            <h4 class="text-[10px] font-bold text-slate-800 mb-0.5">传送门说明</h4>
            <p class="text-[9px] text-slate-500 leading-normal">
              部分网站（如 Google, GitHub）禁止被嵌入。如果页面空白，请点击右上角图标在外部打开。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure the iframe fills the container correctly */
iframe {
  color-scheme: light;
}
</style>
