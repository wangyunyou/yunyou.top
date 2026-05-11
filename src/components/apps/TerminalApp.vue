<script setup>
import { ref, onMounted, nextTick } from 'vue';
import MatrixRain from '@/components/os/MatrixRain.vue';

const output = ref([
  { type: 'info', text: 'YunYou OS [Version 2.0.0]' },
  { type: 'info', text: 'System secure. Matrix protocol ready.' },
  { type: 'info', text: '' },
  { type: 'info', text: 'Type "help" to see available commands.' },
]);

const input = ref('');
const inputRef = ref(null);
const containerRef = ref(null);
const isMatrixMode = ref(false);

const scrollToBottom = async () => {
  await nextTick();
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight;
  }
};

const handleEnter = () => {
  const cmd = input.value.trim();
  if (!cmd) return;

  if (isMatrixMode.value && cmd === 'exit') {
    isMatrixMode.value = false;
    output.value.push({ type: 'info', text: 'Returning from the void...' });
    input.value = '';
    return;
  }

  output.value.push({ type: 'command', text: `yunyou@system:~$ ${cmd}` });

  switch (cmd.toLowerCase()) {
    case 'help':
      output.value.push({
        type: 'info',
        text: 'Commands: help, about, matrix, clear, date, system-info',
      });
      break;
    case 'matrix':
      isMatrixMode.value = true;
      output.value.push({ type: 'success', text: 'Follow the white rabbit...' });
      break;
    case 'date':
      output.value.push({ type: 'info', text: new Date().toLocaleString() });
      break;
    case 'system-info':
      output.value.push({ type: 'info', text: 'OS: YunYou OS v2.0' });
      output.value.push({ type: 'info', text: 'Kernel: Vue3-Vite-Tailwind' });
      output.value.push({ type: 'info', text: 'Uptime: 100%' });
      break;
    case 'clear':
      output.value = [];
      break;
    default:
      output.value.push({
        type: 'error',
        text: `Command not found: ${cmd}`,
      });
  }

  input.value = '';
  scrollToBottom();
};

onMounted(() => {
  inputRef.value?.focus();
});
</script>

<template>
  <div
    ref="containerRef"
    class="h-full bg-[#050505] font-mono text-sm p-4 overflow-auto text-green-500/90 relative selection:bg-green-500/30 selection:text-white"
    @click="inputRef?.focus()"
  >
    <!-- Matrix Animation -->
    <MatrixRain v-if="isMatrixMode" />

    <!-- Scanline Effect Overlay -->
    <div class="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

    <div class="relative z-0">
      <div v-for="(line, idx) in output" :key="idx" class="mb-1 leading-relaxed break-all">
        <span v-if="line.type === 'error'" class="text-red-500/90">✗ {{ line.text }}</span>
        <span v-else-if="line.type === 'command'" class="text-white/60">{{ line.text }}</span>
        <span v-else-if="line.type === 'success'" class="text-emerald-400">✔ {{ line.text }}</span>
        <span v-else>{{ line.text }}</span>
      </div>

      <div class="flex items-center gap-2 mt-3">
        <span class="text-emerald-500 font-bold">yunyou@system:~$</span>
        <input
          ref="inputRef"
          v-model="input"
          @keydown.enter="handleEnter"
          type="text"
          class="bg-transparent border-none outline-none flex-1 text-white caret-emerald-500"
          autofocus
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Retro CRT flicker effect */
@keyframes flicker {
  0% { opacity: 0.97; }
  5% { opacity: 0.95; }
  10% { opacity: 0.99; }
  15% { opacity: 0.96; }
  100% { opacity: 1; }
}

.h-full {
  animation: flicker 0.1s infinite;
}
</style>
