<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RefreshCw, Monitor, Image as ImageIcon, Settings, ExternalLink, Info } from 'lucide-vue-next';

const props = defineProps({
  x: Number,
  y: Number,
  visible: Boolean,
});

const emit = defineEmits(['close', 'action']);

const menuRef = ref(null);

const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

const actions = [
  { id: 'refresh', label: '刷新页面', icon: RefreshCw },
  { id: 'wallpaper', label: '更换壁纸', icon: ImageIcon },
  { id: 'monitor', label: '系统监控', icon: Monitor },
  { id: 'settings', label: '系统设置', icon: Settings },
  { divider: true },
  { id: 'about', label: '关于云优 OS', icon: Info },
  { id: 'github', label: '源码地址', icon: ExternalLink },
];

const handleAction = (id) => {
  emit('action', id);
  emit('close');
};
</script>

<template>
  <div 
    v-if="visible"
    ref="menuRef"
    class="fixed z-[1000] w-48 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in duration-150"
    :style="{ top: y + 'px', left: x + 'px' }"
  >
    <template v-for="(item, index) in actions" :key="index">
      <div v-if="item.divider" class="h-px bg-white/5 my-1 mx-2"></div>
      <button 
        v-else
        @click="handleAction(item.id)"
        class="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-sky-500 hover:text-white rounded-lg transition-all text-left group"
      >
        <component :is="item.icon" class="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        {{ item.label }}
      </button>
    </template>
  </div>
</template>
