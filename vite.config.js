import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

const BIGMODEL_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

async function handleAiProxy(req, res, zhipuKey) {
  if (!zhipuKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: { message: '服务端未配置 ZHIPU_API_KEY' } }));
    return;
  }

  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 1024 * 1024) {
        res.statusCode = 413;
        res.end(JSON.stringify({ error: { message: '请求体过大' } }));
        return;
      }
    }

    const upstream = await fetch(BIGMODEL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${zhipuKey}`,
      },
      body,
    });

    if (!upstream.ok) {
      const upstreamText = await upstream.text();
      let message = 'AI 服务返回错误';
      try {
        const upstreamJson = JSON.parse(upstreamText);
        message = upstreamJson.error?.message || upstreamJson.message || upstreamText || message;
      } catch {
        message = upstreamText || message;
      }
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: { message } }));
      return;
    }

    res.statusCode = upstream.status;
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const reader = upstream.body?.getReader();
    if (!reader) {
      res.end();
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error) {
    console.error('[AI Proxy]', error);
    if (!res.headersSent) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify({ error: { message: 'AI 服务暂时不可用' } }));
  }
}

function aiProxyPlugin(env) {
  const middleware = (req, res) =>
    handleAiProxy(req, res, env.ZHIPU_API_KEY || process.env.ZHIPU_API_KEY);

  return {
    name: 'ai-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai/chat', middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/ai/chat', middleware);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [vue(), aiProxyPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
