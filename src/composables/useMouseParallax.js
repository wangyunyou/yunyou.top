import { ref, onMounted, onUnmounted } from 'vue';

export function useMouseParallax() {
  const offsetX = ref(0);
  const offsetY = ref(0);

  function onMouseMove(e) {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    offsetX.value = x;
    offsetY.value = y;
  }

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMove);
  });

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove);
  });

  return { offsetX, offsetY };
}
