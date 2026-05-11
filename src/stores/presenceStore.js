import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../lib/supabase';

export const usePresenceStore = defineStore('presence', () => {
  const onlineCount = ref(1);
  let channel = null;

  const initPresence = () => {
    if (channel) return;

    channel = supabase.channel('global_presence', {
      config: {
        presence: {
          key: 'user_' + Math.random().toString(36).substring(7),
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        onlineCount.value = Object.keys(state).length;
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });
  };

  return {
    onlineCount,
    initPresence,
  };
});
