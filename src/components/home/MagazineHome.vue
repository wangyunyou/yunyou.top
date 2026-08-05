<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWindowStore } from '../../stores/windowStore';
import { usePresenceStore } from '../../stores/presenceStore';
import { useConfigStore } from '../../stores/configStore';
import { appRegistry } from '../../lib/appRegistry';
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
} from 'lucide-vue-next';

const router = useRouter();
const windowStore = useWindowStore();
const presenceStore = usePresenceStore();
const configStore = useConfigStore();

// ---------- Apps ----------
const apps = [
  {
    id: 'chat',
    title: '匿名聊天',
    desc: '无拘无束，说你想说',
    icon: MessagesSquare,
    tag: 'LIVE',
    gradient: 'from-cyan-500 to-blue-600',
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

  // Wait for the DOM to settle (v-for refs may not be ready synchronously).
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
</script>

<template>
  <div
    class="magazine relative h-screen w-screen overflow-hidden bg-[#0a0a11] text-slate-100 select-none"
  >
    <!-- Ambient Background -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <!-- Wallpaper layer -->
      <img
        v-if="configStore.wallpaper"
        :src="configStore.wallpaper"
        alt=""
        class="absolute inset-0 w-full h-full object-cover opacity-30 blur-[2px] saturate-50"
      />
      <div class="absolute inset-0 bg-[#0a0a11]/70"></div>
      <div
        class="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-sky-600/25 blur-[130px] animate-drift"
      ></div>
      <div
        class="absolute top-1/3 -right-48 w-[560px] h-[560px] rounded-full bg-fuchsia-600/20 blur-[140px] animate-drift-slow"
      ></div>
      <div
        class="absolute -bottom-48 left-1/4 w-[480px] h-[480px] rounded-full bg-amber-500/10 blur-[130px] animate-drift"
      ></div>
      <div
        class="absolute inset-0 opacity-[0.035]"
        style="
          background-image: url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E');
        "
      ></div>
    </div>

    <!-- Scroll Container -->
    <div class="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden">
      <main class="max-w-[1360px] mx-auto px-5 md:px-10 pt-6 md:pt-10 pb-20">
        <!-- Top Bar -->
        <header
          :ref="setReveal"
          class="flex items-center justify-between mb-8 md:mb-12 reveal"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-violet-500 to-fuchsia-500 flex items-center justify-center font-serif italic font-black text-white text-lg shadow-[0_8px_24px_-6px_rgba(139,92,246,0.6)]"
            >
              Y
            </div>
            <div>
              <div
                class="font-serif italic font-black text-lg leading-none tracking-wide"
              >
                YUNYOU
              </div>
              <div
                class="text-[9px] text-slate-500 tracking-[0.35em] uppercase mt-1"
              >
                Cloud Magazine
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div
              class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold"
            >
              <span class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"
                ></span>
              </span>
              {{ presenceStore.onlineCount }} 人在线
            </div>
            <a
              href="https://github.com/wangyunyou/yunyou.top"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-semibold text-slate-200"
            >
              <Github class="w-4 h-4" />
              <span class="hidden md:inline">GitHub</span>
            </a>
          </div>
        </header>

        <!-- Magazine Grid -->
        <div
          class="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-5 auto-rows-auto md:auto-rows-[92px]"
        >
          <!-- HERO COVER CARD -->
          <div
            :ref="setReveal"
            class="reveal col-span-2 md:col-span-7 md:row-span-4 transition-delay-0"
          >
            <article
              class="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#121730] via-[#0e1124] to-[#0a0c1a] p-6 md:p-9 flex flex-col justify-between min-h-[420px] md:min-h-0"
            >
              <!-- inner glow -->
              <div
                class="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-sky-500/40 to-violet-600/30 blur-[90px] rounded-full group-hover:scale-125 group-hover:opacity-80 transition-all duration-700"
              ></div>
              <div
                class="absolute -bottom-24 -left-16 w-72 h-72 bg-gradient-to-tr from-fuchsia-500/20 to-amber-400/10 blur-[80px] rounded-full transition-all duration-700"
              ></div>
              <!-- watermark -->
              <span
                class="absolute -bottom-10 right-0 font-serif italic font-black text-[9rem] md:text-[13rem] leading-none text-white/[0.04] group-hover:text-white/[0.08] transition-colors duration-700 select-none"
                >YU</span
              >

              <div class="relative z-10 flex items-center justify-between">
                <span
                  class="text-[10px] font-bold tracking-[0.35em] text-sky-300/90 uppercase"
                  >Issue · 2026</span
                >
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

              <div class="relative z-10 my-5 md:my-6">
                <div
                  class="text-[10px] md:text-xs font-semibold text-fuchsia-300/90 tracking-[0.3em] uppercase mb-2 md:mb-3"
                >
                  The Cloud Magazine
                </div>
                <h1
                  class="font-serif italic font-black text-5xl md:text-8xl leading-[0.95] tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-200 bg-clip-text text-transparent"
                >
                  云优<br />网络
                </h1>
              </div>

              <div class="relative z-10 flex items-end justify-between gap-4">
                <div>
                  <p
                    class="text-xs md:text-sm text-slate-400 leading-relaxed max-w-sm"
                  >
                    一个集聊天、AI、影音、游戏于一体的云端创作空间。欢迎翻开我的数字生活杂志。
                  </p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      v-for="t in heroTags"
                      :key="t"
                      class="text-[9px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-semibold tracking-wider"
                      >{{ t }}</span
                    >
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

          <!-- APP CARDS -->
          <div
            v-for="(app, i) in apps"
            :key="app.id"
            ref="setReveal"
            class="reveal col-span-1"
            :class="app.gridClass"
            :style="{ transitionDelay: `${(i + 1) * 70}ms` }"
          >
            <article
              class="group cursor-pointer relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br transition-all duration-500 hover:-translate-y-1.5 hover:border-white/25 hover:shadow-[0_28px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col justify-between p-5 min-h-[150px] md:min-h-0"
              :class="app.gradient"
              @click="openApp(app)"
            >
              <span
                class="absolute top-4 right-4 font-serif italic font-black text-2xl md:text-3xl text-white/25 group-hover:text-white/60 transition-colors duration-500"
                >{{ String(i + 1).padStart(2, '0') }}</span
              >
              <div
                class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>

              <div class="relative z-10">
                <div
                  class="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500"
                >
                  <component
                    :is="app.icon"
                    class="w-6 h-6 text-white drop-shadow"
                  />
                </div>
              </div>

              <div class="relative z-10 mt-3">
                <div
                  class="text-[9px] font-bold tracking-[0.3em] text-white/60 uppercase mb-1"
                >
                  {{ app.tag }}
                </div>
                <h3
                  class="font-bold text-lg md:text-xl text-white leading-tight"
                >
                  {{ app.title }}
                </h3>
                <p
                  class="text-[11px] md:text-xs text-white/75 mt-1 leading-relaxed"
                >
                  {{ app.desc }}
                </p>
              </div>

              <ArrowUpRight
                class="absolute bottom-4 right-4 w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-500"
              />
            </article>
          </div>

          <!-- QUOTE CARD -->
          <div
            :ref="setReveal"
            class="reveal col-span-2 md:col-span-4 md:row-span-2"
            :style="{ transitionDelay: '350ms' }"
          >
            <article
              class="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#161b2e] to-[#0e1220] p-5 flex flex-col justify-between min-h-[170px] md:min-h-0"
            >
              <Quote
                class="w-6 h-6 text-amber-400/80 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500"
              />
              <div class="mt-3">
                <p
                  class="font-serif italic text-sm md:text-base text-slate-200 leading-relaxed"
                >
                  “{{ dailyQuote.text }}”
                </p>
                <p
                  class="text-[10px] text-amber-300/80 font-bold mt-3 tracking-[0.2em] uppercase"
                >
                  — {{ dailyQuote.author }}
                </p>
              </div>
            </article>
          </div>

          <!-- SMALL CARDS (monitor / settings / github / contact) -->
          <div
            v-for="(card, i) in smallCards"
            :key="card.id"
            ref="setReveal"
            class="reveal col-span-1"
            :class="card.gridClass"
            :style="{ transitionDelay: `${400 + i * 70}ms` }"
          >
            <article
              class="group cursor-pointer relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br transition-all duration-500 hover:-translate-y-1 hover:border-white/25 flex items-center gap-4 p-5 min-h-[110px] md:min-h-0"
              :class="card.gradient"
              @click="openApp(card)"
            >
              <div class="relative z-10 shrink-0">
                <div
                  class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow group-hover:scale-110 transition-transform duration-500"
                >
                  <component
                    :is="card.icon"
                    class="w-5 h-5 text-white drop-shadow"
                  />
                </div>
              </div>
              <div class="relative z-10 min-w-0">
                <div
                  class="text-[9px] font-bold tracking-[0.25em] text-white/60 uppercase mb-0.5"
                >
                  {{ card.tag }}
                </div>
                <h3
                  class="font-bold text-sm md:text-base text-white leading-tight truncate"
                >
                  {{ card.title }}
                </h3>
                <p class="text-[10px] md:text-[11px] text-white/70 truncate">
                  {{ card.desc }}
                </p>
              </div>
              <ArrowUpRight
                class="relative z-10 ml-auto w-4 h-4 text-white/50 shrink-0 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-500"
              />
            </article>
          </div>
        </div>
      </main>
    </div>

    <!-- Windows Layer -->
    <div class="absolute inset-0 z-[60] pointer-events-none">
      <Window v-for="win in windowStore.windows" :key="win.id" :window="win" />
    </div>
  </div>
</template>

<style scoped>
.reveal {
  opacity: 0.82;
  transform: translateY(14px) scale(0.985);
  transition: opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Make sure content is visible even if IntersectionObserver fails. */
@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
  }
}

@keyframes drift {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, -24px) scale(1.06);
  }
}
.animate-drift {
  animation: drift 14s ease-in-out infinite;
}
.animate-drift-slow {
  animation: drift 20s ease-in-out infinite reverse;
}
</style>
