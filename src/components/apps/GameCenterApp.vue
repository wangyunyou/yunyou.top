<script setup>
import {
  ref,
  computed,
  watch,
  nextTick,
  inject,
  onMounted,
  onUnmounted,
} from 'vue';
import {
  Gamepad2,
  RotateCcw,
  ChevronLeft,
  Layers,
  Pause,
  Play,
} from 'lucide-vue-next';

const currentGame = ref(null);
const windowContext = inject('windowContext', null);

// Persistence
const bestSnake = ref(parseInt(localStorage.getItem('snake-best') || '0'));
const best2048 = ref(parseInt(localStorage.getItem('2048-best') || '0'));
const bestTetris = ref(parseInt(localStorage.getItem('tetris-best') || '0'));

// --- Responsive Game Sizes ---
const snakeCellSize = ref(20);
const board2048Size = ref(320);
const tile2048Step = computed(() =>
  Math.floor((board2048Size.value - 16 - 24) / 4)
);
const tile2048Size = computed(() => tile2048Step.value - 8);
// 真正的格起点步长 = 单格宽 + 间隙(8)
const tile2048Stride = computed(() => tile2048Step.value + 8);

const updateGameSizes = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const snakeAvail = Math.min(vw - 32, vh - 180);
  snakeCellSize.value = Math.max(12, Math.min(20, Math.floor(snakeAvail / 20)));
  board2048Size.value = Math.min(320, vw - 48);
};

// --- Tetris ---
const TETRIS_COLS = 10;
const TETRIS_ROWS = 20;
const tetrisShapes = {
  I: [['I', 'I', 'I', 'I']],
  O: [
    ['O', 'O'],
    ['O', 'O'],
  ],
  T: [
    ['', 'T', ''],
    ['T', 'T', 'T'],
  ],
  S: [
    ['', 'S', 'S'],
    ['S', 'S', ''],
  ],
  Z: [
    ['Z', 'Z', ''],
    ['', 'Z', 'Z'],
  ],
  J: [
    ['J', '', ''],
    ['J', 'J', 'J'],
  ],
  L: [
    ['', '', 'L'],
    ['L', 'L', 'L'],
  ],
};
const tetrisTypes = Object.keys(tetrisShapes);
const TETRIS_COLORS = {
  I: '#22d3ee',
  O: '#fbbf24',
  T: '#a78bfa',
  S: '#34d399',
  Z: '#f87171',
  J: '#60a5fa',
  L: '#fb923c',
};

const tetrisBoard = ref([]);
const tetrisPiece = ref(null);
const tetrisNext = ref(null);
const tetrisScore = ref(0);
const tetrisLevel = ref(1);
const tetrisLines = ref(0);
const tetrisGameOver = ref(false);
const tetrisPaused = ref(false);
const tetrisViewportRef = ref(null);
const tetrisBoardSize = ref({ width: 320, height: 640 });
let tetrisTimer = null;
let tetrisResizeObserver = null;

// --- Snake ---
const snake = ref([{ x: 10, y: 10 }]);
const food = ref({ x: 5, y: 5 });
const direction = ref({ x: 0, y: -1 });
const score = ref(0);
const gameOver = ref(false);
let gameInterval = null;

const startSnake = () => {
  currentGame.value = 'snake';
  stopTetrisTimer();
  resetSnake();
};
const resetSnake = () => {
  snake.value = [{ x: 10, y: 10 }];
  direction.value = { x: 0, y: -1 };
  score.value = 0;
  gameOver.value = false;
  spawnFood();
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(moveSnake, 150);
};
const spawnFood = () => {
  food.value = {
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20),
  };
};
const moveSnake = () => {
  if (gameOver.value) return;
  const head = {
    x: snake.value[0].x + direction.value.x,
    y: snake.value[0].y + direction.value.y,
  };
  if (
    head.x < 0 ||
    head.x >= 20 ||
    head.y < 0 ||
    head.y >= 20 ||
    snake.value.some((s) => s.x === head.x && s.y === head.y)
  ) {
    gameOver.value = true;
    clearInterval(gameInterval);
    return;
  }
  snake.value.unshift(head);
  if (head.x === food.value.x && head.y === food.value.y) {
    score.value += 10;
    if (score.value > bestSnake.value) {
      bestSnake.value = score.value;
      localStorage.setItem('snake-best', bestSnake.value.toString());
    }
    spawnFood();
  } else {
    snake.value.pop();
  }
};

// --- 2048 ---
const tiles = ref([]);
const score2048 = ref(0);
const gameOver2048 = ref(false);
let nextId = 0;

const start2048 = () => {
  currentGame.value = '2048';
  stopTetrisTimer();
  reset2048();
};
const reset2048 = () => {
  tiles.value = [];
  score2048.value = 0;
  gameOver2048.value = false;
  addRandomTile();
  addRandomTile();
};

const addRandomTile = () => {
  const occupied = new Set(
    tiles.value.filter((t) => !t.mergedInto).map((t) => `${t.r},${t.c}`)
  );
  const empties = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!occupied.has(`${r},${c}`)) empties.push({ r, c });
    }
  }
  if (empties.length > 0) {
    const { r, c } = empties[Math.floor(Math.random() * empties.length)];
    tiles.value.push({ id: nextId++, val: Math.random() < 0.9 ? 2 : 4, r, c });
  }
};

const move2048 = (dir) => {
  if (gameOver2048.value) return;

  // Cleanup any lingering merged tiles immediately to prevent logic pollution
  tiles.value = tiles.value.filter((t) => !t.mergedInto);

  const oldState = JSON.stringify(
    tiles.value.map((t) => ({ r: t.r, c: t.c, val: t.val }))
  );
  const isVertical = dir === 'up' || dir === 'down';
  const isReverse = dir === 'right' || dir === 'down';

  for (let i = 0; i < 4; i++) {
    let line = tiles.value.filter((t) => (isVertical ? t.c : t.r) === i);
    line.sort((a, b) => (isVertical ? a.r - b.r : a.c - b.c));
    if (isReverse) line.reverse();

    let nextPos = isReverse ? 3 : 0;
    for (let j = 0; j < line.length; j++) {
      let current = line[j];
      let prev = line[j - 1];

      if (prev && prev.val === current.val && !prev.mergedFrom) {
        current.r = prev.r;
        current.c = prev.c;
        current.mergedInto = prev.id;
        prev.val *= 2;
        prev.mergedFrom = true;
        score2048.value += prev.val;
        if (score2048.value > best2048.value) {
          best2048.value = score2048.value;
          localStorage.setItem('2048-best', best2048.value.toString());
        }
      } else {
        if (isVertical) current.r = nextPos;
        else current.c = nextPos;
        nextPos = isReverse ? nextPos - 1 : nextPos + 1;
      }
    }
  }

  tiles.value.forEach((t) => delete t.mergedFrom);
  const newState = JSON.stringify(
    tiles.value.map((t) => ({ r: t.r, c: t.c, val: t.val }))
  );

  if (oldState !== newState) {
    setTimeout(addRandomTile, 100);
    // Remove merged tiles after animation
    setTimeout(() => {
      tiles.value = tiles.value.filter((t) => !t.mergedInto);
    }, 100);
  }
  checkGameOver2048();
};

const checkGameOver2048 = () => {
  if (tiles.value.filter((t) => !t.mergedInto).length < 16) return;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const t = tiles.value.find(
        (t) => t.r === r && t.c === c && !t.mergedInto
      );
      const right = tiles.value.find(
        (t) => t.r === r && t.c === c + 1 && !t.mergedInto
      );
      const down = tiles.value.find(
        (t) => t.r === r + 1 && t.c === c && !t.mergedInto
      );
      if (t && ((right && right.val === t.val) || (down && down.val === t.val)))
        return;
    }
  }
  gameOver2048.value = true;
};

const createTetrisBoard = () =>
  Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(''));

const randomTetrisPiece = () => {
  const type = tetrisTypes[Math.floor(Math.random() * tetrisTypes.length)];
  return {
    type,
    shape: tetrisShapes[type].map((row) => [...row]),
    x: Math.floor((TETRIS_COLS - tetrisShapes[type][0].length) / 2),
    y: 0,
  };
};

const tetrisCollides = (board, shape, x, y) => {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue;
      const boardX = x + col;
      const boardY = y + row;
      if (boardX < 0 || boardX >= TETRIS_COLS || boardY >= TETRIS_ROWS)
        return true;
      if (boardY >= 0 && board[boardY][boardX]) return true;
    }
  }
  return false;
};

const tetrisDisplay = computed(() => {
  const board = tetrisBoard.value.map((row) => [...row]);
  const piece = tetrisPiece.value;
  if (piece) {
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (!cell) return;
        const boardY = piece.y + y;
        const boardX = piece.x + x;
        if (
          boardY >= 0 &&
          boardY < TETRIS_ROWS &&
          boardX >= 0 &&
          boardX < TETRIS_COLS
        ) {
          board[boardY][boardX] = piece.type;
        }
      });
    });
  }
  return board;
});

const tetrisNextCells = computed(() => {
  const preview = Array.from({ length: 2 }, () => Array(4).fill(''));
  if (!tetrisNext.value) return preview;
  const shape = tetrisNext.value.shape;
  const startX = Math.max(0, Math.floor((4 - shape[0].length) / 2));
  shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) preview[y][startX + x] = tetrisNext.value.type;
    });
  });
  return preview;
});

const updateBestTetris = () => {
  if (tetrisScore.value > bestTetris.value) {
    bestTetris.value = tetrisScore.value;
    localStorage.setItem('tetris-best', bestTetris.value.toString());
  }
};

const stopTetrisTimer = () => {
  if (tetrisTimer) clearInterval(tetrisTimer);
  tetrisTimer = null;
};

const restartTetrisTimer = () => {
  stopTetrisTimer();
  if (tetrisGameOver.value) return;
  tetrisTimer = setInterval(() => {
    if (!tetrisGameOver.value && !tetrisPaused.value) tetrisMove(0, 1);
  }, Math.max(140, 700 - (tetrisLevel.value - 1) * 70));
};

const spawnTetrisPiece = () => {
  tetrisPiece.value = tetrisNext.value || randomTetrisPiece();
  tetrisNext.value = randomTetrisPiece();

  if (
    tetrisCollides(
      tetrisBoard.value,
      tetrisPiece.value.shape,
      tetrisPiece.value.x,
      tetrisPiece.value.y
    )
  ) {
    tetrisGameOver.value = true;
    tetrisPiece.value = null;
    stopTetrisTimer();
    updateBestTetris();
  }
};

const lockTetrisPiece = () => {
  if (!tetrisPiece.value) return;
  const { shape, x, y, type } = tetrisPiece.value;

  shape.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!cell) return;
      const boardY = y + rowIndex;
      const boardX = x + colIndex;
      if (
        boardY >= 0 &&
        boardY < TETRIS_ROWS &&
        boardX >= 0 &&
        boardX < TETRIS_COLS
      ) {
        tetrisBoard.value[boardY][boardX] = type;
      }
    });
  });

  const clearedRows = tetrisBoard.value.filter((row) =>
    row.every(Boolean)
  ).length;
  if (clearedRows > 0) {
    tetrisBoard.value = tetrisBoard.value.filter((row) => !row.every(Boolean));
    for (let i = 0; i < clearedRows; i++) {
      tetrisBoard.value.unshift(Array(TETRIS_COLS).fill(''));
    }
    tetrisLines.value += clearedRows;
    tetrisScore.value +=
      [0, 100, 300, 500, 800][clearedRows] * tetrisLevel.value;
    tetrisLevel.value = Math.floor(tetrisLines.value / 10) + 1;
    updateBestTetris();
  }

  spawnTetrisPiece();
  restartTetrisTimer();
};

const tetrisMove = (dx, dy) => {
  if (!tetrisPiece.value || tetrisGameOver.value || tetrisPaused.value)
    return false;
  const nextX = tetrisPiece.value.x + dx;
  const nextY = tetrisPiece.value.y + dy;

  if (
    !tetrisCollides(tetrisBoard.value, tetrisPiece.value.shape, nextX, nextY)
  ) {
    tetrisPiece.value = { ...tetrisPiece.value, x: nextX, y: nextY };
    return true;
  }
  if (dy > 0) lockTetrisPiece();
  return false;
};

const tetrisRotate = () => {
  if (!tetrisPiece.value || tetrisGameOver.value || tetrisPaused.value) return;
  const shape = tetrisPiece.value.shape;
  const rotated = shape[0].map((_, index) =>
    shape.map((row) => row[index]).reverse()
  );
  const kicks = [0, -1, 1, -2, 2];

  for (const kick of kicks) {
    const nextX = tetrisPiece.value.x + kick;
    if (
      !tetrisCollides(tetrisBoard.value, rotated, nextX, tetrisPiece.value.y)
    ) {
      tetrisPiece.value = { ...tetrisPiece.value, shape: rotated, x: nextX };
      return;
    }
  }
};

const tetrisHardDrop = () => {
  if (!tetrisPiece.value || tetrisGameOver.value || tetrisPaused.value) return;
  let distance = 0;
  while (
    !tetrisCollides(
      tetrisBoard.value,
      tetrisPiece.value.shape,
      tetrisPiece.value.x,
      tetrisPiece.value.y + distance + 1
    )
  ) {
    distance++;
  }
  tetrisScore.value += distance * 2;
  tetrisPiece.value = {
    ...tetrisPiece.value,
    y: tetrisPiece.value.y + distance,
  };
  lockTetrisPiece();
  updateBestTetris();
};

const toggleTetrisPause = () => {
  if (!tetrisGameOver.value) tetrisPaused.value = !tetrisPaused.value;
};

const resetTetris = () => {
  stopTetrisTimer();
  tetrisBoard.value = createTetrisBoard();
  tetrisPiece.value = null;
  tetrisNext.value = randomTetrisPiece();
  tetrisScore.value = 0;
  tetrisLevel.value = 1;
  tetrisLines.value = 0;
  tetrisGameOver.value = false;
  tetrisPaused.value = false;
  spawnTetrisPiece();
  restartTetrisTimer();
};

const startTetris = () => {
  currentGame.value = 'tetris';
  resetTetris();
};

const updateTetrisBoardSize = () => {
  const el = tetrisViewportRef.value;
  if (!el) return;

  const isNarrow = el.clientWidth < 640;
  const sidePanelSpace = isNarrow ? 0 : 152;
  const availWidth = Math.max(220, el.clientWidth - 32 - sidePanelSpace);
  const availHeight = Math.max(320, el.clientHeight - 48);
  const width = Math.min(availWidth, availHeight / 2);

  tetrisBoardSize.value = {
    width: Math.floor(width),
    height: Math.floor(width * 2),
  };
};

watch(currentGame, async (game) => {
  if (game !== 'tetris') return;
  await nextTick();
  updateTetrisBoardSize();
  if (tetrisResizeObserver) tetrisResizeObserver.disconnect();
  tetrisResizeObserver = new ResizeObserver(updateTetrisBoardSize);
  if (tetrisViewportRef.value) {
    tetrisResizeObserver.observe(tetrisViewportRef.value);
  }
});

const handleKey = (e) => {
  if (windowContext && !windowContext.isActive.value) return;

  const target = e.target;
  if (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable)
  ) {
    return;
  }

  if (currentGame.value === 'snake') {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
    switch (e.key) {
      case 'ArrowUp':
        if (direction.value.y === 0) direction.value = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
        if (direction.value.y === 0) direction.value = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
        if (direction.value.x === 0) direction.value = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
        if (direction.value.x === 0) direction.value = { x: 1, y: 0 };
        break;
    }
  } else if (currentGame.value === '2048') {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const dirMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };
      move2048(dirMap[e.key]);
    }
  } else if (currentGame.value === 'tetris') {
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)
    ) {
      e.preventDefault();
    }
    switch (e.key) {
      case 'ArrowLeft':
        tetrisMove(-1, 0);
        break;
      case 'ArrowRight':
        tetrisMove(1, 0);
        break;
      case 'ArrowDown':
        tetrisMove(0, 1);
        break;
      case 'ArrowUp':
        tetrisRotate();
        break;
      case ' ':
        tetrisHardDrop();
        break;
      case 'p':
      case 'P':
        toggleTetrisPause();
        break;
    }
  }
};

// --- Touch Controls ---
let touchStartX = 0;
let touchStartY = 0;

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

const handleTouchEnd = (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const threshold = 20;
  if (absDx < threshold && absDy < threshold) return;

  if (currentGame.value === 'snake') {
    if (absDx > absDy) {
      if (dx > 0 && direction.value.x === 0) direction.value = { x: 1, y: 0 };
      else if (dx < 0 && direction.value.x === 0)
        direction.value = { x: -1, y: 0 };
    } else {
      if (dy > 0 && direction.value.y === 0) direction.value = { x: 0, y: 1 };
      else if (dy < 0 && direction.value.y === 0)
        direction.value = { x: 0, y: -1 };
    }
  } else if (currentGame.value === '2048') {
    if (absDx > absDy) move2048(dx > 0 ? 'right' : 'left');
    else move2048(dy > 0 ? 'down' : 'up');
  }
};

onMounted(() => {
  updateGameSizes();
  window.addEventListener('resize', updateGameSizes);
  window.addEventListener('keydown', handleKey);
});
onUnmounted(() => {
  window.removeEventListener('resize', updateGameSizes);
  window.removeEventListener('keydown', handleKey);
  if (gameInterval) clearInterval(gameInterval);
  stopTetrisTimer();
  if (tetrisResizeObserver) tetrisResizeObserver.disconnect();
});
</script>

<template>
  <div
    class="h-full bg-slate-900 text-white flex flex-col font-sans overflow-hidden select-none"
  >
    <div
      class="h-14 border-b border-white/5 flex items-center px-3 md:px-6 justify-between shrink-0"
    >
      <div class="flex items-center gap-3">
        <button
          v-if="currentGame"
          @click="
            currentGame = null;
            stopTetrisTimer();
          "
          class="p-1 hover:bg-white/10 rounded"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2">
          <Gamepad2 class="w-5 h-5 text-indigo-400" />
          <span class="font-bold">云优游戏厅</span>
        </div>
      </div>
      <div v-if="currentGame" class="flex items-center gap-4">
        <div class="flex flex-col items-end">
          <span class="text-[9px] text-white/30 uppercase font-bold"
            >Score</span
          >
          <span class="text-sm font-mono leading-none">{{
            currentGame === 'snake'
              ? score
              : currentGame === 'tetris'
              ? tetrisScore
              : score2048
          }}</span>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-[9px] text-amber-500/50 uppercase font-bold"
            >Best</span
          >
          <span class="text-sm font-mono leading-none text-amber-400">{{
            currentGame === 'snake'
              ? bestSnake
              : currentGame === 'tetris'
              ? bestTetris
              : best2048
          }}</span>
        </div>
        <button
          v-if="currentGame === 'tetris' && !tetrisGameOver"
          @click="toggleTetrisPause"
          class="p-2 hover:bg-white/10 rounded"
          title="暂停"
        >
          <Pause v-if="!tetrisPaused" class="w-4 h-4" />
          <Play v-else class="w-4 h-4" />
        </button>
        <button
          @click="
            currentGame === 'snake'
              ? resetSnake()
              : currentGame === 'tetris'
              ? resetTetris()
              : reset2048()
          "
          class="p-2 hover:bg-white/10 rounded"
        >
          <RotateCcw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div
      class="flex-1 relative flex items-start justify-center p-4 md:p-8 overflow-y-auto overflow-x-hidden"
    >
      <!-- Select -->
      <div
        v-if="!currentGame"
        class="grid grid-cols-2 gap-3 md:gap-6 max-w-3xl w-full"
      >
        <div
          @click="startSnake"
          class="aspect-square bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col justify-end gap-3 md:gap-4 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-2xl border border-white/10 group"
        >
          <div
            class="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl text-white"
          >
            <svg
              viewBox="0 0 24 24"
              class="w-8 h-8 md:w-10 md:h-10 fill-current"
            >
              <path
                d="M7 7h2v2H7V7zm4 0h2v2h-2V7zm4 0h2v2h-2V7zM7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM7 15h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
              />
            </svg>
          </div>
          <div>
            <h3 class="text-base md:text-xl font-bold">贪吃蛇</h3>
            <p class="text-xs text-white/50 mt-1">挑战极限</p>
          </div>
        </div>
        <div
          @click="start2048"
          class="aspect-square bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col justify-end gap-3 md:gap-4 cursor-pointer hover:scale-105 active:scale-95 transition-all border border-white/10 shadow-2xl group text-white"
        >
          <div
            class="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-xl"
          >
            <span class="text-xl md:text-2xl font-black font-mono">2048</span>
          </div>
          <div>
            <h3 class="text-base md:text-xl font-bold">2048</h3>
            <p class="text-xs text-white/50 mt-1">丝滑平移</p>
          </div>
        </div>
        <div
          @click="startTetris"
          class="aspect-square bg-gradient-to-br from-cyan-600 to-blue-900 rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col justify-end gap-3 md:gap-4 cursor-pointer hover:scale-105 active:scale-95 transition-all border border-white/10 shadow-2xl group text-white"
        >
          <div
            class="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl"
          >
            <Layers class="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h3 class="text-base md:text-xl font-bold">俄罗斯方块</h3>
            <p class="text-xs text-white/50 mt-1">消除行数</p>
          </div>
        </div>
      </div>

      <!-- Snake -->
      <div
        v-if="currentGame === 'snake'"
        class="relative animate-in fade-in zoom-in duration-500"
        @touchstart.passive="handleTouchStart"
        @touchmove.prevent
        @touchend.passive="handleTouchEnd"
      >
        <div
          class="grid grid-cols-20 grid-rows-20 bg-slate-800/50 backdrop-blur rounded-xl border border-white/10 shadow-2xl relative overflow-hidden"
          :style="{
            width: snakeCellSize * 20 + 'px',
            height: snakeCellSize * 20 + 'px',
          }"
        >
          <div
            class="absolute bg-rose-500 rounded-full"
            :style="{
              width: snakeCellSize - 2 + 'px',
              height: snakeCellSize - 2 + 'px',
              left: food.x * snakeCellSize + 1 + 'px',
              top: food.y * snakeCellSize + 1 + 'px',
            }"
          ></div>
          <div
            v-for="(seg, i) in snake"
            :key="i"
            class="absolute rounded-[4px] transition-all duration-150"
            :class="i === 0 ? 'bg-indigo-400 z-10' : 'bg-indigo-600/60'"
            :style="{
              width: snakeCellSize - 2 + 'px',
              height: snakeCellSize - 2 + 'px',
              left: seg.x * snakeCellSize + 1 + 'px',
              top: seg.y * snakeCellSize + 1 + 'px',
            }"
          ></div>
        </div>
        <div
          v-if="gameOver"
          class="absolute inset-0 bg-slate-950/80 backdrop-blur flex flex-col items-center justify-center rounded-xl z-50"
        >
          <h2 class="text-4xl font-black mb-2">GAME OVER</h2>
          <button
            @click="resetSnake"
            class="px-8 py-3 bg-indigo-600 rounded-full font-bold"
          >
            再来一局
          </button>
        </div>
      </div>

      <!-- 2048 -->
      <div
        v-if="currentGame === '2048'"
        class="flex flex-col items-center gap-4 md:gap-6 animate-in fade-in zoom-in duration-500 relative"
        @touchstart.passive="handleTouchStart"
        @touchmove.prevent
        @touchend.passive="handleTouchEnd"
      >
        <div
          class="relative bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 shadow-2xl p-2 overflow-hidden"
          :style="{ width: board2048Size + 'px', height: board2048Size + 'px' }"
        >
          <!-- 背景格：填满整个单元（size=step，无居中偏移）保证 4×4 网格满铺棋盘；
               活动格子 size=step-8 并加居中偏移，居中于背景格内形成"大格包小格"层次。
               translate 用 tile2048Stride（=step+gap=78）确保 4×4 总宽=步长×3+size=304 满铺棋盘内容区。 -->
          <div class="absolute inset-0 p-2">
            <div
              v-for="i in 16"
              :key="'bg' + i"
              class="absolute rounded-xl bg-white/5"
              :style="{
                width: tile2048Step + 'px',
                height: tile2048Step + 'px',
                transform: `translate3d(${((i - 1) % 4) * tile2048Stride}px, ${Math.floor((i - 1) / 4) * tile2048Stride}px, 0)`,
              }"
            ></div>
          </div>
          <div class="absolute inset-2 overflow-hidden">
            <transition-group name="tile">
              <div
                v-for="tile in tiles"
                :key="tile.id"
                class="absolute rounded-xl flex items-center justify-center font-black transition-all duration-100 ease-in-out"
                :style="{
                  width: tile2048Size + 'px',
                  height: tile2048Size + 'px',
                  fontSize: tile2048Size > 60 ? '1.25rem' : '1rem',
                  transform: `translate3d(${
                    tile.c * tile2048Stride + (tile2048Stride - tile2048Size) / 2
                  }px, ${
                    tile.r * tile2048Stride + (tile2048Stride - tile2048Size) / 2
                  }px, 0)`,
                  opacity: tile.mergedInto ? 0 : 1,
                }"
                :class="{
                  'bg-emerald-500 shadow-[0_0_15px_#10b981] z-20':
                    tile.val >= 2048,
                  'bg-amber-500 shadow-[0_0_10px_#f59e0b]': tile.val === 1024,
                  'bg-orange-500': tile.val === 512,
                  'bg-rose-500': tile.val === 256,
                  'bg-indigo-500': tile.val === 128,
                  'bg-blue-500': tile.val === 64,
                  'bg-sky-500': tile.val === 32,
                  'bg-teal-500': tile.val === 16,
                  'bg-emerald-600/80': tile.val === 8,
                  'bg-white/30 text-white': tile.val === 4,
                  'bg-white/20 text-white/80': tile.val === 2,
                }"
              >
                {{ tile.val }}
              </div>
            </transition-group>
          </div>
        </div>
        <div
          v-if="gameOver2048"
          class="absolute inset-0 bg-slate-950/80 backdrop-blur flex flex-col items-center justify-center rounded-xl z-50"
        >
          <h2 class="text-4xl font-black mb-8">无法移动</h2>
          <button
            @click="reset2048"
            class="px-8 py-3 bg-emerald-600 rounded-full font-bold"
          >
            重新开始
          </button>
        </div>
      </div>

      <!-- Tetris -->
      <div
        v-if="currentGame === 'tetris'"
        ref="tetrisViewportRef"
        class="w-full min-h-full flex flex-col md:flex-row items-center justify-center gap-6 animate-in fade-in zoom-in duration-500"
      >
        <div
          class="relative bg-slate-800/50 backdrop-blur rounded-xl border border-white/10 shadow-2xl p-2"
        >
          <div
            class="grid grid-cols-10 grid-rows-20 gap-px overflow-hidden rounded-lg bg-slate-950/40"
            :style="{
              width: tetrisBoardSize.width + 'px',
              height: tetrisBoardSize.height + 'px',
            }"
          >
            <div
              v-for="(cell, index) in tetrisDisplay.flat()"
              :key="index"
              class="rounded-[2px]"
              :class="
                cell
                  ? 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                  : 'bg-white/5'
              "
              :style="
                cell
                  ? { backgroundColor: TETRIS_COLORS[cell] || '#38bdf8' }
                  : {}
              "
            ></div>
          </div>

          <div
            v-if="tetrisGameOver"
            class="absolute inset-0 bg-slate-950/85 backdrop-blur flex flex-col items-center justify-center rounded-xl z-50"
          >
            <h2 class="text-4xl font-black mb-8">GAME OVER</h2>
            <button
              @click="resetTetris"
              class="px-8 py-3 bg-cyan-600 rounded-full font-bold"
            >
              再来一局
            </button>
          </div>
          <div
            v-else-if="tetrisPaused"
            class="absolute inset-0 bg-slate-950/80 backdrop-blur flex flex-col items-center justify-center rounded-xl z-50"
          >
            <h2 class="text-4xl font-black mb-8">已暂停</h2>
            <button
              @click="toggleTetrisPause"
              class="px-8 py-3 bg-cyan-600 rounded-full font-bold"
            >
              继续
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-4 w-28">
          <div class="bg-white/5 border border-white/10 rounded-xl p-3">
            <div class="text-[10px] text-white/40 uppercase font-bold">
              Next
            </div>
            <div class="grid grid-cols-4 grid-rows-2 gap-1 w-20 h-10 mt-2">
              <div
                v-for="(cell, index) in tetrisNextCells.flat()"
                :key="index"
                class="rounded-sm"
                :class="cell ? '' : 'bg-white/5'"
                :style="
                  cell
                    ? { backgroundColor: TETRIS_COLORS[cell] || '#38bdf8' }
                    : {}
                "
              ></div>
            </div>
          </div>
          <div
            class="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2 text-xs"
          >
            <div class="flex justify-between">
              <span class="text-white/40">Level</span
              ><span class="font-mono">{{ tetrisLevel }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/40">Lines</span
              ><span class="font-mono">{{ tetrisLines }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/40">Score</span
              ><span class="font-mono text-cyan-300">{{ tetrisScore }}</span>
            </div>
          </div>
        </div>

        <!-- Touch Controls (mobile only) -->
        <div class="md:hidden grid grid-cols-3 gap-2 w-full max-w-[240px]">
          <button
            @click="tetrisMove(-1, 0)"
            class="aspect-square bg-white/5 active:bg-white/20 rounded-xl flex items-center justify-center text-2xl border border-white/10 select-none"
          >
            ←
          </button>
          <button
            @click="tetrisRotate"
            class="aspect-square bg-white/5 active:bg-white/20 rounded-xl flex items-center justify-center text-2xl border border-white/10 select-none"
          >
            ⟳
          </button>
          <button
            @click="tetrisMove(1, 0)"
            class="aspect-square bg-white/5 active:bg-white/20 rounded-xl flex items-center justify-center text-2xl border border-white/10 select-none"
          >
            →
          </button>
          <button
            @click="tetrisMove(0, 1)"
            class="aspect-square bg-white/5 active:bg-white/20 rounded-xl flex items-center justify-center text-2xl border border-white/10 select-none"
          >
            ↓
          </button>
          <button
            @click="tetrisHardDrop"
            class="aspect-square bg-cyan-500/10 active:bg-cyan-500/30 rounded-xl flex items-center justify-center text-2xl border border-cyan-400/20 select-none"
          >
            ⤓
          </button>
          <button
            @click="toggleTetrisPause"
            class="aspect-square bg-white/5 active:bg-white/20 rounded-xl flex items-center justify-center text-2xl border border-white/10 select-none"
          >
            ⏸
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-cols-20 {
  grid-template-columns: repeat(20, minmax(0, 1fr));
}
.grid-rows-20 {
  grid-template-rows: repeat(20, minmax(0, 1fr));
}
.tile-enter-active {
  animation: tile-pop 200ms ease-out;
}
@keyframes tile-pop {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
.tile-move {
  transition: transform 100ms ease-in-out;
}
</style>
