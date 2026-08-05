<template>
  <div class="fixed inset-0 bg-[#0a0a11] flex items-center justify-center overflow-hidden">
    <!-- 背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[140px]" />
      <div class="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-sky-600/15 blur-[130px]" />
    </div>

    <div class="relative z-10 text-center px-6">
      <!-- 404 大字 -->
      <div
        class="text-[140px] md:text-[200px] font-black leading-none tracking-[-0.06em] select-none"
        style="
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        "
      >
        404
      </div>

      <!-- 标题 -->
      <h2 class="text-xl md:text-2xl font-semibold text-white/90 mt-4 tracking-wide">
        页面不见了
      </h2>

      <!-- 描述 -->
      <p class="text-sm md:text-base text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed">
        你访问的路径 <code class="text-violet-400 bg-white/5 px-1.5 py-0.5 rounded text-sm">{{ currentPath }}</code> 不存在于这个宇宙
      </p>

      <!-- 返回按钮 -->
      <button
        @click="goHome"
        class="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium
               bg-white/10 hover:bg-white/15 text-white/90
               border border-white/10 hover:border-white/20
               transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        返回首页
      </button>

      <!-- 底部装饰 -->
      <div class="mt-12 flex items-center justify-center gap-2 text-slate-600 text-xs select-none">
        <span class="w-1 h-1 rounded-full bg-slate-600" />
        <span>yunyou.top</span>
        <span class="w-1 h-1 rounded-full bg-slate-600" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const currentPath = computed(() => route.path || '/');

function goHome() {
  router.push('/');
}
</script>
