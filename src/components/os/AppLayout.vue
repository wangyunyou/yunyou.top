<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

const title = computed(() => route.meta?.title || '应用');
const accent = computed(() => route.meta?.accent || 'sky');

const accentColors = {
  cyan: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]',
  violet: 'bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.6)]',
  rose: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.6)]',
  amber: 'bg-amber-400 shadow-[0_0_10px_rgba(252,211,77,0.6)]',
  indigo: 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.6)]',
  pink: 'bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.6)]',
  emerald: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]',
  slate: 'bg-slate-300 shadow-[0_0_10px_rgba(148,163,184,0.4)]',
  blue: 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.6)]',
  sky: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.6)]',
  orange: 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.6)]',
};

const dotClass = computed(() => accentColors[accent.value] || accentColors.sky);

const goHome = () => {
  // vue-router 每次 push 时会把上一个页面完整 URL 写入 history.state.back
  // hash 路由下应用内页面都带 '#/'，外部页面（微信/搜索直达等）不带 → 只在应用内才 back()
  const back = window.history.state?.back || '';
  if (back.includes('#/')) {
    router.back();
  } else {
    router.push('/');
  }
};

// Android 系统返回键兜底：外部直达应用页时，按返回键先拉回主页而不是直接退出应用
const handlePopState = () => {
  const back = window.history.state?.back || '';
  if (back && !back.includes('#/')) {
    router.push('/');
  }
};
onMounted(() => window.addEventListener('popstate', handlePopState));
onUnmounted(() => window.removeEventListener('popstate', handlePopState));
</script>

<template>
  <div class="h-screen supports-[height:100dvh]:h-dvh w-full flex flex-col bg-[#030305] text-slate-100 overflow-hidden">
    <!-- Top Bar -->
    <header class="h-12 md:h-14 pt-[env(safe-area-inset-top)] flex items-center justify-between px-3 md:px-6 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl shrink-0 z-50">
      <button
        @click="goHome"
        aria-label="返回上一页"
        class="flex items-center gap-2 px-3 min-h-11 min-w-11 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] active:scale-[0.97] active:bg-white/[0.12] transition-all text-sm font-medium group"
      >
        <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span class="inline">返回</span>
      </button>

      <div class="flex items-center gap-2.5">
        <div class="w-2 h-2 rounded-full" :class="dotClass"></div>
        <span class="text-sm font-semibold tracking-wide text-white">{{ title }}</span>
      </div>

      <div class="w-20 flex justify-end">
        <span class="text-[10px] text-slate-400 tracking-[0.2em] uppercase font-medium hidden md:inline">
          YUNYOU
        </span>
      </div>
    </header>

    <!-- App Content -->
    <main class="flex-1 overflow-hidden relative">
      <router-view />
    </main>
  </div>
</template>
