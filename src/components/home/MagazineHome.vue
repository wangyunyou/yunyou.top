<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useWindowStore } from '../../stores/windowStore';
import { usePresenceStore } from '../../stores/presenceStore';
import { useConfigStore } from '../../stores/configStore';
import { appRegistry } from '../../lib/appRegistry';
import { useParticleBackground } from '../../composables/useParticleBackground';
import { useTilt } from '../../composables/useTilt';
import { useMouseParallax } from '../../composables/useMouseParallax';
import Window from '../os/Window.vue';
import {
  MessagesSquare,
  Sparkles,
  Film,
  Image as ImageIcon,
  Gamepad2,
  Music,
  Activity,
  Settings,
  Github,
  ArrowUpRight,
  ArrowDown,
  Quote,
  Zap,
} from 'lucide-vue-next';

const router = useRouter();
const windowStore = useWindowStore();
const presenceStore = usePresenceStore();
const configStore = useConfigStore();
const { offsetX, offsetY } = useMouseParallax();

// ---------- Particle Canvas ----------
const canvasRef = ref(null);
useParticleBackground(canvasRef);

// ---------- 3D Tilt for each card ----------
const heroTilt = useTilt();
const appTilts = Array.from({ length: 6 }, () => useTilt());
const quoteTilt = useTilt();
const smallCardTilts = Array.from({ length: 4 }, () => useTilt());

// ---------- Apps ----------
const apps = [
  {
    id: 'chat',
    title: '匿名聊天',
    desc: '无拘无束，说你想说',
    icon: MessagesSquare,
    tag: 'LIVE',
    gradient: 'from-cyan-500 to-blue-600',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    gridClass: 'md:col-span-5 md:row-span-2',
    route: '/chat',
  },
  {
    id: 'ai',
    title: '云优 AI',
    desc: '智能问答 · 创作助手',
    icon: Sparkles,
    tag: 'AI',
    gradient: 'from-violet-600 to-fuchsia-500',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    gridClass: 'md:col-span-5 md:row-span-2',
    component: 'AIApp',
  },
  {
    id: 'video',
    title: '云优短视频',
    desc: '刷不完的精彩瞬间',
    icon: Film,
    tag: 'VIDEO',
    gradient: 'from-rose-500 to-orange-500',
    glowColor: 'rgba(244, 63, 94, 0.5)',
    gridClass: 'md:col-span-4 md:row-span-3',
    component: 'VideoApp',
  },
  {
    id: 'gallery',
    title: '云优相册',
    desc: '收藏每一帧美好',
    icon: ImageIcon,
    tag: 'GALLERY',
    gradient: 'from-amber-400 to-orange-500',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    gridClass: 'md:col-span-4 md:row-span-3',
    component: 'GalleryApp',
  },
  {
    id: 'game',
    title: '游戏厅',
    desc: '俄罗斯方块 · 更多小游戏',
    icon: Gamepad2,
    tag: 'GAMES',
    gradient: 'from-indigo-500 to-violet-600',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    gridClass: 'md:col-span-4 md:row-span-3',
    component: 'GameCenterApp',
  },
  {
    id: 'music',
    title: '云优音乐',
    desc: '此刻旋律，由你点播',
    icon: Music,
    tag: 'MUSIC',
    gradient: 'from-pink-500 to-rose-500',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    gridClass: 'md:col-span-5 md:row-span-2',
    component: 'MusicApp',
  },
];

const smallCards = [
  {
    id: 'monitor',
    title: '系统监控',
    desc: 'CPU · 内存 · 实时状态',
    icon: Activity,
    tag: 'SYS',
    gradient: 'from-emerald-500 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    gridClass: 'md:col-span-3 md:row-span-2',
    component: 'SystemMonitorApp',
  },
  {
    id: 'settings',
    title: '设置中心',
    desc: '壁纸 · 个性化',
    icon: Settings,
    tag: 'TOOLS',
    gradient: 'from-slate-500 to-slate-700',
    glowColor: 'rgba(100, 116, 139, 0.5)',
    gridClass: 'md:col-span-4 md:row-span-1',
    component: 'SettingsApp',
  },
  {
    id: 'github',
    title: '查看源码',
    desc: 'github.com/wangyunyou',
    icon: Github,
    tag: 'OPEN SOURCE',
    gradient: 'from-[#252b3d] to-[#161a29]',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    gridClass: 'md:col-span-4 md:row-span-1',
    href: 'https://github.com/wangyunyou/yunyou.top',
  },
  {
    id: 'contact',
    title: '© 2026 云优网络',
    desc: 'Made with Vue & love',
    icon: Sparkles,
    tag: 'YUNYOU',
    gradient: 'from-[#1a1f33] to-[#10131f]',
    glowColor: 'rgba(139, 92, 246, 0.2)',
    gridClass: 'md:col-span-4 md:row-span-1',
  },
];

const heroTags = ['CHAT', 'AI', 'VIDEO', 'GAME', 'MUSIC', 'OPEN SOURCE'];

const openApp = (app) => {
  if (app.route) {
    router.push(app.route);
    return;
  }
  if (app.href) {
    window.open(app.href, '_blank');
    return;
  }
  const comp = appRegistry[app.component];
  if (comp) {
    windowStore.openWindow(app.id, app.title, comp, app.component);
  }
};

// ---------- Widgets ----------
const quotes = [
  { text: '不积跬步，无以至千里。', author: '荀子' },
  { text: 'Stay Hungry, Stay Foolish.', author: 'Steve Jobs' },
  { text: '所有的伟大，都源于一个勇敢的开始。', author: '云优网络' },
  { text: '代码是写给人看的，附带能在机器上运行。', author: 'Donald Knuth' },
];
const dailyQuote = ref(quotes[Math.floor(Math.random() * quotes.length)]);

const now = ref(new Date());
let timer;

// ---------- Glitch text ----------
const glitchActive = ref(false);
let glitchTimer;

function triggerGlitch() {
  glitchActive.value = true;
  setTimeout(() => { glitchActive.value = false; }, 200);
}

// ---------- Floating shapes ----------
const shapes = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  type: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'diamond' : 'square',
  size: 20 + Math.random() * 60,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 15 + Math.random() * 25,
  delay: Math.random() * 10,
  opacity: 0.04 + Math.random() * 0.06,
}));

// ---------- Reveal on scroll ----------
const revealEls = [];
const setReveal = (el) => {
  if (el && !revealEls.includes(el)) revealEls.push(el);
};

onMounted(() => {
  presenceStore.initPresence();
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);

  // Random glitch effect
  glitchTimer = setInterval(() => {
    if (Math.random() < 0.2) triggerGlitch();
  }, 4000);

  // Wait for the DOM to settle
  requestAnimationFrame(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -5% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  });
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (glitchTimer) clearInterval(glitchTimer);
});

// ---------- Parallax helpers ----------
const heroParallaxStyle = computed(() => ({
  transform: `translate(${offsetX.value * 8}px, ${offsetY.value * 8}px)`,
}));

const heroGlowStyle = computed(() => ({
  transform: `translate(${offsetX.value * -15}px, ${offsetY.value * -15}px)`,
}));

const heroGradientStyle = computed(() => ({
  backgroundPosition: `${50 + offsetX.value * 3}% ${50 + offsetY.value * 3}%`,
}));
</script>

<template>
  <div class="magazine relative h-screen w-screen overflow-hidden bg-[#06060e] text-slate-100 select-none">
    <!-- ===== Particle Canvas ===== -->
    <canvas ref="canvasRef" class="fixed inset-0 z-0 pointer-events-none"></canvas>

    <!-- ===== Ambient Background ===== -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <!-- Wallpaper layer -->
      <img
        v-if="configStore.wallpaper"
        :src="configStore.wallpaper"
        alt=""
        class="absolute inset-0 w-full h-full object-cover opacity-20 blur-[1px] saturate-50"
      />
      <div class="absolute inset-0 bg-[#06060e]/80"></div>

      <!-- Animated gradient orbs -->
      <div
        class="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-sky-500/25 blur-[140px] animate-drift"
      ></div>
      <div
        class="absolute top-1/4 -right-40 w-[640px] h-[640px] rounded-full bg-fuchsia-500/20 blur-[150px] animate-drift-slow"
      ></div>
      <div
        class="absolute -bottom-40 left-1/3 w-[560px] h-[560px] rounded-full bg-violet-600/15 blur-[140px] animate-drift-alt"
      ></div>

      <!-- Noise overlay -->
      <div
        class="absolute inset-0 opacity-[0.03]"
        style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E');"
      ></div>
    </div>

    <!-- ===== Floating Geometric Shapes ===== -->
    <div class="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      <div
        v-for="shape in shapes"
        :key="shape.id"
        class="absolute animate-float-shape"
        :class="{
          'rounded-full border border-white/20': shape.type === 'circle',
          'rotate-45 border border-white/20': shape.type === 'diamond',
          'border border-white/20': shape.type === 'square',
        }"
        :style="{
          width: shape.size + 'px',
          height: shape.size + 'px',
          left: shape.left + '%',
          top: shape.top + '%',
          opacity: shape.opacity,
          animationDuration: shape.duration + 's',
          animationDelay: shape.delay + 's',
        }"
      ></div>
    </div>

    <!-- ===== Scroll Container ===== -->
    <div class="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth">
      <main class="max-w-[1360px] mx-auto px-5 md:px-10 pt-6 md:pt-10 pb-20">
        <!-- ===== Top Bar ===== -->
        <header
          :ref="setReveal"
          class="flex items-center justify-between mb-8 md:mb-12 reveal"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-violet-500 to-fuchsia-500 flex items-center justify-center font-serif italic font-black text-white text-lg shadow-[0_0_24px_rgba(139,92,246,0.5)] animate-pulse-glow"
            >
              Y
            </div>
            <div>
              <div class="font-serif italic font-black text-lg leading-none tracking-wide">
                YUNYOU
              </div>
              <div class="text-[9px] text-slate-500 tracking-[0.35em] uppercase mt-1">
                Cloud Magazine
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div
              class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/15 transition-all"
            >
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              {{ presenceStore.onlineCount }} 人在线
            </div>
            <a
              href="https://github.com/wangyunyou/yunyou.top"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25 transition-all text-xs font-semibold text-slate-200"
            >
              <Github class="w-4 h-4" />
              <span class="hidden md:inline">GitHub</span>
            </a>
          </div>
        </header>

        <!-- ===== Magazine Grid ===== -->
        <div
          class="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-5 auto-rows-auto md:auto-rows-[92px]"
        >
          <!-- ========== HERO COVER CARD ========== -->
          <div
            :ref="setReveal"
            class="reveal col-span-2 md:col-span-7 md:row-span-4 transition-delay-0"
          >
            <article
              ref="heroTilt.tiltEl"
              class="hero-card group relative h-full overflow-hidden rounded-3xl p-6 md:p-9 flex flex-col justify-between min-h-[420px] md:min-h-0 cursor-default"
              :style="heroTilt.transform"
              @mousemove="heroTilt.onMouseMove"
              @mouseenter="heroTilt.onMouseEnter"
              @mouseleave="heroTilt.onMouseLeave"
            >
              <!-- Animated gradient border -->
              <div
                class="absolute inset-0 rounded-3xl p-[1.5px] hero-border-glow"
              >
                <div class="w-full h-full rounded-3xl bg-[#0c0f1d]"></div>
              </div>

              <!-- Inner card bg -->
              <div class="absolute inset-[1.5px] rounded-3xl hero-inner-bg"></div>

              <!-- Dynamic glow orb that follows mouse -->
              <div
                class="absolute w-[500px] h-[500px] rounded-full blur-[120px] transition-opacity duration-500 pointer-events-none hero-glow-orb"
                :style="{
                  background: `radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)`,
                  left: `${heroTilt.glowX - 50}%`,
                  top: `${heroTilt.glowY - 60}%`,
                  opacity: heroTilt.isHovering ? 1 : 0.6,
                }"
              ></div>

              <!-- Second glow orb -->
              <div
                class="absolute w-[400px] h-[400px] rounded-full blur-[100px] transition-opacity duration-500 pointer-events-none"
                :style="{
                  background: `radial-gradient(circle, rgba(217,70,239,0.2) 0%, transparent 70%)`,
                  left: `${100 - heroTilt.glowX - 30}%`,
                  top: `${heroTilt.glowY - 30}%`,
                  opacity: heroTilt.isHovering ? 0.9 : 0.4,
                }"
              ></div>

              <!-- Watermark -->
              <span
                class="absolute -bottom-10 right-0 font-serif italic font-black text-[9rem] md:text-[13rem] leading-none text-white/[0.03] group-hover:text-white/[0.06] transition-colors duration-700 select-none"
                :style="heroParallaxStyle"
              >YU</span>

              <!-- Top row -->
              <div class="relative z-10 flex items-center justify-between">
                <span class="text-[10px] font-bold tracking-[0.35em] text-sky-300/90 uppercase flex items-center gap-2">
                  <Zap class="w-3 h-3 text-amber-400" />
                  Issue · 2026
                </span>
                <span
                  class="flex items-center gap-1.5 text-[10px] font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-full px-3 py-1"
                >
                  <Activity class="w-3 h-3 text-sky-400" />
                  {{
                    now.toLocaleDateString([], {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    })
                  }}
                </span>
              </div>

              <!-- Title block -->
              <div class="relative z-10 my-5 md:my-6" :style="heroParallaxStyle">
                <div
                  class="text-[10px] md:text-xs font-semibold text-fuchsia-300/90 tracking-[0.3em] uppercase mb-2 md:mb-3"
                >
                  The Cloud Magazine
                </div>
                <h1
                  class="font-serif italic font-black text-5xl md:text-8xl leading-[0.95] tracking-tight hero-title"
                  :class="{ 'hero-glitch': glitchActive }"
                  :style="heroGradientStyle"
                >
                  云优<br />网络
                </h1>
                <!-- Decorative lines -->
                <div class="flex items-center gap-3 mt-3" :style="heroParallaxStyle">
                  <div class="h-px flex-1 bg-gradient-to-r from-sky-500/60 to-transparent"></div>
                  <div class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></div>
                  <div class="h-px flex-1 bg-gradient-to-l from-fuchsia-500/60 to-transparent"></div>
                </div>
              </div>

              <!-- Bottom row -->
              <div class="relative z-10 flex items-end justify-between gap-4">
                <div>
                  <p class="text-xs md:text-sm text-slate-400 leading-relaxed max-w-sm">
                    一个集聊天、AI、影音、游戏于一体的云端创作空间。欢迎翻开我的数字生活杂志。
                  </p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      v-for="t in heroTags"
                      :key="t"
                      class="text-[9px] px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-slate-300 font-semibold tracking-wider hover:bg-white/10 hover:border-white/25 transition-all cursor-default"
                    >{{ t }}</span>
                  </div>
                </div>
                <div
                  class="hidden md:flex items-center gap-1.5 text-[10px] text-slate-500 tracking-[0.25em] uppercase animate-bounce"
                >
                  Scroll <ArrowDown class="w-3.5 h-3.5" />
                </div>
              </div>
            </article>
          </div>

          <!-- ========== APP CARDS ========== -->
          <div
            v-for="(app, i) in apps"
            :key="app.id"
            :ref="setReveal"
            class="reveal col-span-1"
            :class="app.gridClass"
            :style="{ transitionDelay: `${(i + 1) * 70}ms` }"
          >
            <article
              :ref="appTilts[i].tiltEl"
              class="tilt-card card-gradient group cursor-pointer relative h-full overflow-hidden rounded-2xl flex flex-col justify-between p-5 min-h-[150px] md:min-h-0"
              :class="[app.gradient, 'border border-white/10']"
              :style="appTilts[i].transform"
              @click="openApp(app)"
              @mousemove="appTilts[i].onMouseMove"
              @mouseenter="appTilts[i].onMouseEnter"
              @mouseleave="appTilts[i].onMouseLeave"
            >
              <!-- Hover glow follows mouse -->
              <div
                class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                :style="{ background: `radial-gradient(circle at ${appTilts[i].glowX}% ${appTilts[i].glowY}%, ${app.glowColor} 0%, transparent 70%)` }"
              ></div>

              <!-- Bottom readability fade -->
              <div class="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 via-black/5 to-transparent pointer-events-none"></div>

              <!-- Number -->
              <span
                class="absolute top-4 right-4 font-serif italic font-black text-2xl md:text-3xl text-white/20 group-hover:text-white/50 transition-all duration-500 group-hover:scale-110 z-10"
              >{{ String(i + 1).padStart(2, '0') }}</span>

              <!-- Content -->
              <div class="relative z-10">
                <div
                  class="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-500"
                >
                  <component :is="app.icon" class="w-6 h-6 text-white drop-shadow" />
                </div>
              </div>

              <div class="relative z-10 mt-3">
                <div class="text-[9px] font-bold tracking-[0.3em] text-white/50 uppercase mb-1">
                  {{ app.tag }}
                </div>
                <h3 class="font-bold text-lg md:text-xl text-white leading-tight">
                  {{ app.title }}
                </h3>
                <p class="text-[11px] md:text-xs text-white/65 mt-1 leading-relaxed">
                  {{ app.desc }}
                </p>
              </div>

              <ArrowUpRight
                class="absolute bottom-4 right-4 w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-500 z-10"
              />
            </article>
          </div>

          <!-- ========== QUOTE CARD ========== -->
          <div
            :ref="setReveal"
            class="reveal col-span-2 md:col-span-4 md:row-span-2"
            :style="{ transitionDelay: '350ms' }"
          >
            <article
              ref="quoteTilt.tiltEl"
              class="tilt-card card-gradient group relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#161b2e] to-[#0e1220] border border-white/10 p-5 flex flex-col justify-between min-h-[170px] md:min-h-0"
              :style="quoteTilt.transform"
              @mousemove="quoteTilt.onMouseMove"
              @mouseenter="quoteTilt.onMouseEnter"
              @mouseleave="quoteTilt.onMouseLeave"
            >
              <!-- Hover glow follows mouse -->
              <div
                class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                :style="{ background: `radial-gradient(circle at ${quoteTilt.glowX}% ${quoteTilt.glowY}%, rgba(251,191,36,0.15) 0%, transparent 70%)` }"
              ></div>

              <div class="relative z-10">
                <Quote
                  class="w-7 h-7 text-amber-400/80 group-hover:scale-110 group-hover:-rotate-6 group-hover:drop-shadow-[0_0_10px_rgba(251,191,36,0.4)] transition-all duration-500"
                />
              </div>
              <div class="relative z-10 mt-3">
                <p class="font-serif italic text-sm md:text-base text-slate-200 leading-relaxed">
                  "{{ dailyQuote.text }}"
                </p>
                <p class="text-[10px] text-amber-300/80 font-bold mt-3 tracking-[0.2em] uppercase">
                  -- {{ dailyQuote.author }}
                </p>
              </div>
            </article>
          </div>

          <!-- ========== SMALL CARDS ========== -->
          <div
            v-for="(card, i) in smallCards"
            :key="card.id"
            :ref="setReveal"
            class="reveal col-span-1"
            :class="card.gridClass"
            :style="{ transitionDelay: `${400 + i * 70}ms` }"
          >
            <article
              :ref="smallCardTilts[i].tiltEl"
              class="tilt-card card-gradient group cursor-pointer relative h-full overflow-hidden rounded-2xl flex items-center gap-4 p-5 min-h-[110px] md:min-h-0"
              :class="[card.gradient, 'border border-white/10']"
              :style="smallCardTilts[i].transform"
              @click="openApp(card)"
              @mousemove="smallCardTilts[i].onMouseMove"
              @mouseenter="smallCardTilts[i].onMouseEnter"
              @mouseleave="smallCardTilts[i].onMouseLeave"
            >
              <!-- Hover glow follows mouse -->
              <div
                class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                :style="{ background: `radial-gradient(circle at ${smallCardTilts[i].glowX}% ${smallCardTilts[i].glowY}%, ${card.glowColor} 0%, transparent 70%)` }"
              ></div>

              <!-- Bottom readability fade -->
              <div class="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 via-black/5 to-transparent pointer-events-none"></div>

              <div class="relative z-10 shrink-0">
                <div
                  class="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-500"
                >
                  <component :is="card.icon" class="w-5 h-5 text-white drop-shadow" />
                </div>
              </div>
              <div class="relative z-10 min-w-0">
                <div class="text-[9px] font-bold tracking-[0.25em] text-white/50 uppercase mb-0.5">
                  {{ card.tag }}
                </div>
                <h3 class="font-bold text-sm md:text-base text-white leading-tight truncate">
                  {{ card.title }}
                </h3>
                <p class="text-[10px] md:text-[11px] text-white/60 truncate">
                  {{ card.desc }}
                </p>
              </div>
              <ArrowUpRight
                class="relative z-10 ml-auto w-4 h-4 text-white/40 shrink-0 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.3)] transition-all duration-500"
              />
            </article>
          </div>
        </div>
      </main>
    </div>

    <!-- ===== Windows Layer ===== -->
    <div class="absolute inset-0 z-[60] pointer-events-none">
      <Window v-for="win in windowStore.windows" :key="win.id" :window="win" />
    </div>
  </div>
</template>

<style scoped>
/* ===== Scroll Reveal ===== */
.reveal {
  opacity: 0;
  transform: translateY(30px) scale(0.97);
  transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ===== Tilt Cards ===== */
.tilt-card {
  transition: transform 0.15s ease-out;
  will-change: transform;
}

/* ===== Animated Gradient Border for Cards ===== */
.card-gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1.5px;
  background: conic-gradient(
    transparent 10%,
    rgba(56, 189, 248, 0.5) 35%,
    rgba(139, 92, 246, 0.5) 55%,
    rgba(217, 70, 239, 0.5) 75%,
    transparent 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
  animation: border-spin 5s linear infinite;
  pointer-events: none;
  z-index: 10;
}
.card-gradient:hover::before {
  opacity: 1;
}
@keyframes border-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== Hero Card ===== */
.hero-card {
  transition: transform 0.15s ease-out;
  will-change: transform;
}
.hero-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  padding: 1.5px;
  background: conic-gradient(
    from 0deg,
    rgba(56, 189, 248, 0.6),
    rgba(139, 92, 246, 0.6),
    rgba(217, 70, 239, 0.6),
    rgba(56, 189, 248, 0.6)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: hero-border-spin 4s linear infinite;
}
@keyframes hero-border-spin {
  to {
    transform: rotate(360deg);
  }
}
.hero-inner-bg {
  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(56, 189, 248, 0.08) 0%,
    rgba(139, 92, 246, 0.06) 30%,
    rgba(12, 15, 29, 1) 70%
  );
}
.hero-glow-orb {
  transition: all 0.3s ease-out;
}

/* ===== Hero Title Gradient ===== */
.hero-title {
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    #e2e8f0 15%,
    #bae6fd 30%,
    #c4b5fd 50%,
    #f0abfc 65%,
    #ffffff 80%,
    #bae6fd 100%
  );
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 5s ease-in-out infinite;
}
@keyframes shimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* ===== Hero Glitch Effect ===== */
.hero-glitch {
  animation: glitch-anim 0.2s ease-in-out;
  text-shadow:
    2px 0 rgba(56, 189, 248, 0.7),
    -2px 0 rgba(217, 70, 239, 0.7);
}
@keyframes glitch-anim {
  0% { transform: translate(0); }
  20% { transform: translate(-3px, 2px); }
  40% { transform: translate(3px, -1px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(1px, 1px); }
  100% { transform: translate(0); }
}

/* ===== Animated Glow Pulse on Logo ===== */
.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 35px rgba(139, 92, 246, 0.7), 0 0 60px rgba(56, 189, 248, 0.3);
  }
}

/* ===== Background Orbs ===== */
@keyframes drift {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(40px, -20px) scale(1.05);
  }
  50% {
    transform: translate(-10px, -40px) scale(1.08);
  }
  75% {
    transform: translate(-30px, 10px) scale(1.03);
  }
}
.animate-drift {
  animation: drift 18s ease-in-out infinite;
}
.animate-drift-slow {
  animation: drift 24s ease-in-out infinite reverse;
}
.animate-drift-alt {
  animation: drift 20s ease-in-out infinite;
  animation-delay: -10s;
}

/* ===== Floating Shapes ===== */
@keyframes float-shape {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.03;
  }
  25% {
    transform: translateY(-30px) rotate(10deg);
    opacity: 0.06;
  }
  50% {
    transform: translateY(-15px) rotate(-5deg);
    opacity: 0.04;
  }
  75% {
    transform: translateY(-40px) rotate(15deg);
    opacity: 0.07;
  }
}
.animate-float-shape {
  animation: float-shape linear infinite;
}

/* ===== Reduced Motion ===== */
@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
  }
  .hero-title {
    animation: none;
  }
  .hero-card::before {
    animation: none;
  }
  .app-card-border {
    animation: none;
  }
}
</style>
