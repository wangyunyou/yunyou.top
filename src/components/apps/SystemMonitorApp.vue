<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Cpu, MemoryStick, Activity, Globe } from 'lucide-vue-next';

const cpuLoad = ref(15);
const memLoad = ref(42);
const netUp = ref(1.2);
const netDown = ref(4.5);
const history = ref(Array(20).fill(0));

let interval = null;

onMounted(() => {
  interval = setInterval(() => {
    // Simulate dynamic data
    cpuLoad.value = Math.floor(Math.random() * 30) + 10;
    memLoad.value = Math.min(95, memLoad.value + (Math.random() - 0.5));
    netUp.value = parseFloat((Math.random() * 2).toFixed(1));
    netDown.value = parseFloat((Math.random() * 10).toFixed(1));
    
    history.value.push(cpuLoad.value);
    if (history.value.length > 20) history.value.shift();
  }, 1000);
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<template>
  <div class="h-full bg-slate-900/50 p-6 text-slate-200 overflow-auto">
    <div class="grid grid-cols-2 gap-4 mb-8">
      <!-- CPU Card -->
      <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-sky-500/20 rounded-lg text-sky-400">
            <Cpu class="w-5 h-5" />
          </div>
          <span class="font-medium">CPU Load</span>
          <span class="ml-auto text-sky-400 font-mono">{{ cpuLoad }}%</span>
        </div>
        <div class="w-full bg-white/5 h-2 rounded-full overflow-hidden">
          <div 
            class="bg-sky-500 h-full transition-all duration-1000" 
            :style="{ width: `${cpuLoad}%` }"
          ></div>
        </div>
      </div>

      <!-- RAM Card -->
      <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-purple-500/20 rounded-lg text-purple-400">
            <MemoryStick class="w-5 h-5" />
          </div>
          <span class="font-medium">Memory</span>
          <span class="ml-auto text-purple-400 font-mono">{{ memLoad.toFixed(1) }}%</span>
        </div>
        <div class="w-full bg-white/5 h-2 rounded-full overflow-hidden">
          <div 
            class="bg-purple-500 h-full transition-all duration-1000" 
            :style="{ width: `${memLoad}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Activity Graph -->
    <div class="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
      <div class="flex items-center gap-3 mb-6">
        <Activity class="w-5 h-5 text-emerald-400" />
        <span class="font-medium">Processor Activity</span>
      </div>
      <div class="h-32 flex items-end gap-1 px-2">
        <div 
          v-for="(val, idx) in history" 
          :key="idx"
          class="flex-1 bg-emerald-500/40 rounded-t min-w-[4px] transition-all duration-500"
          :style="{ height: `${val}%` }"
        ></div>
      </div>
    </div>

    <!-- Network -->
    <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div class="flex items-center gap-3 mb-6">
        <Globe class="w-5 h-5 text-amber-400" />
        <span class="font-medium">Network Throughput</span>
      </div>
      <div class="grid grid-cols-2 gap-8 text-center">
        <div>
          <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Upload</div>
          <div class="text-2xl font-mono text-slate-200">{{ netUp }} <span class="text-sm">Mbps</span></div>
        </div>
        <div>
          <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Download</div>
          <div class="text-2xl font-mono text-slate-200">{{ netDown }} <span class="text-sm">Mbps</span></div>
        </div>
      </div>
    </div>
  </div>
</template>
