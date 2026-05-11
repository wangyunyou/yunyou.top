<script setup>
import { ref } from 'vue';

const output = ref([
  { type: 'info', text: 'YunYou OS [Version 1.0.0]' },
  { type: 'info', text: '(c) 2025 YunYou. All rights reserved.' },
  { type: 'info', text: '' },
  { type: 'info', text: 'Type "help" for a list of commands.' },
]);

const input = ref('');

const handleEnter = () => {
  const cmd = input.value.trim();
  if (!cmd) return;

  output.value.push({ type: 'command', text: `C:\\Users\\YunYou> ${cmd}` });

  // Command processing logic
  switch (cmd.toLowerCase()) {
    case 'help':
      output.value.push({
        type: 'info',
        text: 'Available commands: help, about, clear, echo [text]',
      });
      break;
    case 'about':
      output.value.push({
        type: 'info',
        text: 'YunYou OS is a portfolio project built with Vue 3.',
      });
      break;
    case 'clear':
      output.value = [];
      break;
    default:
      if (cmd.startsWith('echo ')) {
        output.value.push({ type: 'info', text: cmd.slice(5) });
      } else {
        output.value.push({
          type: 'error',
          text: `'${cmd}' is not recognized as an internal or external command.`,
        });
      }
  }

  input.value = '';
  // Scroll to bottom logic would go here
};
</script>

<template>
  <div
    class="h-full bg-black font-mono text-sm p-2 overflow-auto text-slate-300"
    @click="$refs.inputRef?.focus()"
  >
    <div v-for="(line, idx) in output" :key="idx" class="mb-1">
      <span v-if="line.type === 'error'" class="text-red-400">{{
        line.text
      }}</span>
      <span v-else>{{ line.text }}</span>
    </div>

    <div class="flex items-center gap-2 mt-2">
      <span class="text-slate-400">C:\Users\YunYou></span>
      <input
        ref="inputRef"
        v-model="input"
        @keydown.enter="handleEnter"
        type="text"
        class="bg-transparent border-none outline-none flex-1 text-slate-100"
        autofocus
      />
    </div>
  </div>
</template>
