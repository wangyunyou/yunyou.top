import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePresenceStore = defineStore('presence', () => {
  const onlineCount = ref(1);
  let channel = null;
  let initPromise = null;

  const initPresence = () => {
    if (channel) return Promise.resolve();
    if (initPromise) return initPromise;

    initPromise = import('../lib/supabase')
      .then(({ supabase }) => {
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

        return channel;
      })
      .catch((error) => {
        console.warn('[Presence] 在线人数初始化失败', error);
        initPromise = null;
      });

    return initPromise;
  };

  return {
    onlineCount,
    initPresence,
  };
});
