import { ref } from 'vue';

const DEFAULT_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const PROXY_API_URL = '/api/ai/chat';
const DEFAULT_KEY = 'e8e4aba3bdb74dca8a590c10c15a9466.DWWuFVA567LixY0E';

/**
 * Hook for interacting with Zhipu AI BigModel API
 */
export function useZhipuAI() {
  const isGenerating = ref(false);
  const error = ref(null);

  /**
   * Determine headers & target endpoint URL
   */
  function getRequestOptions(useProxy = true) {
    const apiKey = import.meta.env.VITE_ZHIPU_API_KEY || DEFAULT_KEY;
    const url = useProxy ? PROXY_API_URL : DEFAULT_API_URL;
    const headers = {
      'Content-Type': 'application/json',
    };

    // If calling direct endpoint or if apiKey is provided in env/default, attach Authorization header
    if (!useProxy && apiKey) {
      headers.Authorization = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
    }

    return { url, headers };
  }

  /**
   * Helper to execute request with automatic proxy -> direct fallback if proxy fails with 404
   */
  async function executeFetch(body, useStream = false) {
    let { url, headers } = getRequestOptions(true);
    let response;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      // If proxy route is not configured in environment (returns 404 html), fallback to direct API call
      if (response.status === 404) {
        const directOpts = getRequestOptions(false);
        response = await fetch(directOpts.url, {
          method: 'POST',
          headers: directOpts.headers,
          body: JSON.stringify(body),
        });
      }
    } catch {
      // Network error on proxy route, attempt direct URL
      const directOpts = getRequestOptions(false);
      response = await fetch(directOpts.url, {
        method: 'POST',
        headers: directOpts.headers,
        body: JSON.stringify(body),
      });
    }

    if (!response.ok) {
      let errorMsg = `请求失败 (${response.status})`;
      try {
        const text = await response.text();
        if (text) {
          const parsed = JSON.parse(text);
          errorMsg = parsed.error?.message || parsed.message || errorMsg;
        }
      } catch {
        // ignore parse error
      }
      throw new Error(errorMsg);
    }

    return response;
  }

  /**
   * Non-streaming chat completion
   */
  async function chatCompletion({ messages, model = 'glm-4-flash', temperature = 0.7 }) {
    isGenerating.value = true;
    error.value = null;

    try {
      const response = await executeFetch(
        {
          model,
          messages,
          temperature,
          stream: false,
        },
        false
      );

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || '';
      if (!content) {
        throw new Error('AI 返回内容为空，请重试');
      }
      return content;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Streaming chat completion (SSE)
   */
  async function streamChatCompletion({
    messages,
    model = 'glm-4-flash',
    temperature = 0.7,
    onChunk,
  }) {
    isGenerating.value = true;
    error.value = null;

    try {
      const response = await executeFetch(
        {
          model,
          messages,
          temperature,
          stream: true,
        },
        true
      );

      if (!response.body) {
        throw new Error('流式响应不可用，请检查网络环境');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialData = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialData + chunk).split('\n');
        partialData = lines.pop() || ''; // Keep incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const delta = data.choices?.[0]?.delta?.content || '';
              if (delta && onChunk) {
                onChunk(delta);
              }
            } catch (e) {
              console.error('[useZhipuAI] SSE parse error:', e);
            }
          }
        }
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isGenerating.value = false;
    }
  }

  return {
    isGenerating,
    error,
    chatCompletion,
    streamChatCompletion,
  };
}
