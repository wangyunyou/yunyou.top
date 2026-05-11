<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useConfigStore } from '../../stores/configStore';
import { Send, Bot, User, Loader2, Sparkles, Trash2, Key, Info } from 'lucide-vue-next';

const configStore = useConfigStore();
const messages = ref(JSON.parse(localStorage.getItem('yunyou-ai-messages')) || [
  { role: 'assistant', content: '你好！我是云优 AI 助手，很高兴为你服务。有什么我可以帮你的吗？' }
]);
const input = ref('');
const isTyping = ref(false);
const isComposing = ref(false);
const chatContainer = ref(null);
const textareaRef = ref(null);

// Persistence
import { watch } from 'vue';
watch(messages, (newVal) => {
  localStorage.setItem('yunyou-ai-messages', JSON.stringify(newVal));
}, { deep: true });

// Simple Markdown-ish Renderer
const renderContent = (content) => {
  if (!content) return '';
  let html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks: ```code```
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre class="bg-black/40 p-4 rounded-xl my-3 font-mono text-xs overflow-x-auto border border-white/10 text-emerald-400"><code>${code.trim()}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-rose-400 font-mono text-xs">$1</code>');

  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  return html;
};

// Auto-grow Textarea
const adjustTextarea = () => {
  if (!textareaRef.value) return;
  textareaRef.value.style.height = 'auto';
  textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px';
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!input.value.trim() || isTyping.value || isComposing.value) return;
  if (!configStore.zhipuKey) {
    alert('请配置通讯密钥后再试');
    return;
  }

  const userContent = input.value;
  messages.value.push({ role: 'user', content: userContent });
  input.value = '';
  isTyping.value = true;
  
  // Create an empty placeholder for the assistant's response
  const assistantMessageIndex = messages.value.push({ role: 'assistant', content: '' }) - 1;
  scrollToBottom();

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${configStore.zhipuKey}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: messages.value.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
        stream: true
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || '网络连接异常');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let partialData = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = (partialData + chunk).split('\n');
      partialData = lines.pop(); // Keep incomplete line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta?.content || '';
            if (delta) {
              messages.value[assistantMessageIndex].content += delta;
              scrollToBottom();
            }
          } catch (e) {
            console.error('SSE Error:', e);
          }
        }
      }
    }
  } catch (error) {
    messages.value[assistantMessageIndex].content = `抱歉，通讯中断：${error.message}`;
  } finally {
    isTyping.value = false;
    scrollToBottom();
  }
};

const clearChat = () => {
  messages.value = [
    { role: 'assistant', content: '会话已重置。有什么新问题吗？' }
  ];
  localStorage.removeItem('yunyou-ai-messages');
};
</script>

<template>
  <div class="h-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden font-sans">
    <!-- Header -->
    <div class="p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between z-10">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
          <Sparkles class="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">云优 AI 助手</h3>
          <p class="text-[9px] text-slate-500 uppercase tracking-widest">高级人工智能已就绪</p>
        </div>
      </div>
      
      <button 
        @click="clearChat"
        class="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-rose-400 transition-all"
        title="清除聊天记录"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>

    <!-- Chat Area -->
    <div 
      ref="chatContainer"
      class="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900/50 via-transparent to-transparent"
    >
      <div 
        v-for="(msg, idx) in messages" 
        :key="idx"
        class="flex gap-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300"
        :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
      >
        <div 
          class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg"
          :class="msg.role === 'assistant' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'"
        >
          <Bot v-if="msg.role === 'assistant'" class="w-5 h-5" />
          <User v-else class="w-5 h-5" />
        </div>
        
        <div 
          class="px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xl border ai-content"
          :class="[
            msg.role === 'assistant' 
              ? 'bg-slate-900/80 border-white/5 text-slate-200 rounded-tl-none' 
              : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none'
          ]"
          v-html="renderContent(msg.content)"
        >
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isTyping" class="flex gap-4 max-w-3xl mx-auto">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
          <Bot class="w-5 h-5" />
        </div>
        <div class="px-4 py-3 bg-slate-900/80 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-2">
          <Loader2 class="w-4 h-4 animate-spin text-indigo-400" />
          <span class="text-xs text-slate-400 italic">正在思考中...</span>
        </div>
      </div>

    </div>

    <!-- Input Area -->
    <div class="p-6 bg-slate-900/50 backdrop-blur-xl border-t border-white/5">
      <div class="max-w-3xl mx-auto relative group">
        <textarea 
          ref="textareaRef"
          v-model="input"
          @input="adjustTextarea"
          @keydown.enter="e => { if (!e.shiftKey) { e.preventDefault(); sendMessage(); } }"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
          placeholder="给云优 AI 发送消息... (Shift+Enter 换行)"
          class="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600 resize-none h-14 max-h-32 scrollbar-none"
          :disabled="isTyping"
        ></textarea>
        <button 
          @click="sendMessage"
          :disabled="!input.trim() || isTyping"
          class="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all active:scale-90"
        >
          <Send class="w-5 h-5" />
        </button>
      </div>
      <div class="mt-3 flex items-center justify-center gap-4 text-[9px] text-slate-500 uppercase tracking-widest font-bold">
        <div class="flex items-center gap-1.5"><Info class="w-3 h-3" /> 按回车发送</div>
        <div class="w-1 h-1 rounded-full bg-slate-800"></div>
        <div class="flex items-center gap-1.5"><Bot class="w-3 h-3" /> 云优自研内核</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>
