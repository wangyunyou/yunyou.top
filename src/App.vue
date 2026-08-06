<template>
  <main class="h-viewport w-screen overflow-hidden relative font-sans text-slate-200 bg-[#030305]">
    <!-- KeepAlive 缓存页面组件：主页/应用页切换时保留状态与滚动位置，
         返回时瞬间恢复，避免重新挂载导致的卡顿（粒子重启、presence 重连、滚动丢失） -->
    <router-view v-slot="{ Component }">
      <keep-alive include="MagazineHome">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </main>
</template>
