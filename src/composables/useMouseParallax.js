import { ref, onMounted, onUnmounted } from 'vue';

// 触屏设备下鼠标视差无意义,直接禁用,避免无谓的事件监听
const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(pointer: coarse)').matches
  : false;

export function useMouseParallax() {
  const offsetX = ref(0);
  const offsetY = ref(0);

  function onMouseMove(e) {
    if (isCoarsePointer) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    offsetX.value = x;
    offsetY.value = y;
  }

  onMounted(() => {
    if (!isCoarsePointer) {
      window.addEventListener('mousemove', onMouseMove);
    }
  });

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove);
  });

  return { offsetX, offsetY };
}
