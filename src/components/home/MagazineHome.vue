<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePresenceStore } from '../../stores/presenceStore';
import { useConfigStore } from '../../stores/configStore';
import { useParticleBackground } from '../../composables/useParticleBackground';
import { useTilt } from '../../composables/useTilt';
import { useMouseParallax } from '../../composables/useMouseParallax';
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
    accent: 'cyan',
    gradient: 'from-cyan-400 to-blue-500',
    glow: 'rgba(34, 211, 238, 0.45)',
    gridClass: 'md:col-span-5 md:row-span-2',
    component: 'ChatApp',
    route: '/chat',
  },
  {
    id: 'ai',
    title: '云优 AI',
    desc: '智能问答 · 创作助手',
    icon: Sparkles,
    tag: 'AI',
    accent: 'violet',
    gradient: 'from-violet-400 to-fuchsia-500',
    glow: 'rgba(167, 139, 250, 0.45)',
    gridClass: 'md:col-span-5 md:row-span-2',
    component: 'AIApp',
    route: '/ai',
  },
  {
    id: 'video',
    title: '云优短视频',
    desc: '刷不完的精彩瞬间',
    icon: Film,
    tag: 'VIDEO',
    accent: 'rose',
    gradient: 'from-rose-400 to-orange-500',
    glow: 'rgba(251, 113, 133, 0.45)',
    gridClass: 'md:col-span-4 md:row-span-3',
    component: 'VideoApp',
    route: '/video',
  },
  {
    id: 'gallery',
    title: '云优相册',
    desc: '收藏每一帧美好',
    icon: ImageIcon,
    tag: 'GALLERY',
    accent: 'amber',
    gradient: 'from-amber-300 to-orange-500',
    glow: 'rgba(252, 211, 77, 0.45)',
    gridClass: 'md:col-span-4 md:row-span-3',
    component: 'GalleryApp',
    route: '/gallery',
  },
  {
    id: 'game',
    title: '游戏厅',
    desc: '俄罗斯方块 · 更多小游戏',
    icon: Gamepad2,
    tag: 'GAMES',
    accent: 'indigo',
    gradient: 'from-indigo-400 to-violet-500',
    glow: 'rgba(129, 140, 248, 0.45)',
    gridClass: 'md:col-span-4 md:row-span-3',
    component: 'GameCenterApp',
    route: '/game',
  },
  {
    id: 'music',
    title: '云优音乐',
    desc: '此刻旋律，由你点播',
    icon: Music,
    tag: 'MUSIC',
    accent: 'pink',
    gradient: 'from-pink-400 to-rose-500',
    glow: 'rgba(244, 114, 182, 0.45)',
    gridClass: 'md:col-span-5 md:row-span-2',
    component: 'MusicApp',
    route: '/music',
  },
];

const smallCards = [
  {
    id: 'monitor',
    title: '系统监控',
    desc: 'CPU · 内存 · 实时状态',
    icon: Activity,
    tag: 'SYS',
    accent: 'emerald',
    gradient: 'from-emerald-400 to-teal-500',
    glow: 'rgba(52, 211, 153, 0.45)',
    gridClass: 'md:col-span-3 md:row-span-2',
    component: 'SystemMonitorApp',
    route: '/monitor',
  },
  {
    id: 'settings',
    title: '设置中心',
    desc: '壁纸 · 个性化',
    icon: Settings,
    tag: 'TOOLS',
    accent: 'slate',
    gradient: 'from-slate-300 to-slate-500',
    glow: 'rgba(148, 163, 184, 0.35)',
    gridClass: 'md:col-span-4 md:row-span-1',
    component: 'SettingsApp',
    route: '/settings',
  },
  {
    id: 'github',
    title: '查看源码',
    desc: 'github.com/wangyunyou',
    icon: Github,
    tag: 'OPEN SOURCE',
    accent: 'blue',
    gradient: 'from-blue-400 to-indigo-500',
    glow: 'rgba(96, 165, 250, 0.35)',
    gridClass: 'md:col-span-4 md:row-span-1',
    href: 'https://github.com/wangyunyou/yunyou.top',
  },
  {
    id: 'contact',
    title: '© 2026 云优网络',
    desc: 'Made with Vue & love',
    icon: Sparkles,
    tag: 'YUNYOU',
    accent: 'violet',
    gradient: 'from-violet-400 to-fuchsia-500',
    glow: 'rgba(167, 139, 250, 0.3)',
    gridClass: 'md:col-span-4 md:row-span-1',
  },
];

const heroTags = ['CHAT', 'AI', 'VIDEO', 'GAME', 'MUSIC'];

const openApp = (app) => {
  if (app.route) {
    router.push(app.route);
    return;
  }
  if (app.href) {
    window.open(app.href, '_blank');
    return;
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
});

// ---------- Parallax helpers ----------
const heroParallaxStyle = computed(() => ({
  transform: `translate(${offsetX.value * 6}px, ${offsetY.value * 6}px)`,
}));

const heroGlowStyle = computed(() => ({
  transform: `translate(${offsetX.value * -12}px, ${offsetY.value * -12}px)`,
}));
</script>

<template>
  <div class="magazine relative h-screen w-screen overflow-hidden bg-[#030305] text-slate-100 select-none">
    <!-- ===== Particle Canvas ===== -->
    <canvas ref="canvasRef" class="fixed inset-0 z-0 pointer-events-none opacity-70"></canvas>

    <!-- ===== Ambient Background ===== -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <!-- Wallpaper layer -->
      <img
        v-if="configStore.wallpaper"
        :src="configStore.wallpaper"
        alt=""
        class="absolute inset-0 w-full h-full object-cover opacity-15 saturate-50"
      />
      <div class="absolute inset-0 bg-[#030305]/85"></div>

      <!-- Soft aurora orbs -->
      <div
        class="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-indigo-500/20 blur-[150px] animate-aurora-1"
      ></div>
      <div
        class="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-fuchsia-500/15 blur-[160px] animate-aurora-2"
      ></div>
      <div
        class="absolute -bottom-40 left-1/4 w-[480px] h-[480px] rounded-full bg-cyan-500/15 blur-[140px] animate-aurora-3"
      ></div>

      <!-- Fine noise overlay -->
      <div class="noise-overlay"></div>
    </div>

    <!-- ===== Scroll Container ===== -->
    <div class="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth">
      <main class="max-w-[1320px] mx-auto px-5 md:px-10 pt-6 md:pt-10 pb-24">
        <!-- ===== Top Bar ===== -->
        <header
          :ref="setReveal"
          class="flex items-center justify-between mb-10 md:mb-14 reveal"
        >
          <div class="flex items-center gap-3">
            <div
              class="logo-mark w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 via-violet-500 to-fuchsia-500 flex items-center justify-center font-serif italic font-black text-white text-lg shadow-[0_0_30px_rgba(139,92,246,0.45)]"
            >
              Y
            </div>
            <div>
              <div class="font-serif italic font-black text-lg leading-none tracking-wide">
                YUNYOU
              </div>
              <div class="text-[10px] text-slate-500 tracking-[0.3em] uppercase mt-1">
                Cloud Space
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div
              class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/12 transition-all"
            >
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              {{ presenceStore.onlineCount }} 人在线
            </div>
            <a
              href="https://github.com/wangyunyou/yunyou.top"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20 transition-all text-xs font-medium text-slate-300"
            >
              <Github class="w-4 h-4" />
              <span class="hidden md:inline">GitHub</span>
            </a>
          </div>
        </header>

        <!-- ===== Magazine Grid ===== -->
        <div
          class="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-5 auto-rows-auto md:auto-rows-[86px]"
        >
          <!-- ========== HERO COVER CARD ========== -->
          <div
            :ref="setReveal"
            class="reveal col-span-2 md:col-span-7 md:row-span-4 transition-delay-0"
          >
            <article
              ref="heroTilt.tiltEl"
              class="hero-card group relative h-full overflow-hidden rounded-[28px] p-7 md:p-10 flex flex-col justify-between min-h-[420px] md:min-h-0 cursor-default"
              :style="heroTilt.transform"
              @mousemove="heroTilt.onMouseMove"
              @mouseenter="heroTilt.onMouseEnter"
              @mouseleave="heroTilt.onMouseLeave"
            >
              <!-- Card surface -->
              <div class="absolute inset-0 rounded-[28px] hero-surface"></div>

              <!-- Top accent line -->
              <div class="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent opacity-60"></div>

              <!-- Mouse glow orb -->
              <div
                class="absolute w-[520px] h-[520px] rounded-full blur-[130px] transition-opacity duration-500 pointer-events-none"
                :style="{
                  background: `radial-gradient(circle, rgba(56,189,248,0.22) 0%, rgba(139,92,246,0.12) 45%, transparent 70%)`,
                  left: `${heroTilt.glowX - 55}%`,
                  top: `${heroTilt.glowY - 55}%`,
                  opacity: heroTilt.isHovering ? 1 : 0.55,
                }"
              ></div>

              <!-- Grid pattern -->
              <div class="absolute inset-0 grid-pattern opacity-30"></div>

              <!-- Visual orb decoration -->
              <div
                class="absolute -right-16 -top-16 w-72 h-72 md:w-96 md:h-96 rounded-full opacity-40 blur-3xl pointer-events-none"
                :style="{
                  background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(56,189,248,0.15) 40%, transparent 70%)',
                  ...heroGlowStyle,
                }"
              ></div>

              <!-- Watermark -->
              <span
                class="absolute -bottom-8 -right-4 font-serif italic font-black text-[10rem] md:text-[14rem] leading-none text-white/[0.025] group-hover:text-white/[0.04] transition-colors duration-700 select-none"
                :style="heroParallaxStyle"
              >YU</span>

              <!-- Top row -->
              <div class="relative z-10 flex items-center justify-between">
                <span class="text-[10px] font-semibold tracking-[0.3em] text-sky-300/80 uppercase flex items-center gap-2">
                  <Zap class="w-3 h-3 text-amber-400" />
                  Cloud Magazine · 2026
                </span>
                <span
                  class="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1"
                >
                  <Activity class="w-3 h-3 text-sky-400" />
                  {{ now.toLocaleDateString([], { month: 'long', day: 'numeric', weekday: 'long' }) }}
                </span>
              </div>

              <!-- Title block -->
              <div class="relative z-10 my-4 md:my-6" :style="heroParallaxStyle">
                <div class="text-[10px] md:text-[11px] font-semibold text-fuchsia-300/80 tracking-[0.25em] uppercase mb-3">
                  The Cloud Magazine
                </div>
                <h1 class="hero-title font-serif italic font-black text-6xl md:text-9xl leading-[0.92] tracking-tight">
                  云优<br />网络
                </h1>
                <div class="flex items-center gap-3 mt-4">
                  <div class="h-px w-12 bg-gradient-to-r from-sky-400/70 to-transparent"></div>
                  <div class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></div>
                  <div class="h-px w-12 bg-gradient-to-l from-fuchsia-400/70 to-transparent"></div>
                </div>
              </div>

              <!-- Bottom row -->
              <div class="relative z-10 flex items-end justify-between gap-4">
                <div>
                  <p class="text-sm md:text-[15px] text-slate-400 leading-relaxed max-w-md">
                    一个集聊天、AI、影音、游戏于一体的云端创作空间。翻开这页数字杂志，发现更多可能。
                  </p>
                  <div class="flex flex-wrap gap-2 mt-4">
                    <span
                      v-for="t in heroTags"
                      :key="t"
                      class="text-[10px] px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.10] text-slate-300 font-medium tracking-wider hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-default"
                    >{{ t }}</span>
                  </div>
                </div>
                <div
                  class="hidden md:flex flex-col items-center gap-1 text-[10px] text-slate-500 tracking-[0.2em] uppercase animate-bounce"
                >
                  <ArrowDown class="w-3.5 h-3.5" />
                  Scroll
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
              class="tilt-card app-card group cursor-pointer relative h-full overflow-hidden rounded-2xl flex flex-col justify-between p-5 min-h-[150px] md:min-h-0"
              :style="appTilts[i].transform"
              @click="openApp(app)"
              @mousemove="appTilts[i].onMouseMove"
              @mouseenter="appTilts[i].onMouseEnter"
              @mouseleave="appTilts[i].onMouseLeave"
            >
              <!-- Top accent glow bar -->
              <div
                class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                :class="app.gradient"
              ></div>
              <div
                class="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-12 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                :style="{ background: app.glow }"
              ></div>

              <!-- Subtle gradient wash -->
              <div
                class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                :style="{ background: `radial-gradient(circle at 50% 0%, ${app.glow} 0%, transparent 60%)` }"
              ></div>

              <!-- Mouse glow -->
              <div
                class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                :style="{ background: `radial-gradient(circle at ${appTilts[i].glowX}% ${appTilts[i].glowY}%, ${app.glow} 0%, transparent 60%)` }"
              ></div>

              <!-- Bottom readability fade -->
              <div class="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none"></div>

              <!-- Number -->
              <span class="absolute top-4 right-4 font-serif italic font-black text-2xl md:text-3xl text-white/10 group-hover:text-white/25 transition-all duration-500 group-hover:scale-110">
                {{ String(i + 1).padStart(2, '0') }}
              </span>

              <!-- Content -->
              <div class="relative z-10">
                <div
                  class="app-icon-wrap w-11 h-11 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] flex items-center justify-center shadow-lg transition-all duration-500 group-hover:shadow-[0_0_24px_var(--glow-color)]"
                  :style="{ '--glow-color': app.glow }"
                >
                  <component :is="app.icon" class="w-6 h-6 text-white drop-shadow transition-transform duration-500 group-hover:scale-110" />
                </div>
              </div>

              <div class="relative z-10 mt-3">
                <div class="text-[9px] font-semibold tracking-[0.3em] text-white/40 uppercase mb-1.5">
                  {{ app.tag }}
                </div>
                <h3 class="font-bold text-lg md:text-xl text-white leading-tight">
                  {{ app.title }}
                </h3>
                <p class="text-[11px] md:text-xs text-white/55 mt-1.5 leading-relaxed">
                  {{ app.desc }}
                </p>
              </div>

              <ArrowUpRight
                class="absolute bottom-4 right-4 w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500"
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
              class="tilt-card quote-card group relative h-full overflow-hidden rounded-2xl p-6 flex flex-col justify-between min-h-[170px] md:min-h-0"
              :style="quoteTilt.transform"
              @mousemove="quoteTilt.onMouseMove"
              @mouseenter="quoteTilt.onMouseEnter"
              @mouseleave="quoteTilt.onMouseLeave"
            >
              <!-- Top amber accent -->
              <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent"></div>

              <!-- Mouse glow -->
              <div
                class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                :style="{ background: `radial-gradient(circle at ${quoteTilt.glowX}% ${quoteTilt.glowY}%, rgba(251,191,36,0.12) 0%, transparent 60%)` }"
              ></div>

              <div class="relative z-10">
                <Quote class="w-7 h-7 text-amber-400/70 group-hover:text-amber-400 transition-colors duration-500" />
              </div>
              <div class="relative z-10 mt-4">
                <p class="font-serif italic text-base md:text-lg text-slate-200 leading-relaxed">
                  "{{ dailyQuote.text }}"
                </p>
                <p class="text-[10px] text-amber-300/70 font-semibold mt-4 tracking-[0.2em] uppercase">
                  — {{ dailyQuote.author }}
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
              class="tilt-card app-card group cursor-pointer relative h-full overflow-hidden rounded-2xl flex items-center gap-4 p-5 min-h-[110px] md:min-h-0"
              :style="smallCardTilts[i].transform"
              @click="openApp(card)"
              @mousemove="smallCardTilts[i].onMouseMove"
              @mouseenter="smallCardTilts[i].onMouseEnter"
              @mouseleave="smallCardTilts[i].onMouseLeave"
            >
              <!-- Top accent glow bar -->
              <div
                class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                :class="card.gradient"
              ></div>

              <!-- Mouse glow -->
              <div
                class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                :style="{ background: `radial-gradient(circle at ${smallCardTilts[i].glowX}% ${smallCardTilts[i].glowY}%, ${card.glow} 0%, transparent 60%)` }"
              ></div>

              <!-- Bottom readability fade -->
              <div class="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 via-black/5 to-transparent pointer-events-none"></div>

              <div class="relative z-10 shrink-0">
                <div class="app-icon-wrap w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] flex items-center justify-center shadow transition-all duration-500">
                  <component :is="card.icon" class="w-5 h-5 text-white drop-shadow transition-transform duration-500 group-hover:scale-110" />
                </div>
              </div>
              <div class="relative z-10 min-w-0">
                <div class="text-[9px] font-semibold tracking-[0.25em] text-white/40 uppercase mb-0.5">
                  {{ card.tag }}
                </div>
                <h3 class="font-bold text-sm md:text-base text-white leading-tight truncate">
                  {{ card.title }}
                </h3>
                <p class="text-[10px] md:text-[11px] text-white/55 truncate">
                  {{ card.desc }}
                </p>
              </div>
              <ArrowUpRight
                class="relative z-10 ml-auto w-4 h-4 text-white/30 shrink-0 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500"
              />
            </article>
          </div>
        </div>
      </main>
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

/* ===== Card Surfaces ===== */
.app-card,
.quote-card {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
  transition: transform 0.15s ease-out, box-shadow 0.5s ease, border-color 0.5s ease, background 0.5s ease;
}
.app-card:hover,
.quote-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06);
  transform: translateY(-4px);
}

.quote-card {
  background: linear-gradient(160deg, rgba(251, 191, 36, 0.06) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(255, 255, 255, 0.02) 100%);
}

/* ===== Hero Card ===== */
.hero-card {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease-out, box-shadow 0.5s ease, border-color 0.5s ease;
}
.hero-card:hover {
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06);
}
.hero-surface {
  background:
    radial-gradient(ellipse at 30% 10%, rgba(56, 189, 248, 0.06) 0%, transparent 45%),
    radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 45%),
    rgba(12, 14, 24, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

/* ===== Hero Title Gradient ===== */
.hero-title {
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    #e2e8f0 20%,
    #bae6fd 40%,
    #c4b5fd 60%,
    #f0abfc 80%,
    #ffffff 100%
  );
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 6s ease-in-out infinite;
}
@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* ===== Grid Pattern ===== */
.grid-pattern {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center, black 0%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 75%);
}

/* ===== Noise Overlay ===== */
.noise-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.025;
  background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E');
}

/* ===== Logo Glow ===== */
.logo-mark {
  animation: logo-glow 4s ease-in-out infinite;
}
@keyframes logo-glow {
  0%, 100% { box-shadow: 0 0 24px rgba(139, 92, 246, 0.4); }
  50% { box-shadow: 0 0 36px rgba(139, 92, 246, 0.65), 0 0 60px rgba(56, 189, 248, 0.25); }
}

/* ===== App Icon Hover ===== */
.app-icon-wrap {
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.group:hover .app-icon-wrap {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.22);
}

/* ===== Aurora Orbs ===== */
@keyframes aurora-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.08); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
}
@keyframes aurora-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-25px, 25px) scale(1.05); }
  66% { transform: translate(15px, -15px) scale(0.98); }
}
@keyframes aurora-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, 20px) scale(1.06); }
  66% { transform: translate(-30px, -10px) scale(0.96); }
}
.animate-aurora-1 { animation: aurora-1 20s ease-in-out infinite; }
.animate-aurora-2 { animation: aurora-2 24s ease-in-out infinite; }
.animate-aurora-3 { animation: aurora-3 18s ease-in-out infinite; }

/* ===== Reduced Motion ===== */
@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
  }
  .hero-title { animation: none; }
  .logo-mark { animation: none; }
  .animate-aurora-1,
  .animate-aurora-2,
  .animate-aurora-3 { animation: none; }
}
</style>
