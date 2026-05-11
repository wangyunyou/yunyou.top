<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Send, Hash, Users, ShieldAlert } from 'lucide-vue-next';
import { supabase } from '../../lib/supabase';

const messages = ref([]);
const newMessage = ref('');
const username = ref(`User-${Math.floor(Math.random() * 900) + 100}`);
const chatContainer = ref(null);
const onlineCount = ref(1); // 默认为1人
let subscription = null;

// 获取初始消息
const fetchMessages = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(50);
  
  if (!error) {
    messages.value = data.map(m => ({
      id: m.id,
      user: m.username,
      text: m.content,
      type: m.username === username.value ? 'me' : 'other'
    }));
    scrollToBottom();
  }
};

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  
  const content = newMessage.value;
  newMessage.value = '';

  const tempId = Date.now();
  messages.value.push({
    id: tempId,
    user: username.value,
    text: content,
    type: 'me'
  });
  scrollToBottom();

  const { error } = await supabase
    .from('messages')
    .insert([
      { username: username.value, content: content, type: 'user' }
    ]);

  if (error) {
    console.error('Error sending message:', error);
    messages.value = messages.value.filter(m => m.id !== tempId);
    alert('发送失败，请检查 Supabase RLS 权限是否关闭！');
  } else {
    // 广播消息给其他在线用户 (双重保险)
    subscription.send({
      type: 'broadcast',
      event: 'message',
      payload: {
        id: tempId,
        username: username.value,
        content: content
      }
    });
  }
};

// 订阅实时更新 & 在线人数
const subscribeToMessages = () => {
  subscription = supabase.channel('public:messages');

  subscription
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      const newMsg = payload.new;
      if (newMsg.username !== username.value) {
        messages.value.push({
          id: newMsg.id,
          user: newMsg.username,
          text: newMsg.content,
          type: 'other'
        });
        scrollToBottom();
      } else {
        if (!messages.value.find(m => m.id === newMsg.id)) {
           messages.value.push({
            id: newMsg.id,
            user: newMsg.username,
            text: newMsg.content,
            type: 'me'
          });
          scrollToBottom();
        }
      }
    })
    // 监听广播消息 (更快的实时更新)
    .on('broadcast', { event: 'message' }, payload => {
      const data = payload.payload;
      if (data.username !== username.value) {
        // 检查是否已经存在该消息（避免和 postgres_changes 重复）
        const exists = messages.value.find(m => m.text === data.content && m.user === data.username);
        if (!exists) {
          messages.value.push({
            id: data.id,
            user: data.username,
            text: data.content,
            type: 'other'
          });
          scrollToBottom();
        }
      }
    })
    // 监听在线人数变化
    .on('presence', { event: 'sync' }, () => {
      const newState = subscription.presenceState();
      // 获取唯一的在线用户数量
      onlineCount.value = Object.keys(newState).length;
    })
    .subscribe(async (status) => {
      console.log('Supabase Subscription Status:', status);
      if (status === 'SUBSCRIBED') {
        // 加入并在状态里登记自己
        await subscription.track({
          user: username.value,
          online_at: new Date().toISOString(),
        });
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Supabase Channel Error: Realtime might not be enabled for this table.');
      }
    });
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

onMounted(() => {
  fetchMessages();
  subscribeToMessages();
});

onUnmounted(() => {
  if (subscription) supabase.removeChannel(subscription);
});
</script>


<template>
  <div class="h-full flex flex-col bg-slate-900/40 backdrop-blur-md text-slate-100 overflow-hidden">
    <!-- Chat Header -->
    <div class="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-sky-500/20 rounded-lg text-sky-400">
          <Hash class="w-5 h-5" />
        </div>
        <div>
          <h3 class="font-bold text-sm"># 公共聊天室</h3>
          <p class="text-[10px] text-slate-400 uppercase tracking-widest">匿名交流频道</p>
        </div>
      </div>
      <div class="flex items-center gap-4 text-xs text-slate-400">
        <span class="flex items-center gap-1"><Users class="w-3.5 h-3.5" /> {{ onlineCount }} 人在线</span>
      </div>
    </div>

    <!-- Messages Area -->
    <div 
      ref="chatContainer"
      class="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
    >
      <div 
        v-for="msg in messages" 
        :key="msg.id"
        class="flex flex-col"
        :class="[msg.type === 'me' ? 'items-end' : 'items-start']"
      >
        <!-- System Message -->
        <div v-if="msg.type === 'system'" class="w-full flex justify-center my-4">
          <div class="px-3 py-1 bg-white/5 rounded-full text-[10px] text-slate-500 border border-white/5 flex items-center gap-2">
            <ShieldAlert class="w-3 h-3" /> {{ msg.text }}
          </div>
        </div>

        <!-- User Message -->
        <div v-else class="max-w-[80%] space-y-1">
          <div class="flex items-center gap-2 px-1">
            <span class="text-[10px] font-bold text-sky-400" v-if="msg.type !== 'me'">{{ msg.user }}</span>
            <span class="text-[9px] text-slate-500">{{ new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
          </div>
          <div 
            class="px-4 py-2.5 rounded-2xl text-sm"
            :class="[
              msg.type === 'me' 
                ? 'bg-sky-500 text-white rounded-tr-none' 
                : msg.type === 'admin' 
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 rounded-tl-none'
                  : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
            ]"
          >
            {{ msg.text }}
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 bg-white/5 border-t border-white/10">
      <form @submit.prevent="sendMessage" class="flex gap-3">
        <input 
          v-model="newMessage"
          type="text"
          placeholder="输入消息，匿名发送..."
          class="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-600"
        />
        <button 
          type="submit"
          class="p-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all active:scale-90"
        >
          <Send class="w-5 h-5" />
        </button>
      </form>
      <div class="mt-2 text-[9px] text-slate-500 text-center">
        当前身份：<span class="text-sky-500 font-mono">{{ username }}</span>
      </div>
    </div>
  </div>
</template>
