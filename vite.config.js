import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

const createZhipuProxy = () => ({
  target: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  changeOrigin: true,
  rewrite: (p) => p.replace(/^\/api\/ai\/chat/, ''),
  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq) => {
      const key = process.env.ZHIPU_API_KEY || process.env.VITE_ZHIPU_API_KEY || 'e8e4aba3bdb74dca8a590c10c15a9466.DWWuFVA567LixY0E';
      if (key) {
        proxyReq.setHeader('Authorization', key.startsWith('Bearer ') ? key : `Bearer ${key}`);
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/ai/chat': createZhipuProxy(),
    },
  },
  preview: {
    proxy: {
      '/api/ai/chat': createZhipuProxy(),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-geo': ['d3-geo', 'topojson-client'],
          'vendor-icons': ['lucide-vue-next'],
        },
      },
    },
  },
});
