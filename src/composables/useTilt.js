import { ref } from 'vue';

export function useTilt() {
  const tiltEl = ref(null);
  const transform = ref('');
  const glowX = ref(50);
  const glowY = ref(50);
  const isHovering = ref(false);

  function onMouseMove(e) {
    if (!tiltEl.value) return;
    const rect = tiltEl.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    transform.value = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    glowX.value = (x / rect.width) * 100;
    glowY.value = (y / rect.height) * 100;
  }

  function onMouseEnter() {
    isHovering.value = true;
  }

  function onMouseLeave() {
    isHovering.value = false;
    transform.value = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    glowX.value = 50;
    glowY.value = 50;
  }

  return { tiltEl, transform, glowX, glowY, isHovering, onMouseMove, onMouseEnter, onMouseLeave };
}
