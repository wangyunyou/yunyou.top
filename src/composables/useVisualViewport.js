import { ref, computed, onMounted, onUnmounted } from 'vue';

// 移动端软键盘适配:
// iOS Safari / Android Chrome 键盘弹出时 visualViewport 会缩小,
// 但 100dvh 不跟随变化,导致输入框被顶出可视区。
// 监听 visualViewport resize,仅在键盘弹出(可视高度 < 窗口高度)时
// 动态压缩容器高度,让输入框始终保持在键盘上方。
export function useVisualViewport() {
  const vh = ref(typeof window !== 'undefined' ? window.innerHeight : 0);
  const isCoarsePointer =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(pointer: coarse)').matches
      : false;

  let keyboardOpen = false;
  const update = () => {
    if (!window.visualViewport) return;
    const viewportH = window.visualViewport.height;
    const windowH = window.innerHeight;
    keyboardOpen = viewportH < windowH - 80; // 阈值:明显小于窗口才算键盘弹出
    vh.value = keyboardOpen ? viewportH : windowH;
  };

  // 键盘弹出时压缩高度,否则保持 100%(由 h-full 控制)
  const containerStyle = computed(() => {
    if (!isCoarsePointer || !keyboardOpen) return null;
    return { height: `${vh.value}px` };
  });

  onMounted(() => {
    if (!isCoarsePointer || !window.visualViewport) return;
    window.visualViewport.addEventListener('resize', update);
    update();
  });

  onUnmounted(() => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', update);
    }
  });

  return { vh, isCoarsePointer, containerStyle };
}
