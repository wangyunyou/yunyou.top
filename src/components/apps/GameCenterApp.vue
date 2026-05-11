<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { Gamepad2, RotateCcw, Trophy, ChevronLeft } from 'lucide-vue-next';

const currentGame = ref(null);

// Persistence
const bestSnake = ref(parseInt(localStorage.getItem('snake-best') || '0'));
const best2048 = ref(parseInt(localStorage.getItem('2048-best') || '0'));

// --- Snake ---
const snake = ref([{ x: 10, y: 10 }]);
const food = ref({ x: 5, y: 5 });
const direction = ref({ x: 0, y: -1 });
const score = ref(0);
const gameOver = ref(false);
let gameInterval = null;

const startSnake = () => { currentGame.value = 'snake'; resetSnake(); };
const resetSnake = () => {
  snake.value = [{ x: 10, y: 10 }]; direction.value = { x: 0, y: -1 }; score.value = 0; gameOver.value = false;
  spawnFood(); if (gameInterval) clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 150);
};
const spawnFood = () => { food.value = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) }; };
const moveSnake = () => {
  if (gameOver.value) return;
  const head = { x: snake.value[0].x + direction.value.x, y: snake.value[0].y + direction.value.y };
  if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.value.some(s => s.x === head.x && s.y === head.y)) {
    gameOver.value = true; clearInterval(gameInterval); return;
  }
  snake.value.unshift(head);
  if (head.x === food.value.x && head.y === food.value.y) {
    score.value += 10; if (score.value > bestSnake.value) { bestSnake.value = score.value; localStorage.setItem('snake-best', bestSnake.value.toString()); }
    spawnFood();
  } else { snake.value.pop(); }
};

// --- 2048 ---
const tiles = ref([]);
const score2048 = ref(0);
const gameOver2048 = ref(false);
let nextId = 0;

const start2048 = () => { currentGame.value = '2048'; reset2048(); };
const reset2048 = () => { tiles.value = []; score2048.value = 0; gameOver2048.value = false; addRandomTile(); addRandomTile(); };

const addRandomTile = () => {
  const occupied = new Set(tiles.value.filter(t => !t.mergedInto).map(t => `${t.r},${t.c}`));
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
  tiles.value = tiles.value.filter(t => !t.mergedInto);

  const oldState = JSON.stringify(tiles.value.map(t => ({ r: t.r, c: t.c, val: t.val })));
  const isVertical = dir === 'up' || dir === 'down';
  const isReverse = dir === 'right' || dir === 'down';

  for (let i = 0; i < 4; i++) {
    let line = tiles.value.filter(t => (isVertical ? t.c : t.r) === i);
    line.sort((a, b) => (isVertical ? a.r - b.r : a.c - b.c));
    if (isReverse) line.reverse();

    let nextPos = isReverse ? 3 : 0;
    for (let j = 0; j < line.length; j++) {
      let current = line[j];
      let prev = line[j - 1];

      if (prev && prev.val === current.val && !prev.mergedFrom) {
        current.r = prev.r; current.c = prev.c;
        current.mergedInto = prev.id;
        prev.val *= 2; prev.mergedFrom = true;
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

  tiles.value.forEach(t => delete t.mergedFrom);
  const newState = JSON.stringify(tiles.value.map(t => ({ r: t.r, c: t.c, val: t.val })));
  
  if (oldState !== newState) {
    setTimeout(addRandomTile, 100);
    // Remove merged tiles after animation
    setTimeout(() => {
      tiles.value = tiles.value.filter(t => !t.mergedInto);
    }, 100);
    checkGameOver2048();
  }
};

const checkGameOver2048 = () => {
  if (tiles.value.filter(t => !t.mergedInto).length < 16) return;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const t = tiles.value.find(t => t.r === r && t.c === c && !t.mergedInto);
      const right = tiles.value.find(t => t.r === r && t.c === c + 1 && !t.mergedInto);
      const down = tiles.value.find(t => t.r === r + 1 && t.c === c && !t.mergedInto);
      if (t && ((right && right.val === t.val) || (down && down.val === t.val))) return;
    }
  }
  gameOver2048.value = true;
};

const handleKey = (e) => {
  if (currentGame.value === 'snake') {
    switch (e.key) {
      case 'ArrowUp': if (direction.value.y === 0) direction.value = { x: 0, y: -1 }; break;
      case 'ArrowDown': if (direction.value.y === 0) direction.value = { x: 0, y: 1 }; break;
      case 'ArrowLeft': if (direction.value.x === 0) direction.value = { x: -1, y: 0 }; break;
      case 'ArrowRight': if (direction.value.x === 0) direction.value = { x: 1, y: 0 }; break;
    }
  } else if (currentGame.value === '2048') {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const dirMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      move2048(dirMap[e.key]);
    }
  }
};

onMounted(() => window.addEventListener('keydown', handleKey));
onUnmounted(() => { window.removeEventListener('keydown', handleKey); if (gameInterval) clearInterval(gameInterval); });
</script>

<template>
  <div class="h-full bg-slate-900 text-white flex flex-col font-sans overflow-hidden select-none">
    <div class="h-14 border-b border-white/5 flex items-center px-6 justify-between shrink-0">
      <div class="flex items-center gap-3">
        <button v-if="currentGame" @click="currentGame = null" class="p-1 hover:bg-white/10 rounded">
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2">
          <Gamepad2 class="w-5 h-5 text-indigo-400" />
          <span class="font-bold">云优游戏厅</span>
        </div>
      </div>
      <div v-if="currentGame" class="flex items-center gap-4">
        <div class="flex flex-col items-end">
          <span class="text-[9px] text-white/30 uppercase font-bold">Score</span>
          <span class="text-sm font-mono leading-none">{{ currentGame === 'snake' ? score : score2048 }}</span>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-[9px] text-amber-500/50 uppercase font-bold">Best</span>
          <span class="text-sm font-mono leading-none text-amber-400">{{ currentGame === 'snake' ? bestSnake : best2048 }}</span>
        </div>
        <button @click="currentGame === 'snake' ? resetSnake() : reset2048()" class="p-2 hover:bg-white/10 rounded">
          <RotateCcw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
      <!-- Select -->
      <div v-if="!currentGame" class="grid grid-cols-2 gap-6 max-w-2xl w-full">
        <div @click="startSnake" class="aspect-square bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-3xl p-8 flex flex-col justify-end gap-4 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-2xl border border-white/10 group">
          <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl text-white">
            <svg viewBox="0 0 24 24" class="w-10 h-10 fill-current"><path d="M7 7h2v2H7V7zm4 0h2v2h-2V7zm4 0h2v2h-2V7zM7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM7 15h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>
          </div>
          <div><h3 class="text-xl font-bold">贪吃蛇</h3><p class="text-xs text-white/50 mt-1">挑战极限</p></div>
        </div>
        <div @click="start2048" class="aspect-square bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-3xl p-8 flex flex-col justify-end gap-4 cursor-pointer hover:scale-105 active:scale-95 transition-all border border-white/10 shadow-2xl group text-white">
          <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-xl">
            <span class="text-2xl font-black font-mono">2048</span>
          </div>
          <div><h3 class="text-xl font-bold">2048</h3><p class="text-xs text-white/50 mt-1">丝滑平移</p></div>
        </div>
      </div>

      <!-- Snake -->
      <div v-if="currentGame === 'snake'" class="relative animate-in fade-in zoom-in duration-500">
        <div class="grid grid-cols-20 grid-rows-20 w-[400px] h-[400px] bg-slate-800/50 backdrop-blur rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div class="absolute w-[18px] h-[18px] bg-rose-500 rounded-full" :style="{ left: food.x * 20 + 1 + 'px', top: food.y * 20 + 1 + 'px' }"></div>
          <div v-for="(seg, i) in snake" :key="i" class="absolute w-[18px] h-[18px] rounded-[4px] transition-all duration-150" :class="i === 0 ? 'bg-indigo-400 z-10' : 'bg-indigo-600/60'" :style="{ left: seg.x * 20 + 1 + 'px', top: seg.y * 20 + 1 + 'px' }"></div>
        </div>
        <div v-if="gameOver" class="absolute inset-0 bg-slate-950/80 backdrop-blur flex flex-col items-center justify-center rounded-xl z-50">
          <h2 class="text-4xl font-black mb-2">GAME OVER</h2>
          <button @click="resetSnake" class="px-8 py-3 bg-indigo-600 rounded-full font-bold">再来一局</button>
        </div>
      </div>

      <!-- 2048 -->
      <div v-if="currentGame === '2048'" class="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        <div class="relative bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 shadow-2xl w-[320px] h-[320px] p-2 overflow-hidden">
          <div class="grid grid-cols-4 grid-rows-4 gap-2 h-full w-full">
            <div v-for="i in 16" :key="i" class="bg-white/5 rounded-xl"></div>
          </div>
          <div class="absolute inset-2 overflow-hidden">
            <transition-group name="tile">
              <div 
                v-for="tile in tiles" 
                :key="tile.id"
                class="absolute w-[73px] h-[73px] rounded-xl flex items-center justify-center text-xl font-black transition-all duration-100 ease-in-out"
                :class="{
                  'bg-emerald-500 shadow-[0_0_15px_#10b981] z-20': tile.val >= 2048,
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
                :style="{ 
                  transform: `translate3d(${tile.c * 77}px, ${tile.r * 77}px, 0)`,
                  opacity: tile.mergedInto ? 0 : 1
                }"
              >
                {{ tile.val }}
              </div>
            </transition-group>
          </div>
        </div>
        <div v-if="gameOver2048" class="absolute inset-0 bg-slate-950/80 backdrop-blur flex flex-col items-center justify-center rounded-xl z-50">
          <h2 class="text-4xl font-black mb-8">无法移动</h2>
          <button @click="reset2048" class="px-8 py-3 bg-emerald-600 rounded-full font-bold">重新开始</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-cols-20 { grid-template-columns: repeat(20, minmax(0, 1fr)); }
.grid-rows-20 { grid-template-rows: repeat(20, minmax(0, 1fr)); }
.tile-enter-active { animation: tile-pop 200ms ease-out; }
@keyframes tile-pop { 0% { opacity: 0; transform: scale(0); } 100% { opacity: 1; transform: scale(1); } }
.tile-move { transition: transform 100ms ease-in-out; }
</style>
