<script setup>
import { ref, computed } from 'vue';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  PenLine,
  Lightbulb,
  Loader2,
} from 'lucide-vue-next';

const keyword = ref('');
const isGenerating = ref(false);
const copied = ref(false);
const isComposing = ref(false);

const couplet = ref({
  upper: '',
  lower: '',
  horizontal: '',
});

const history = ref([]);

const ZHIPU_API = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const ZHIPU_KEY = 'Bearer e8e4aba3bdb74dca8a590c10c15a9466.DWWuFVA567LixY0E';

// Quick keywords
const quickKeywords = ['春天', '明月', '龙年', '福', '家', '江山', '梅花', '茶'];

const promptText = computed(() => {
  if (!keyword.value.trim()) return '点击下方快速词或输入主题来生成对联...';
  return `正在为「${keyword.value}」创作对联...`;
});

const generateCouplet = async (kw = null) => {
  const topic = kw || keyword.value.trim();
  if (!topic || isGenerating.value) return;

  isGenerating.value = true;
  couplet.value = { upper: '', lower: '', horizontal: '' };

  try {
    const response = await fetch(ZHIPU_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: ZHIPU_KEY,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'system',
            content: `你是一位精通中国传统对联的文学大师。请根据用户提供的主题创作一副对联。

严格要求：
1. 上下联字数相等（通常 5-9 字），词性对应，平仄相对
2. 横批需为 4 字，高度概括主题
3. 对联应意蕴深远、朗朗上口

请严格按以下 JSON 格式返回，不要包含任何其他文字：
{"upper": "上联内容", "lower": "下联内容", "horizontal": "横批内容"}`,
          },
          {
            role: 'user',
            content: `请为「${topic}」创作一副对联。`,
          },
        ],
        stream: false,
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      let errorMsg = '请求失败';
      try {
        const data = await response.json();
        errorMsg = data.error?.message || `请求失败 (${response.status})`;
      } catch {}
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Try to parse JSON response
    let parsed;
    try {
      // Strip markdown code blocks if any
      const cleanContent = content.replace(/```(?:json)?\n?/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch {
      // Fallback: try to extract from text
      const upperMatch = content.match(/["']?upper["']?\s*[:：]\s*["']([^"'\n]+)["']/);
      const lowerMatch = content.match(/["']?lower["']?\s*[:：]\s*["']([^"'\n]+)["']/);
      const horizontalMatch = content.match(/["']?horizontal["']?\s*[:：]\s*["']([^"'\n]+)["']/);

      if (upperMatch && lowerMatch && horizontalMatch) {
        parsed = {
          upper: upperMatch[1],
          lower: lowerMatch[1],
          horizontal: horizontalMatch[1],
        };
      } else {
        throw new Error('AI 返回格式异常，请重试');
      }
    }

    couplet.value = {
      upper: parsed.upper || '',
      lower: parsed.lower || '',
      horizontal: parsed.horizontal || '',
    };

    // Add to history
    history.value.unshift({
      id: Date.now(),
      topic,
      upper: parsed.upper,
      lower: parsed.lower,
      horizontal: parsed.horizontal,
    });

    if (history.value.length > 20) history.value.pop();
  } catch (error) {
    couplet.value = {
      upper: '生成失败',
      lower: error.message || '请稍后重试',
      horizontal: '抱歉',
    };
  } finally {
    isGenerating.value = false;
  }
};

const copyCouplet = async () => {
  if (!couplet.value.upper) return;
  const text = `【${couplet.value.horizontal}】\n上联：${couplet.value.upper}\n下联：${couplet.value.lower}`;
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  }
};

const regen = () => {
  const topic = keyword.value.trim();
  if (topic) generateCouplet(topic);
};
</script>

<template>
  <div class="h-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
    <div class="h-full flex flex-col md:flex-row">
      <!-- ===== Left: Generator ===== -->
      <div class="flex-1 flex flex-col min-h-0 p-6 md:p-8">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-gradient-to-br from-red-500 to-amber-500 rounded-xl shadow-lg">
            <PenLine class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="font-bold text-white">AI 对联生成器</h3>
            <p class="text-[10px] text-slate-500 uppercase tracking-wider">传统对联 · 智能创作</p>
          </div>
        </div>

        <!-- Input Area -->
        <div class="mb-5">
          <div class="relative">
            <input
              v-model="keyword"
              @keydown.enter="!isComposing && generateCouplet()"
              @compositionstart="isComposing = true"
              @compositionend="isComposing = false"
              placeholder="输入主题关键词，如：春天、团圆、事业..."
              class="w-full bg-slate-900/80 border border-white/[0.08] rounded-2xl px-5 py-4 pr-12 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:bg-slate-900 transition-all"
            />
            <Lightbulb class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
          </div>

          <!-- Quick Keywords -->
          <div class="flex flex-wrap gap-2 mt-3">
            <button
              v-for="kw in quickKeywords"
              :key="kw"
              @click="keyword = kw; generateCouplet(kw)"
              :disabled="isGenerating"
              class="px-3 py-1.5 text-xs rounded-full bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/[0.05] transition-all disabled:opacity-30"
            >
              {{ kw }}
            </button>
          </div>
        </div>

        <!-- Action Button -->
        <button
          @click="generateCouplet()"
          :disabled="!keyword.trim() || isGenerating"
          class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:from-red-400 hover:to-amber-400 disabled:opacity-30 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-6"
        >
          <Sparkles class="w-4 h-4" />
          {{ isGenerating ? '正在创作...' : '生成对联' }}
        </button>

        <!-- Status -->
        <div v-if="isGenerating" class="flex flex-col items-center justify-center flex-1 gap-4 text-slate-400">
          <Loader2 class="w-8 h-8 animate-spin text-amber-400" />
          <p class="text-sm">{{ promptText }}</p>
        </div>

        <!-- Couplet Display -->
        <div v-else-if="couplet.upper" class="flex-1 flex flex-col items-center justify-center gap-4 px-4 pb-4">
          <!-- Horizontal Banner -->
          <div class="horizontal-banner text-center">
            <div class="text-[13px] text-amber-400/60 tracking-[0.4em] uppercase mb-1 font-medium">横批</div>
            <div class="relative inline-block">
              <div class="text-amber-400 font-serif font-bold text-2xl md:text-3xl tracking-[0.5em] px-8 py-3 bg-gradient-to-b from-red-950/60 to-amber-950/40 border border-amber-500/20 rounded-lg shadow-inner">
                {{ couplet.horizontal }}
              </div>
              <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"></div>
            </div>
          </div>

          <!-- Vertical Couplet -->
          <div class="flex gap-8 md:gap-16 justify-center">
            <!-- Upper (Right in traditional, Left here for display) -->
            <div class="couplet-column text-center">
              <div class="text-[11px] text-slate-500 tracking-[0.3em] mb-3">上联</div>
              <div class="couplet-text text-2xl md:text-3xl font-serif text-white">
                <span v-for="(char, i) in couplet.upper" :key="'u'+i" class="char" :style="{ animationDelay: i * 0.08 + 's' }">{{ char }}</span>
              </div>
            </div>

            <!-- Lower (Left in traditional, Right here for display) -->
            <div class="couplet-column text-center">
              <div class="text-[11px] text-slate-500 tracking-[0.3em] mb-3">下联</div>
              <div class="couplet-text text-2xl md:text-3xl font-serif text-white">
                <span v-for="(char, i) in couplet.lower" :key="'l'+i" class="char" :style="{ animationDelay: (i * 0.08 + 0.4) + 's' }">{{ char }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 mt-4 md:mt-6">
            <button
              @click="regen"
              :disabled="isGenerating"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all text-sm disabled:opacity-30"
            >
              <RefreshCw class="w-4 h-4" />
              换一副
            </button>
            <button
              @click="copyCouplet"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all text-sm"
            >
              <Check v-if="copied" class="w-4 h-4 text-emerald-400" />
              <Copy v-else class="w-4 h-4" />
              {{ copied ? '已复制' : '复制' }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex-1 flex flex-col items-center justify-center text-slate-600 gap-3">
          <PenLine class="w-12 h-12 opacity-30" />
          <p class="text-sm">输入主题，AI 为你创作一副精美对联</p>
          <p class="text-[11px] opacity-60">如：春天、团圆、事业有成...</p>
        </div>
      </div>

      <!-- ===== Right: History ===== -->
      <div class="w-full md:w-72 border-t md:border-t-0 md:border-l border-white/[0.06] bg-white/[0.01] backdrop-blur-sm flex flex-col min-h-0">
        <div class="p-4 border-b border-white/[0.06]">
          <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <RefreshCw class="w-3 h-3" />
            历史记录
          </h4>
        </div>

        <div v-if="history.length === 0" class="flex-1 flex items-center justify-center p-4">
          <p class="text-xs text-slate-600 text-center">还没有生成对联<br/>输入主题开始创作吧</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto p-3 space-y-2 pb-safe-min">
          <div
            v-for="(item, idx) in history"
            :key="item.id"
            class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-all group cursor-pointer"
            @click="keyword = item.topic; generateCouplet(item.topic)"
          >
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80 font-medium">
                {{ item.topic }}
              </span>
              <span class="text-[10px] text-slate-600">#{{ history.length - idx }}</span>
            </div>
            <div class="text-xs text-slate-300 leading-relaxed">
              <span class="text-amber-400/60">上：</span>{{ item.upper }}
            </div>
            <div class="text-xs text-slate-300 leading-relaxed">
              <span class="text-amber-400/60">下：</span>{{ item.lower }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.couplet-text .char {
  display: inline-block;
  opacity: 0;
  transform: translateY(10px);
  animation: char-appear 0.5s ease-out forwards;
}

@keyframes char-appear {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.couplet-column {
  position: relative;
}

.couplet-column::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  border: 1px solid rgba(251, 191, 36, 0.08);
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.04) 0%, rgba(251, 191, 36, 0.01) 50%, rgba(251, 191, 36, 0.04) 100%);
  pointer-events: none;
}

.couplet-column {
  padding: 2rem 1.5rem;
}

.horizontal-banner {
  animation: banner-fade 0.8s ease-out;
}

@keyframes banner-fade {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
