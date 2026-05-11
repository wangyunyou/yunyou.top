<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: String,
  iconComponent: [Object, Function],
});

const emit = defineEmits(['dblclick']);
</script>

<template>
  <button
    class="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-all duration-300 group w-[100px] text-center active:scale-95"
    @click="$emit('click')"
  >
    <div
      class="w-14 h-14 bg-gradient-to-tr from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex items-center justify-center text-white group-hover:scale-110 group-hover:border-white/40 group-hover:shadow-sky-500/20 transition-all duration-500"
    >
      <component :is="iconComponent" class="w-7 h-7 drop-shadow-lg" />
    </div>
    <span class="text-xs text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-semibold tracking-wide px-1.5 py-0.5 rounded group-hover:bg-sky-500/20 transition-colors">{{
      label
    }}</span>
  </button>
</template>
