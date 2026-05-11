<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { MemoryStick, Globe, Battery, Zap, Cpu, Info } from 'lucide-vue-next';

const memLoad = ref(0);
const memUsed = ref(0);
const memLimit = ref(0);
const netDown = ref(0);
const batteryLevel = ref(0);
const isCharging = ref(false);
const hardwareConcurrency = navigator.hardwareConcurrency || '未知';
const deviceMemory = navigator.deviceMemory || '未知';

const updateData = async () => {
  // 1. Real Memory (JS Heap)
  if (window.performance && performance.memory) {
    const used = performance.memory.usedJSHeapSize || 0;
    const limit = performance.memory.jsHeapLimit || 0;
    
    memUsed.value = (used / 1048576).toFixed(1);
    memLimit.value = (limit / 1048576).toFixed(1);
    
    if (limit > 0) {
      memLoad.value = (used / limit) * 100;
    } else {
      memLoad.value = 0;
    }
  } else {
    // If not supported, set to null or a flag
    memUsed.value = null;
  }

  // 2. Real Network (Downlink)
  if (navigator.connection) {
    netDown.value = navigator.connection.downlink || 0;
  }

  // 3. Real Battery
  if (navigator.getBattery) {
    const battery = await navigator.getBattery();
    batteryLevel.value = Math.floor(battery.level * 100);
    isCharging.value = battery.charging;
  }
};

let interval = null;
onMounted(() => {
  updateData();
  interval = setInterval(updateData, 2000); // 采样率调低一点，更真实
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<template>
  <div class="h-full bg-slate-900 text-slate-200 overflow-auto select-none font-sans">
    <!-- Header -->
    <div class="p-6 border-b border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-10">
      <h2 class="text-xl font-bold flex items-center gap-3">
        <Activity class="w-6 h-6 text-emerald-400" />
        系统真实负载监测
      </h2>
      <p class="text-[10px] text-slate-500 mt-1">数据来源：Web Performance & Device API (实时抓取)</p>
    </div>

    <div class="p-6 space-y-6">
      <!-- Hardware Hardware Specs -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center gap-4">
          <div class="p-3 bg-sky-500/10 rounded-xl text-sky-400">
            <Cpu class="w-6 h-6" />
          </div>
          <div>
            <div class="text-[10px] text-slate-500 uppercase font-bold">逻辑核心数</div>
            <div class="text-xl font-mono font-bold">{{ hardwareConcurrency }} Cores</div>
          </div>
        </div>
        <div class="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center gap-4">
          <div class="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <Info class="w-6 h-6" />
          </div>
          <div>
            <div class="text-[10px] text-slate-500 uppercase font-bold">设备近似内存</div>
            <div class="text-xl font-mono font-bold">{{ deviceMemory }} GB</div>
          </div>
        </div>
      </div>

      <!-- Memory Card -->
      <div class="bg-white/5 rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <MemoryStick class="w-5 h-5 text-purple-400" />
            <span class="font-bold">JS 堆栈内存占用 (Heap)</span>
          </div>
          <span v-if="memUsed !== null" class="text-2xl font-mono font-bold text-purple-400">{{ (memLoad || 0).toFixed(2) }}%</span>
          <span v-else class="text-sm font-bold text-slate-500 uppercase">不支持此 API</span>
        </div>
        
        <div class="w-full bg-white/5 h-3 rounded-full overflow-hidden mb-4 p-0.5 border border-white/5">
          <div 
            class="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
            :style="{ width: `${memLoad || 0}%` }"
          ></div>
        </div>
        
        <div class="flex justify-between items-end">
          <div class="space-y-1">
             <div class="text-[10px] text-slate-500 uppercase">已分配资源</div>
             <div class="text-lg font-mono font-bold text-white">{{ memUsed || '--' }} <span class="text-xs text-slate-500">MB</span></div>
          </div>
          <div class="text-right space-y-1">
             <div class="text-[10px] text-slate-500 uppercase">环境上限</div>
             <div class="text-lg font-mono font-bold text-white">{{ memLimit || '--' }} <span class="text-xs text-slate-500">MB</span></div>
          </div>
        </div>

        <!-- Overly for Unsupported -->
        <div v-if="memUsed === null" class="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center z-20">
          <p class="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-widest">
            当前浏览器（如 Safari/Firefox）<br>暂不支持实时内存采样
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Network -->
        <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div class="flex items-center gap-3 mb-6">
            <Globe class="w-5 h-5 text-amber-400" />
            <span class="font-bold">下行带宽 (Downlink)</span>
          </div>
          <div class="text-center py-4">
            <div class="text-5xl font-mono font-bold text-slate-100 mb-2">{{ netDown }}</div>
            <div class="text-xs text-amber-500 font-bold tracking-widest uppercase">Mbps</div>
          </div>
          <p class="text-[9px] text-slate-600 text-center mt-4 italic">此数据代表浏览器检测到的网络最大估计速度</p>
        </div>

        <!-- Battery -->
        <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div class="flex items-center gap-3 mb-6">
            <Battery class="w-5 h-5 text-emerald-400" />
            <span class="font-bold">电池健康 (Power)</span>
          </div>
          <div class="flex flex-col items-center">
            <div class="relative w-32 h-16 border-4 border-white/10 rounded-xl p-1.5 mb-4">
               <div 
                class="h-full rounded-md transition-all duration-1000 flex items-center justify-center text-[10px] font-bold text-white shadow-lg" 
                :class="batteryLevel > 20 ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'"
                :style="{ width: `${batteryLevel}%` }"
               >
               </div>
               <div class="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-6 bg-white/10 rounded-r-md"></div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-3xl font-mono font-bold">{{ batteryLevel }}%</span>
              <div v-if="isCharging" class="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-bold flex items-center gap-1">
                <Zap class="w-3 h-3 fill-current" /> 充电中
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Warning for non-chrome users -->
    <div v-if="!memUsed" class="mx-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex gap-3">
       <Info class="w-4 h-4 shrink-0" />
       <p>检测到当前浏览器不支持 `performance.memory` API（如 Safari/Firefox）。为了保证数据的“绝对真实”，已自动停用该模块的模拟显示。</p>
    </div>
  </div>
</template>

<script>
import { Activity } from 'lucide-vue-next';
export default {
  components: { Activity }
}
</script>
