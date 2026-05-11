<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: String,
  iconComponent: Object,
});

const emit = defineEmits(['dblclick']);
</script>

<template>
  <button
    class="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 focus:bg-white/20 transition-colors group w-[90px] text-center"
    @dblclick="$emit('dblclick')"
  >
    <div
      class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform"
    >
      <component :is="iconComponent" class="w-7 h-7" />
    </div>
    <span class="text-xs text-white drop-shadow-md font-medium px-1 rounded">{{
      label
    }}</span>
  </button>
</template>
