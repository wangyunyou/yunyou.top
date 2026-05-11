<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Shield, Activity, Wifi, Zap, Globe, Cpu } from 'lucide-vue-next';

const logs = ref([]);
const commands = [
  'INITIALIZING QUANTUM ENCRYPTION...',
  'BYPASSING FIREWALL: ATTEMPT 4...',
  'UPLOADING VIRUS TO NODE-72...',
  'ACCESS GRANTED: ROOT_USER',
  'DECRYPTING DATABASE: 42%',
  'INTERCEPTING SATELLITE SIGNAL...',
  'WARNING: INTRUSION DETECTED!',
  'RELAYING THROUGH PROXY: BERLIN-01',
];

const nodes = ref(Array(12).fill(0).map(() => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  active: Math.random() > 0.5
})));

let interval = null;

onMounted(() => {
  interval = setInterval(() => {
    // Add fake logs
    logs.value.push(commands[Math.floor(Math.random() * commands.length)]);
    if (logs.value.length > 15) logs.value.shift();
    
    // Toggle nodes
    nodes.value.forEach(n => {
      if (Math.random() > 0.8) n.active = !n.active;
    });
  }, 800);
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<template>
  <div class="fixed inset-0 z-[9999] bg-black text-emerald-500 font-mono overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-500">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-emerald-900/50 pb-4 mb-6">
      <div class="flex items-center gap-4">
        <Shield class="w-8 h-8 animate-pulse text-emerald-400" />
        <div>
          <h1 class="text-xl font-bold tracking-tighter">GLOBAL THREAT MONITOR</h1>
          <p class="text-[10px] text-emerald-700">ENCRYPTION LEVEL: MILITARY-GRADE AES-256</p>
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs">SYSTEM STATUS: <span class="text-emerald-400">CRITICAL</span></div>
        <div class="text-[10px] opacity-50">{{ new Date().toISOString() }}</div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="flex-1 grid grid-cols-12 gap-6 min-h-0">
      
      <!-- Left Column: Global Map/Nodes -->
      <div class="col-span-8 border border-emerald-900/30 bg-emerald-950/5 rounded-xl relative p-4 flex flex-col overflow-hidden">
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#10b981_0%,_transparent_70%)]"></div>
        <div class="flex items-center gap-2 mb-4 text-xs font-bold text-emerald-600">
          <Globe class="w-4 h-4" /> ACTIVE NODES MAP
        </div>
        
        <div class="flex-1 relative border border-emerald-900/20 rounded">
          <div 
            v-for="(node, i) in nodes" 
            :key="i"
            class="absolute w-3 h-3 rounded-full transition-all duration-500"
            :class="node.active ? 'bg-emerald-400 shadow-[0_0_15px_#10b981]' : 'bg-emerald-900 opacity-20'"
            :style="{ left: `${node.x}%`, top: `${node.y}%` }"
          ></div>
          <!-- Random SVG Lines between nodes -->
          <svg class="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
            <line x1="10%" y1="20%" x2="40%" y2="50%" stroke="currentColor" stroke-width="0.5" />
            <line x1="40%" y1="50%" x2="80%" y2="30%" stroke="currentColor" stroke-width="0.5" />
            <line x1="80%" y1="30%" x2="20%" y2="80%" stroke="currentColor" stroke-width="0.5" />
          </svg>
        </div>
      </div>

      <!-- Right Column: Stats & Logs -->
      <div class="col-span-4 flex flex-col gap-6 min-h-0">
        <!-- Logs Card -->
        <div class="flex-1 border border-emerald-900/30 bg-black rounded-xl p-4 flex flex-col overflow-hidden">
          <div class="text-[10px] text-emerald-600 font-bold mb-3 flex items-center gap-2">
            <Zap class="w-3 h-3" /> CONSOLE OUTPUT
          </div>
          <div class="flex-1 overflow-hidden space-y-1">
            <div v-for="(log, i) in logs" :key="i" class="text-[10px] leading-tight animate-in slide-in-from-left duration-300">
              <span class="text-emerald-800">[{{ i }}]</span> {{ log }}
            </div>
          </div>
        </div>

        <!-- System Stats -->
        <div class="h-48 border border-emerald-900/30 bg-emerald-950/10 rounded-xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-2"><Cpu class="w-3 h-3" /> CORE_TEMP</span>
            <span class="text-emerald-400">72°C</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-2"><Wifi class="w-3 h-3" /> UPLINK</span>
            <span class="text-emerald-400">8.2 GB/s</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-2"><Activity class="w-3 h-3" /> SYNC_ERR</span>
            <span class="text-red-500 animate-pulse">0.003%</span>
          </div>
          <div class="h-12 flex items-end gap-0.5 mt-2 overflow-hidden">
            <div 
              v-for="i in 30" 
              :key="i"
              class="flex-1 bg-emerald-500/30"
              :style="{ height: `${Math.random() * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Controls -->
    <div class="mt-6 flex items-center justify-between text-[10px] border-t border-emerald-900/50 pt-4">
      <div class="flex gap-6 uppercase tracking-widest text-emerald-700">
        <span>Sub-System: OK</span>
        <span>Secure: True</span>
        <span>Terminal: Ready</span>
      </div>
      <button 
        @click="$emit('exit')"
        class="px-6 py-2 border border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-400 transition-all active:scale-95"
      >
        TERMINATE SESSION (ESC)
      </button>
    </div>

    <!-- Scanline Effect Overlay -->
    <div class="absolute inset-0 pointer-events-none z-[10000] opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
  </div>
</template>

<style scoped>
@keyframes flicker {
  0% { opacity: 0.97; }
  5% { opacity: 0.95; }
  10% { opacity: 0.99; }
  100% { opacity: 1; }
}
div { animation: flicker 0.15s infinite; }
</style>
