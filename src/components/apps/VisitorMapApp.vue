<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { MapPin, Globe, Clock, Wifi } from 'lucide-vue-next';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

// ===== Real Location (from IP) =====
const yourLocation = ref(null);
const isLoading = ref(true);
const locationError = ref(false);

// ===== World Clocks =====
const worldCities = [
  { city: '北京', country: '中国', tz: 'Asia/Shanghai', lat: 39.90, lng: 116.40, flag: '🇨🇳' },
  { city: '东京', country: '日本', tz: 'Asia/Tokyo', lat: 35.68, lng: 139.76, flag: '🇯🇵' },
  { city: '首尔', country: '韩国', tz: 'Asia/Seoul', lat: 37.57, lng: 126.98, flag: '🇰🇷' },
  { city: '新加坡', country: '新加坡', tz: 'Asia/Singapore', lat: 1.35, lng: 103.82, flag: '🇸🇬' },
  { city: '迪拜', country: '阿联酋', tz: 'Asia/Dubai', lat: 25.20, lng: 55.27, flag: '🇦🇪' },
  { city: '莫斯科', country: '俄罗斯', tz: 'Europe/Moscow', lat: 55.75, lng: 37.62, flag: '🇷🇺' },
  { city: '伦敦', country: '英国', tz: 'Europe/London', lat: 51.51, lng: -0.13, flag: '🇬🇧' },
  { city: '巴黎', country: '法国', tz: 'Europe/Paris', lat: 48.86, lng: 2.35, flag: '🇫🇷' },
  { city: '纽约', country: '美国', tz: 'America/New_York', lat: 40.71, lng: -74.01, flag: '🇺🇸' },
  { city: '洛杉矶', country: '美国', tz: 'America/Los_Angeles', lat: 34.05, lng: -118.24, flag: '🇺🇸' },
  { city: '圣保罗', country: '巴西', tz: 'America/Sao_Paulo', lat: -23.55, lng: -46.63, flag: '🇧🇷' },
  { city: '悉尼', country: '澳大利亚', tz: 'Australia/Sydney', lat: -33.87, lng: 151.21, flag: '🇦🇺' },
];

// ===== Real-time Clock =====
const now = ref(new Date());
let clockTimer;

const formatTimeForTz = (tz) => {
  try {
    return now.value.toLocaleTimeString('zh-CN', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--:--';
  }
};

const formatDateForTz = (tz) => {
  try {
    return now.value.toLocaleDateString('zh-CN', {
      timeZone: tz,
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  } catch {
    return '---';
  }
};

const getTimeDiff = (tz) => {
  try {
    const localH = now.value.getHours();
    const targetH = parseInt(
      now.value.toLocaleString('en-US', { timeZone: tz, hour: '2-digit', hour12: false })
    );
    let diff = targetH - localH;
    if (diff > 12) diff -= 24;
    if (diff < -12) diff += 24;
    if (diff === 0) return '同时区';
    return diff > 0 ? `早 ${diff}h` : `晚 ${Math.abs(diff)}h`;
  } catch {
    return '';
  }
};

// ===== Online Count =====
const onlineCount = ref(1);
let presenceInit = null;

const initPresenceCount = async () => {
  try {
    const { usePresenceStore } = await import('../../stores/presenceStore');
    const store = usePresenceStore();
    onlineCount.value = store.onlineCount;
    const unwatch = setInterval(() => {
      onlineCount.value = store.onlineCount;
    }, 3000);
    presenceInit = { unwatch };
  } catch {
    // Presence store may not be available
  }
};

// ===== Fetch Real IP Location (with fallbacks + timeout) =====
const TIMEOUT_MS = 4000;

const fetchWithTimeout = async (url, opts = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
};

// Normalize responses from different IP APIs into the same shape
const normalizeIpData = (provider, data) => {
  if (provider === 'ipapi') {
    return {
      city: data.city,
      country: data.country_name,
      region: data.region,
      lat: data.latitude,
      lng: data.longitude,
      ip: data.ip,
      isp: data.org,
      timezone: data.timezone,
    };
  }
  if (provider === 'ip-api') {
    return {
      city: data.city,
      country: data.country,
      region: data.regionName,
      lat: data.lat,
      lng: data.lon,
      ip: data.query,
      isp: data.isp || data.org,
      timezone: data.timezone,
    };
  }
  if (provider === 'ipwho') {
    return {
      city: data.city,
      country: data.country,
      region: data.region,
      lat: data.latitude,
      lng: data.longitude,
      ip: data.ip,
      isp: data.connection?.isp || data.connection?.org,
      timezone: data.timezone?.id,
    };
  }
  return null;
};

const isValid = (loc) => loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng);

const fetchMyLocation = async () => {
  const sources = [
    { provider: 'ipapi', url: 'https://ipapi.co/json/' },
    { provider: 'ipwho', url: 'https://ipwho.is/' },
    { provider: 'ip-api', url: 'http://ip-api.com/json/?lang=zh-CN' },
  ];

  try {
    for (const { provider, url } of sources) {
      try {
        const res = await fetchWithTimeout(url);
        if (!res.ok) continue;
        const data = await res.json();
        // ip-api.com returns {status: 'success', ...} or {status: 'fail', ...}
        if (data?.status === 'fail') continue;
        const loc = normalizeIpData(provider, data);
        if (isValid(loc)) {
          yourLocation.value = {
            city: loc.city || '未知城市',
            country: loc.country || '未知国家',
            region: loc.region || '',
            lat: loc.lat,
            lng: loc.lng,
            ip: loc.ip || '',
            isp: loc.isp || '',
            timezone: loc.timezone || '',
          };
          return;
        }
      } catch {
        // try next source
      }
    }
    // All sources failed
    locationError.value = true;
  } finally {
    isLoading.value = false;
  }
};

// ===== Real World Map =====
const mapLoading = ref(true);
const mapError = ref(false);
const countryPaths = ref([]);
const projection = ref(null);
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

const fetchWorldMap = async () => {
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    if (!res.ok) throw new Error('map fetch failed');
    const topology = await res.json();
    const geojson = feature(topology, topology.objects.countries);

    const proj = geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], geojson);
    const pathGen = geoPath().projection(proj);

    projection.value = proj;
    countryPaths.value = geojson.features.map((f) => ({
      d: pathGen(f),
      id: f.id,
    }));
    mapLoading.value = false;
  } catch (err) {
    console.error('World map load failed:', err);
    mapError.value = true;
    mapLoading.value = false;
  }
};

const projectPoint = (lat, lng) => {
  if (!projection.value) return null;
  const [x, y] = projection.value([lng, lat]);
  return { x, y };
};

// ===== Lifecycle =====
onMounted(() => {
  fetchMyLocation();
  fetchWorldMap();
  initPresenceCount();
  clockTimer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (presenceInit?.unwatch) presenceInit.unwatch();
});

// ===== Computed =====
const yourLocalTime = computed(() => {
  if (!yourLocation.value?.timezone) return '';
  return formatTimeForTz(yourLocation.value.timezone);
});

const yourPoint = computed(() => {
  if (!yourLocation.value) return null;
  return projectPoint(yourLocation.value.lat, yourLocation.value.lng);
});

const selectedCity = ref(worldCities[0]);
const hoveredCity = ref(null);

const cityPoints = computed(() =>
  worldCities
    .map((c) => ({ ...c, point: projectPoint(c.lat, c.lng) }))
    .filter((c) => c.point)
);
</script>

<template>
  <div class="h-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden select-none">
    <!-- Header -->
    <div class="px-6 pt-5 pb-3 flex items-center justify-between shrink-0">
      <div>
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <Globe class="w-5 h-5 text-cyan-400" />
          <span v-if="yourLocation">{{ yourLocation.city }} · 世界时钟</span>
          <span v-else>世界时钟</span>
        </h2>
        <p class="text-[11px] text-slate-500 mt-0.5">
          <template v-if="yourLocation">
            你的位置：{{ yourLocation.city }}, {{ yourLocation.country }} · ISP: {{ yourLocation.isp }}
          </template>
          <template v-else-if="locationError">
            定位失败（IP 服务不可达），仅显示世界时钟
          </template>
          <template v-else>
            正在定位你的位置...
          </template>
        </p>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span class="text-xs text-emerald-300 font-medium">{{ onlineCount }} 人在线</span>
      </div>
    </div>

    <!-- Map Area -->
    <div class="flex-1 relative mx-6 rounded-2xl overflow-hidden border border-white/[0.06] bg-slate-900/50 min-h-0">
      <!-- Dark ocean -->
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/40 to-slate-900"></div>

      <!-- Grid lines -->
      <svg class="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 100 50" preserveAspectRatio="none">
        <line v-for="i in 18" :key="'gh'+i" x1="0" :y1="i * 3" x2="100" :y2="i * 3" stroke="white" stroke-width="0.1"/>
        <line v-for="i in 34" :key="'gv'+i" :x1="i * 3" y1="0" :x2="i * 3" y2="50" stroke="white" stroke-width="0.1"/>
      </svg>

      <!-- Real World Map SVG -->
      <svg class="absolute inset-0 w-full h-full" :viewBox="`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`" preserveAspectRatio="xMidYMid slice">
        <!-- Countries -->
        <g fill="rgba(148,163,184,0.12)" stroke="rgba(148,163,184,0.22)" stroke-width="0.8">
          <path
            v-for="country in countryPaths"
            :key="country.id"
            :d="country.d"
            class="transition-colors duration-300 hover:fill-cyan-400/20"
          />
        </g>

        <!-- Your Location Pin -->
        <g v-if="yourPoint">
          <circle :cx="yourPoint.x" :cy="yourPoint.y" r="12" fill="none" stroke="#22d3ee" stroke-width="1.5" opacity="0.4">
            <animate attributeName="r" values="12;35;12" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle :cx="yourPoint.x" :cy="yourPoint.y" r="6" fill="#22d3ee">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
          </circle>
          <text
            :x="yourPoint.x + 12"
            :y="yourPoint.y - 6"
            fill="#22d3ee"
            font-size="22"
            font-weight="bold"
            class="dot-label"
          >{{ yourLocation.city }}</text>
        </g>

        <!-- World City Dots -->
        <g
          v-for="c in cityPoints"
          :key="c.city"
          class="cursor-pointer"
          @mouseenter="hoveredCity = c"
          @mouseleave="hoveredCity = null"
          @click="selectedCity = c"
        >
          <circle
            :cx="c.point.x"
            :cy="c.point.y"
            r="4"
            fill="rgba(148,163,184,0.6)"
            :fill-opacity="hoveredCity?.city === c.city || selectedCity?.city === c.city ? 1 : 0.6"
            class="transition-all duration-200"
          />
          <text
            v-if="hoveredCity?.city === c.city || selectedCity?.city === c.city"
            :x="c.point.x + 10"
            :y="c.point.y + 5"
            fill="#22d3ee"
            font-size="18"
            font-weight="600"
            class="city-label"
          >{{ c.city }}</text>
        </g>
      </svg>

      <!-- Loading overlay -->
      <div v-if="isLoading || mapLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 gap-3">
        <Globe class="w-8 h-8 text-cyan-400 animate-spin" style="animation-duration: 3s"/>
        <span class="text-xs text-slate-400">{{ mapLoading ? '加载真实世界地图...' : '定位中...' }}</span>
      </div>

      <!-- Error overlay -->
      <div v-if="mapError" class="absolute inset-0 flex items-center justify-center bg-slate-950/70">
        <span class="text-xs text-slate-400">地图加载失败，请刷新重试</span>
      </div>
    </div>

    <!-- World Clocks Grid -->
    <div class="px-6 pt-4 pb-6 overflow-y-auto shrink-0 pb-safe">
      <div class="flex items-center gap-2 mb-3">
        <Clock class="w-4 h-4 text-cyan-400" />
        <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">全球时钟 (实时)</span>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        <div
          v-if="yourLocation"
          class="p-3 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20 flex flex-col gap-1"
        >
          <div class="flex items-center gap-1.5">
            <MapPin class="w-3 h-3 text-cyan-400" />
            <span class="text-[10px] text-cyan-400/70 font-medium">你的位置</span>
          </div>
          <div class="text-sm font-bold text-white mt-0.5">{{ yourLocation.city }}</div>
          <div class="text-xs text-cyan-400/50">{{ yourLocation.country }}</div>
          <div class="text-2xl font-mono font-bold text-cyan-300 mt-1 tracking-tight">
            {{ yourLocalTime || '--:--:--' }}
          </div>
          <div class="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
            <Wifi class="w-2.5 h-2.5" />
            {{ yourLocation.ip }}
          </div>
        </div>

        <div
          v-for="city in worldCities"
          :key="city.city"
          class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.10] transition-all cursor-pointer group flex flex-col gap-1"
          @click="selectedCity = city"
          :class="{ 'border-cyan-500/30 bg-cyan-500/[0.05]': selectedCity?.city === city.city }"
        >
          <div class="flex items-center gap-1.5">
            <span class="text-xs">{{ city.flag }}</span>
            <span class="text-[10px] text-slate-500 font-medium">{{ city.city }}</span>
          </div>
          <div class="text-sm font-bold text-white leading-tight">{{ city.country }}</div>
          <div class="text-2xl font-mono font-bold text-slate-200 tracking-tight leading-none"
               :class="{ 'text-cyan-400': selectedCity?.city === city.city }">
            {{ formatTimeForTz(city.tz) }}
          </div>
          <div class="flex items-center justify-between mt-1">
            <span class="text-[10px] text-slate-500">{{ formatDateForTz(city.tz) }}</span>
            <span class="text-[10px] text-cyan-400/70 font-medium">{{ getTimeDiff(city.tz) }}</span>
          </div>
        </div>
      </div>

      <!-- Footer note -->
      <div class="mt-4 text-center">
        <p class="text-[10px] text-slate-600">
          真实世界地图数据来自 Natural Earth (via world-atlas)
          <span class="mx-1">·</span>
          你的位置来自 ipapi.co
          <span class="mx-1">·</span>
          在线人数来自 Supabase Realtime
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dot-label, .city-label {
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
  pointer-events: none;
}
</style>
