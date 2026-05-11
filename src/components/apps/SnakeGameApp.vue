<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Trophy, RotateCcw, Play, Pause } from 'lucide-vue-next';

const canvas = ref(null);
const ctx = ref(null);
const score = ref(0);
const highScore = ref(localStorage.getItem('snake-highscore') || 0);
const isGameOver = ref(false);
const isPaused = ref(false);
const gameStarted = ref(false);

const gridSize = 20;
const tileCount = 20;

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;
let gameLoop = null;
let speed = 150;

const initGame = () => {
  snake = [{ x: 10, y: 10 }];
  generateFood();
  score.value = 0;
  dx = 0;
  dy = 0;
  nextDx = 0;
  nextDy = 0;
  isGameOver.value = false;
  gameStarted.value = false;
  speed = 150;
};

const generateFood = () => {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
  // Don't spawn food on snake
  if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    generateFood();
  }
};

const update = () => {
  if (isGameOver.value || isPaused.value || !gameStarted.value) return;

  dx = nextDx;
  dy = nextDy;

  if (dx === 0 && dy === 0) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Wall collision
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    endGame();
    return;
  }

  // Self collision
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  // Food collision
  if (head.x === food.x && head.y === food.y) {
    score.value += 10;
    if (score.value > highScore.value) {
      highScore.value = score.value;
      localStorage.setItem('snake-highscore', highScore.value);
    }
    generateFood();
    // Increase speed
    if (speed > 60) speed -= 2;
    clearInterval(gameLoop);
    gameLoop = setInterval(update, speed);
  } else {
    snake.pop();
  }

  draw();
};

const draw = () => {
  if (!ctx.value) return;

  // Clear canvas
  ctx.value.fillStyle = '#0f172a';
  ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height);

  // Draw Grid (subtle)
  ctx.value.strokeStyle = '#1e293b';
  ctx.value.lineWidth = 0.5;
  for (let i = 0; i <= tileCount; i++) {
    ctx.value.beginPath();
    ctx.value.moveTo(i * gridSize, 0);
    ctx.value.lineTo(i * gridSize, canvas.value.height);
    ctx.value.stroke();
    ctx.value.beginPath();
    ctx.value.moveTo(0, i * gridSize);
    ctx.value.lineTo(canvas.value.width, i * gridSize);
    ctx.value.stroke();
  }

  // Draw Food
  ctx.value.fillStyle = '#f43f5e';
  ctx.value.shadowBlur = 15;
  ctx.value.shadowColor = '#f43f5e';
  ctx.value.beginPath();
  ctx.value.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2.5,
    0,
    Math.PI * 2
  );
  ctx.value.fill();
  ctx.value.shadowBlur = 0;

  // Draw Snake
  snake.forEach((segment, i) => {
    const isHead = i === 0;
    ctx.value.fillStyle = isHead ? '#10b981' : '#059669';
    
    if (isHead) {
      ctx.value.shadowBlur = 10;
      ctx.value.shadowColor = '#10b981';
    }

    const x = segment.x * gridSize;
    const y = segment.y * gridSize;
    const r = isHead ? 6 : 4;
    
    // Draw rounded rect for snake parts
    ctx.value.beginPath();
    ctx.value.roundRect(x + 1, y + 1, gridSize - 2, gridSize - 2, r);
    ctx.value.fill();
    ctx.value.shadowBlur = 0;
  });
};

const endGame = () => {
  isGameOver.value = true;
  clearInterval(gameLoop);
};

const handleKeydown = (e) => {
  if (!gameStarted.value && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    gameStarted.value = true;
  }

  switch (e.key) {
    case 'ArrowUp':
      if (dy !== 1) { nextDx = 0; nextDy = -1; }
      break;
    case 'ArrowDown':
      if (dy !== -1) { nextDx = 0; nextDy = 1; }
      break;
    case 'ArrowLeft':
      if (dx !== 1) { nextDx = -1; nextDy = 0; }
      break;
    case 'ArrowRight':
      if (dx !== -1) { nextDx = 1; nextDy = 0; }
      break;
    case ' ':
      isPaused.value = !isPaused.value;
      break;
  }
};

onMounted(() => {
  ctx.value = canvas.value.getContext('2d');
  draw();
  window.addEventListener('keydown', handleKeydown);
  gameLoop = setInterval(update, speed);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  clearInterval(gameLoop);
});

const restart = () => {
  initGame();
  draw();
  gameLoop = setInterval(update, speed);
};
</script>

<template>
  <div class="h-full flex flex-col bg-slate-900 text-slate-200 p-6 select-none">
    <!-- Header Info -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex gap-8">
        <div class="flex flex-col">
          <span class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Current Score</span>
          <span class="text-2xl font-mono font-bold text-emerald-400">{{ score }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">High Score</span>
          <div class="flex items-center gap-2">
            <Trophy class="w-4 h-4 text-amber-400" />
            <span class="text-2xl font-mono font-bold text-amber-400">{{ highScore }}</span>
          </div>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button 
          @click="isPaused = !isPaused"
          class="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          title="Pause (Space)"
        >
          <Pause v-if="!isPaused" class="w-5 h-5" />
          <Play v-else class="w-5 h-5" />
        </button>
        <button 
          @click="restart"
          class="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          title="Restart"
        >
          <RotateCcw class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Game Area -->
    <div class="flex-1 flex items-center justify-center relative">
      <div class="relative border-4 border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-950">
        <canvas 
          ref="canvas" 
          width="400" 
          height="400"
          class="max-w-full h-auto"
        ></canvas>

        <!-- Overlays -->
        <div v-if="!gameStarted && !isGameOver" class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
          <div class="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
            <Play class="w-8 h-8 text-emerald-400 fill-current translate-x-0.5" />
          </div>
          <h3 class="text-xl font-bold mb-2">准备好了吗？</h3>
          <p class="text-sm text-slate-400">使用方向键控制蛇的移动<br>按下空格键暂停</p>
        </div>

        <div v-if="isGameOver" class="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 animate-in zoom-in">
          <h3 class="text-3xl font-black text-rose-500 mb-2 uppercase italic tracking-tighter">Game Over</h3>
          <p class="text-slate-400 mb-6">最终得分: <span class="text-white font-mono font-bold">{{ score }}</span></p>
          <button 
            @click="restart"
            class="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            再试一次
          </button>
        </div>

        <div v-if="isPaused && !isGameOver" class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
          <div class="px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white font-bold backdrop-blur-md">
            游戏暂停
          </div>
        </div>
      </div>
    </div>

    <!-- Controls Help (Mobile style) -->
    <div class="mt-6 flex justify-center md:hidden">
       <!-- Virtual keys could be added here -->
    </div>
  </div>
</template>

<style scoped>
canvas {
  image-rendering: pixelated;
}
</style>
