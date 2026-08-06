<script setup>
import { ref } from 'vue';
import { useConfigStore } from '../../stores/configStore';
import {
  Monitor,
  Image as ImageIcon,
  Check,
  Sparkles,
  ListVideo,
  Trash2,
  Info,
  RotateCcw,
} from 'lucide-vue-next';

const configStore = useConfigStore();

// 版本号由 vite define 注入（template 中直接使用会被编译成属性访问而无法替换）
const appVersion = __APP_VERSION__;

// ---------- 效果开关 ----------
const toggle = (key) => configStore.setSetting(key, !configStore.settings[key]);

// ---------- 数据管理 ----------
const clearing = ref(false);
const clearData = () => {
  if (!window.confirm('确定清除全部本地数据？\n将恢复默认壁纸和设置，并删除：聊天昵称、AI 对话记录、游戏最高分。')) return;
  clearing.value = true;
  configStore.resetAll();
  setTimeout(() => {
    window.location.reload();
  }, 300);
};

// ---------- 关于 ----------
const runtime = (() => {
  const ua = navigator.userAgent;
  const browser = ua.includes('Edg')
    ? 'Edge'
    : ua.includes('Chrome')
      ? 'Chrome'
      : ua.includes('Firefox')
        ? 'Firefox'
        : ua.includes('Safari')
          ? 'Safari'
          : /MicroMessenger/i.test(ua)
            ? '微信内置浏览器'
            : '未知浏览器';
  const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? '移动端' : '桌面端';
  return `${browser} · ${device}`;
})();
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
      <!-- ===== 壁纸 ===== -->
      <section>
        <div class="flex items-center gap-2 mb-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <ImageIcon class="w-4 h-4" />
          桌面壁纸
        </div>

        <!-- 预设壁纸 -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div
            v-for="wp in configStore.wallpapers"
            :key="wp.id"
            @click="configStore.setWallpaper(wp.url)"
            class="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all"
            :class="configStore.wallpaper === wp.url ? 'border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'border-transparent hover:border-white/20'"
          >
            <img :src="wp.url" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
            <div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <span class="text-[10px] font-medium">{{ wp.name }}</span>
            </div>
            <div
              v-if="configStore.wallpaper === wp.url"
              class="absolute top-2 right-2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Check class="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </section>

      <!-- ===== 主页效果 ===== -->
      <section>
        <div class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <Sparkles class="w-4 h-4" />
          主页效果
        </div>
        <p class="text-xs text-slate-500 mb-2">关闭动效可降低耗电，低性能设备更流畅</p>

        <div class="bg-white/5 rounded-2xl border border-white/10 px-4 divide-y divide-white/5">
          <div class="flex items-center justify-between py-3.5">
            <div>
              <p class="text-sm text-slate-200">粒子背景</p>
              <p class="text-xs text-slate-500 mt-0.5">主页星空连线粒子动画</p>
            </div>
            <button
              role="switch"
              :aria-checked="configStore.settings.particles"
              @click="toggle('particles')"
              class="relative w-11 h-6 rounded-full transition-colors shrink-0"
              :class="configStore.settings.particles ? 'bg-sky-500' : 'bg-white/10'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                :class="configStore.settings.particles ? 'translate-x-5' : ''"
              ></span>
            </button>
          </div>
        </div>
      </section>

      <!-- ===== 数据管理 ===== -->
      <section>
        <div class="flex items-center gap-2 mb-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <ListVideo class="w-4 h-4" />
          数据管理
        </div>
        <button
          @click="clearData"
          :disabled="clearing"
          class="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 transition-colors disabled:opacity-50"
        >
          <span class="flex items-center gap-2.5 text-sm text-red-300">
            <Trash2 class="w-4 h-4" />
            清除全部本地数据
          </span>
          <span class="text-xs text-slate-500">{{ clearing ? '处理中…' : '壁纸 · 设置 · 聊天 · AI · 游戏' }}</span>
        </button>
      </section>

      <!-- ===== 关于 ===== -->
      <section class="p-4 bg-white/5 rounded-2xl border border-white/10">
        <h3 class="text-sm font-bold mb-4 flex items-center gap-2">
          <Info class="w-4 h-4 text-sky-400" />
          关于
        </h3>
        <div class="space-y-3 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-500">OS 版本</span>
            <span class="font-mono text-sky-400">云优 (YunYou) OS v{{ appVersion }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">内核类型</span>
            <span class="font-mono">Vue 3 + Pinia + Vite</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">运行环境</span>
            <span class="font-mono text-emerald-500">{{ runtime }}</span>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <div class="p-4 text-center text-[10px] text-slate-600">
      <span class="inline-flex items-center gap-1">
        <RotateCcw class="w-3 h-3" />
        yunyou.top · 设置即存本地，仅对当前设备生效
      </span>
    </div>
  </div>
</template>
