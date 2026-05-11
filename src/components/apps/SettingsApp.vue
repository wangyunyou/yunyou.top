<script setup>
import { useConfigStore } from '../../stores/configStore';
import { Monitor, Image as ImageIcon, Check } from 'lucide-vue-next';

const configStore = useConfigStore();
</script>

<template>
  <div class="h-full flex flex-col bg-slate-900 text-slate-200 overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
      <h2 class="text-xl font-bold flex items-center gap-2">
        <Monitor class="w-5 h-5 text-sky-400" />
        系统设置
      </h2>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-8">
      <!-- Wallpaper Section -->
      <section>
        <div class="flex items-center gap-2 mb-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <ImageIcon class="w-4 h-4" />
          桌面壁纸
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div 
            v-for="wp in configStore.wallpapers" 
            :key="wp.id"
            @click="configStore.setWallpaper(wp.url)"
            class="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all"
            :class="configStore.wallpaper === wp.url ? 'border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'border-transparent hover:border-white/20'"
          >
            <img :src="wp.url" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
            <div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <span class="text-[10px] font-medium">{{ wp.name }}</span>
            </div>
            
            <!-- Selected Badge -->
            <div 
              v-if="configStore.wallpaper === wp.url"
              class="absolute top-2 right-2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300"
            >
              <Check class="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </section>

      <!-- System Info Section -->
      <section class="p-4 bg-white/5 rounded-2xl border border-white/10">
        <h3 class="text-sm font-bold mb-4">系统信息</h3>
        <div class="space-y-3 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-500">OS 版本</span>
            <span class="font-mono text-sky-400">云优 (YunYou) OS v1.2.0-alpha</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">内核类型</span>
            <span class="font-mono">Vue 3 + Pinia + Vite</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">运行环境</span>
            <span class="font-mono text-emerald-500">Stable Node v22</span>
          </div>
        </div>
      </section>

      <!-- Appearance -->
      <section>
        <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
          <div>
            <h3 class="font-medium text-sm">毛玻璃效果</h3>
            <p class="text-[10px] text-slate-500">启用高强度背景模糊 (耗能)</p>
          </div>
          <div class="w-10 h-5 bg-emerald-500 rounded-full relative">
             <div class="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <div class="p-4 text-center text-[10px] text-slate-600">
      &copy; 2026 云优网络 (YunYouNet). All rights reserved.
    </div>
  </div>
</template>
