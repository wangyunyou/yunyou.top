<script setup>
import { ref, computed, watch } from 'vue';
import {
  Sparkles,
  Loader2,
  Download,
  Code2,
  Eye,
  Palette,
  Rocket,
  Check,
  Copy,
  Wand2,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  FileCode2,
} from 'lucide-vue-next';

// ---------- State ----------
const description = ref('');
const isGenerating = ref(false);
const currentTemplate = ref('minimal');
const generatedData = ref(null);
const error = ref('');
const previewMode = ref('preview');
const copied = ref(false);
const showExamples = ref(false);

// ---------- Templates ----------
const templates = [
  {
    id: 'minimal',
    name: '极简',
    desc: '黑白留白 · SaaS/工具',
    color: '#f8fafc',
  },
  {
    id: 'warm',
    name: '温暖',
    desc: '暖色圆角 · 课程/知识付费',
    color: '#f97316',
  },
  {
    id: 'business',
    name: '商务',
    desc: '深蓝正式 · B2B/企业',
    color: '#1e40af',
  },
];

// ---------- Examples ----------
const examples = [
  '我卖手工烘焙的咖啡豆，主打云南小粒咖啡，新鲜烘焙72小时内发货，有浅烘中烘两个口味',
  '在线编程教育平台，面向8-15岁青少年，1对1直播教学，已有10万学员',
  '企业级项目管理SaaS，支持看板/甘特图/时间追踪，30人团队免费使用',
  '心理健康App，提供冥想引导、情绪日记和AI倾诉伙伴，已帮助50万用户',
];

const useExample = (ex) => {
  description.value = ex;
  showExamples.value = false;
};

// ---------- AI Generation ----------
const generate = async () => {
  if (!description.value.trim() || isGenerating.value) return;

  isGenerating.value = true;
  error.value = '';

  try {
    const prompt = `你是一个专业的落地页文案策划。根据以下产品描述，生成落地页的结构化内容。

产品描述：${description.value}

请严格返回以下 JSON 格式（不要 markdown 代码块，不要任何解释文字，直接输出 JSON）：
{
  "badge": "短标签，如'新上线'或'限时优惠'",
  "title": "产品名称（简洁有力，不超过10字）",
  "subtitle": "一句话核心卖点（不超过20字）",
  "cta": "主行动按钮文案（2-4字）",
  "ctaSecondary": "次行动按钮文案（2-4字）",
  "features": [
    { "icon": "emoji", "title": "功能标题（4-6字）", "desc": "功能描述（10-20字）" }
  ],
  "stats": [
    { "value": "数字", "label": "标签（2-4字）" }
  ],
  "testimonials": [
    { "name": "姓名", "role": "职位/公司", "content": "评价（20-40字）", "avatar": "单字" }
  ],
  "faq": [
    { "q": "问题（10-20字）", "a": "回答（20-50字）" }
  ],
  "footer": "版权信息"
}

要求：
- features 给 4 个
- stats 给 3 个
- testimonials 给 3 个
- faq 给 4 个
- 内容必须贴合产品描述，具体有说服力，不要空话套话
- 所有文案用中文
- icon 使用 emoji
- avatar 用单个中文字
- 直接返回纯 JSON`;

    const response = await fetch(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer e8e4aba3bdb74dca8a590c10c15a9466.DWWuFVA567LixY0E',
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API 请求失败 (${response.status})`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI 返回内容为空，请重试');
    }

    // Clean up markdown code blocks if present
    let cleaned = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    // 确保所有必需字段存在且类型正确
    parsed.badge = parsed.badge || '';
    parsed.title = parsed.title || '未命名产品';
    parsed.subtitle = parsed.subtitle || '';
    parsed.cta = parsed.cta || '立即体验';
    parsed.ctaSecondary = parsed.ctaSecondary || '了解更多';
    parsed.footer = parsed.footer || '';
    parsed.features = Array.isArray(parsed.features) ? parsed.features : [];
    parsed.stats = Array.isArray(parsed.stats) ? parsed.stats : [];
    parsed.testimonials = Array.isArray(parsed.testimonials) ? parsed.testimonials : [];
    parsed.faq = Array.isArray(parsed.faq) ? parsed.faq : [];
    generatedData.value = parsed;
  } catch (e) {
    error.value = `生成失败：${e.message}。请重试或调整描述。`;
  } finally {
    isGenerating.value = false;
  }
};

// ---------- Template Renderers ----------
const esc = (s) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const renderMinimal = (d) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(d.title)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#0f172a;background:#fff;line-height:1.6}
.container{max-width:960px;margin:0 auto;padding:0 24px}
.hero{text-align:center;padding:100px 0 80px}
.badge{display:inline-block;font-size:13px;font-weight:600;color:#6366f1;background:#eef2ff;border-radius:99px;padding:6px 16px;margin-bottom:24px}
.hero h1{font-size:48px;font-weight:800;letter-spacing:-0.02em;margin-bottom:20px;line-height:1.15}
.hero .subtitle{font-size:20px;color:#64748b;max-width:560px;margin:0 auto 36px}
.hero .cta-group{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;text-decoration:none;transition:all .2s;cursor:pointer;border:none}
.btn-primary{background:#0f172a;color:#fff}
.btn-primary:hover{background:#1e293b;transform:translateY(-1px)}
.btn-secondary{background:#f1f5f9;color:#0f172a}
.btn-secondary:hover{background:#e2e8f0}
.features{padding:60px 0;border-top:1px solid #f1f5f9}
.section-title{text-align:center;font-size:14px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:48px}
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:32px}
.feature{text-align:center}
.feature .icon{font-size:36px;margin-bottom:16px}
.feature h3{font-size:18px;font-weight:700;margin-bottom:8px}
.feature p{font-size:14px;color:#64748b}
.stats{padding:60px 0;background:#f8fafc;border-radius:24px;margin:0 -24px}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;text-align:center}
.stat .value{font-size:40px;font-weight:800;color:#0f172a}
.stat .label{font-size:14px;color:#94a3b8;margin-top:4px}
.testimonials{padding:60px 0}
.testimonial-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
.testimonial{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px}
.testimonial .content{font-size:15px;color:#334155;margin-bottom:20px}
.testimonial .author{display:flex;align-items:center;gap:12px}
.testimonial .avatar{width:40px;height:40px;border-radius:50%;background:#eef2ff;color:#6366f1;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px}
.testimonial .name{font-size:14px;font-weight:600}
.testimonial .role{font-size:12px;color:#94a3b8}
.faq{padding:60px 0;border-top:1px solid #f1f5f9}
.faq-item{border-bottom:1px solid #e2e8f0;padding:20px 0}
.faq-item summary{font-size:16px;font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center}
.faq-item summary::after{content:'+';font-size:22px;color:#94a3b8;transition:transform .2s}
.faq-item[open] summary::after{transform:rotate(45deg)}
.faq-item .answer{font-size:14px;color:#64748b;margin-top:12px;line-height:1.7}
.cta-section{text-align:center;padding:80px 0}
.cta-section h2{font-size:32px;font-weight:800;margin-bottom:16px}
.cta-section p{font-size:16px;color:#64748b;margin-bottom:32px}
footer{text-align:center;padding:40px 0;border-top:1px solid #f1f5f9;font-size:13px;color:#94a3b8}
@media(max-width:640px){
  .hero h1{font-size:32px}
  .hero .subtitle{font-size:16px}
  .stats-grid{grid-template-columns:1fr;gap:32px}
}
</style>
</head>
<body>
<div class="container">
  <section class="hero">
    <span class="badge">${esc(d.badge)}</span>
    <h1>${esc(d.title)}</h1>
    <p class="subtitle">${esc(d.subtitle)}</p>
    <div class="cta-group">
      <a class="btn btn-primary">${esc(d.cta)}</a>
      <a class="btn btn-secondary">${esc(d.ctaSecondary)}</a>
    </div>
  </section>
  <section class="features">
    <p class="section-title">核心功能</p>
    <div class="feature-grid">
      ${d.features.map(f=>`<div class="feature"><div class="icon">${esc(f.icon)}</div><h3>${esc(f.title)}</h3><p>${esc(f.desc)}</p></div>`).join('\n      ')}
    </div>
  </section>
  <section class="stats">
    <div class="container">
      <div class="stats-grid">
        ${d.stats.map(s=>`<div class="stat"><div class="value">${esc(s.value)}</div><div class="label">${esc(s.label)}</div></div>`).join('\n        ')}
      </div>
    </div>
  </section>
  <section class="testimonials">
    <p class="section-title">用户评价</p>
    <div class="testimonial-grid">
      ${d.testimonials.map(t=>`<div class="testimonial"><p class="content">"${esc(t.content)}"</p><div class="author"><div class="avatar">${esc(t.avatar)}</div><div><div class="name">${esc(t.name)}</div><div class="role">${esc(t.role)}</div></div></div></div>`).join('\n      ')}
    </div>
  </section>
  <section class="faq">
    <p class="section-title">常见问题</p>
    ${d.faq.map(f=>`<details class="faq-item"><summary>${esc(f.q)}</summary><div class="answer">${esc(f.a)}</div></details>`).join('\n    ')}
  </section>
  <section class="cta-section">
    <h2>准备好开始了吗？</h2>
    <p>加入我们，开启全新体验</p>
    <a class="btn btn-primary">${esc(d.cta)}</a>
  </section>
  <footer>${esc(d.footer)}</footer>
</div>
</body>
</html>`;

const renderWarm = (d) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(d.title)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#44403c;background:#fffbeb;line-height:1.6}
.container{max-width:960px;margin:0 auto;padding:0 24px}
.hero{text-align:center;padding:80px 0 60px;background:linear-gradient(135deg,#fef3c7,#fed7aa);border-radius:0 0 40px 40px}
.badge{display:inline-block;font-size:13px;font-weight:600;color:#ea580c;background:#fff;border-radius:99px;padding:6px 16px;margin-bottom:20px;box-shadow:0 2px 8px rgba(234,88,12,.15)}
.hero h1{font-size:44px;font-weight:800;color:#1c1917;letter-spacing:-0.02em;margin-bottom:16px;line-height:1.2}
.hero .subtitle{font-size:18px;color:#78716c;max-width:520px;margin:0 auto 32px}
.hero .cta-group{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:16px;font-size:16px;font-weight:600;text-decoration:none;transition:all .2s;cursor:pointer;border:none}
.btn-primary{background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;box-shadow:0 4px 14px rgba(234,88,12,.3)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(234,88,12,.4)}
.btn-secondary{background:#fff;color:#78716c}
.btn-secondary:hover{background:#fef3c7}
.features{padding:60px 0}
.section-title{text-align:center;font-size:14px;font-weight:600;color:#a8a29e;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:40px}
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}
.feature{background:#fff;border-radius:20px;padding:28px 20px;text-align:center;box-shadow:0 2px 12px rgba(120,113,108,.08)}
.feature .icon{font-size:36px;margin-bottom:12px}
.feature h3{font-size:17px;font-weight:700;color:#1c1917;margin-bottom:6px}
.feature p{font-size:13px;color:#78716c}
.stats{padding:48px 0}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;text-align:center}
.stat{background:linear-gradient(135deg,#fef3c7,#fed7aa);border-radius:20px;padding:28px 16px}
.stat .value{font-size:36px;font-weight:800;color:#ea580c}
.stat .label{font-size:13px;color:#78716c;margin-top:4px}
.testimonials{padding:60px 0}
.testimonial-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.testimonial{background:#fff;border-radius:20px;padding:28px;box-shadow:0 2px 12px rgba(120,113,108,.08)}
.testimonial .content{font-size:15px;color:#44403c;margin-bottom:16px;font-style:italic}
.testimonial .author{display:flex;align-items:center;gap:12px}
.testimonial .avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px}
.testimonial .name{font-size:14px;font-weight:600;color:#1c1917}
.testimonial .role{font-size:12px;color:#a8a29e}
.faq{padding:60px 0}
.faq-item{background:#fff;border-radius:16px;margin-bottom:12px;overflow:hidden;box-shadow:0 1px 6px rgba(120,113,108,.06)}
.faq-item summary{padding:18px 24px;font-size:15px;font-weight:600;color:#1c1917;cursor:pointer;list-style:none}
.faq-item summary::after{content:'+';float:right;font-size:20px;color:#a8a29e}
.faq-item[open] summary::after{content:'−'}
.faq-item .answer{padding:0 24px 18px;font-size:14px;color:#78716c;line-height:1.7}
.cta-section{text-align:center;padding:80px 0;background:linear-gradient(135deg,#fef3c7,#fed7aa);border-radius:40px 40px 0 0}
.cta-section h2{font-size:30px;font-weight:800;color:#1c1917;margin-bottom:12px}
.cta-section p{font-size:16px;color:#78716c;margin-bottom:28px}
footer{text-align:center;padding:32px;font-size:13px;color:#a8a29e}
@media(max-width:640px){
  .hero h1{font-size:30px}
  .hero .subtitle{font-size:15px}
  .stats-grid{grid-template-columns:1fr;gap:16px}
}
</style>
</head>
<body>
<div class="hero">
  <div class="container">
    <span class="badge">${esc(d.badge)}</span>
    <h1>${esc(d.title)}</h1>
    <p class="subtitle">${esc(d.subtitle)}</p>
    <div class="cta-group">
      <a class="btn btn-primary">${esc(d.cta)}</a>
      <a class="btn btn-secondary">${esc(d.ctaSecondary)}</a>
    </div>
  </div>
</div>
<div class="container">
  <section class="features">
    <p class="section-title">为什么选择我们</p>
    <div class="feature-grid">
      ${d.features.map(f=>`<div class="feature"><div class="icon">${esc(f.icon)}</div><h3>${esc(f.title)}</h3><p>${esc(f.desc)}</p></div>`).join('\n      ')}
    </div>
  </section>
  <section class="stats">
    <div class="stats-grid">
      ${d.stats.map(s=>`<div class="stat"><div class="value">${esc(s.value)}</div><div class="label">${esc(s.label)}</div></div>`).join('\n      ')}
    </div>
  </section>
  <section class="testimonials">
    <p class="section-title">用户怎么说</p>
    <div class="testimonial-grid">
      ${d.testimonials.map(t=>`<div class="testimonial"><p class="content">"${esc(t.content)}"</p><div class="author"><div class="avatar">${esc(t.avatar)}</div><div><div class="name">${esc(t.name)}</div><div class="role">${esc(t.role)}</div></div></div></div>`).join('\n      ')}
    </div>
  </section>
  <section class="faq">
    <p class="section-title">常见问题</p>
    ${d.faq.map(f=>`<details class="faq-item"><summary>${esc(f.q)}</summary><div class="answer">${esc(f.a)}</div></details>`).join('\n    ')}
  </section>
</div>
<section class="cta-section">
  <h2>准备好开始了吗？</h2>
  <p>加入我们，开启全新体验</p>
  <a class="btn btn-primary">${esc(d.cta)}</a>
</section>
<footer>${esc(d.footer)}</footer>
</body>
</html>`;

const renderBusiness = (d) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(d.title)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#1e293b;background:#fff;line-height:1.6}
.container{max-width:1000px;margin:0 auto;padding:0 24px}
.hero{background:linear-gradient(135deg,#1e3a8a,#1e40af);color:#fff;padding:80px 0 100px;position:relative;overflow:hidden}
.hero::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:60px;background:#fff;clip-path:polygon(0 100%,100% 100%,100% 0,0 60px)}
.hero .container{position:relative;z-index:1}
.badge{display:inline-block;font-size:13px;font-weight:600;color:#bfdbfe;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:99px;padding:6px 16px;margin-bottom:24px}
.hero h1{font-size:44px;font-weight:800;letter-spacing:-0.02em;margin-bottom:16px;line-height:1.2}
.hero .subtitle{font-size:18px;color:#bfdbfe;max-width:560px;margin-bottom:32px}
.hero .cta-group{display:flex;gap:12px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;text-decoration:none;transition:all .2s;cursor:pointer;border:none}
.btn-primary{background:#fff;color:#1e40af}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,.2)}
.btn-secondary{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.3)}
.btn-secondary:hover{background:rgba(255,255,255,.1)}
.features{padding:80px 0 60px}
.section-title{text-align:center;font-size:14px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px}
.section-subtitle{text-align:center;font-size:28px;font-weight:700;margin-bottom:48px}
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px}
.feature{padding:28px;border:1px solid #e2e8f0;border-radius:12px;transition:all .2s}
.feature:hover{border-color:#3b82f6;box-shadow:0 4px 20px rgba(59,130,246,.1)}
.feature .icon{width:48px;height:48px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px}
.feature h3{font-size:17px;font-weight:700;margin-bottom:6px}
.feature p{font-size:14px;color:#64748b}
.stats{padding:48px 0;background:#f8fafc}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;text-align:center}
.stat .value{font-size:40px;font-weight:800;color:#1e40af}
.stat .label{font-size:14px;color:#64748b;margin-top:4px}
.testimonials{padding:60px 0}
.testimonial-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
.testimonial{background:#f8fafc;border-radius:12px;padding:28px;border-left:4px solid #3b82f6}
.testimonial .content{font-size:15px;color:#334155;margin-bottom:16px}
.testimonial .author{display:flex;align-items:center;gap:12px}
.testimonial .avatar{width:40px;height:40px;border-radius:50%;background:#1e40af;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px}
.testimonial .name{font-size:14px;font-weight:600}
.testimonial .role{font-size:12px;color:#94a3b8}
.faq{padding:60px 0;background:#f8fafc}
.faq-item{background:#fff;border-radius:10px;margin-bottom:8px;border:1px solid #e2e8f0;overflow:hidden}
.faq-item summary{padding:18px 24px;font-size:15px;font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center}
.faq-item summary::after{content:'+';font-size:20px;color:#94a3b8}
.faq-item[open] summary::after{content:'−'}
.faq-item .answer{padding:0 24px 18px;font-size:14px;color:#64748b;line-height:1.7}
.cta-section{text-align:center;padding:80px 0;background:linear-gradient(135deg,#1e3a8a,#1e40af);color:#fff}
.cta-section h2{font-size:30px;font-weight:800;margin-bottom:12px}
.cta-section p{font-size:16px;color:#bfdbfe;margin-bottom:28px}
footer{text-align:center;padding:32px;font-size:13px;color:#94a3b8}
@media(max-width:640px){
  .hero h1{font-size:30px}
  .hero .subtitle{font-size:15px}
  .stats-grid{grid-template-columns:1fr;gap:32px}
}
</style>
</head>
<body>
<section class="hero">
  <div class="container">
    <span class="badge">${esc(d.badge)}</span>
    <h1>${esc(d.title)}</h1>
    <p class="subtitle">${esc(d.subtitle)}</p>
    <div class="cta-group">
      <a class="btn btn-primary">${esc(d.cta)}</a>
      <a class="btn btn-secondary">${esc(d.ctaSecondary)}</a>
    </div>
  </div>
</section>
<div class="container">
  <section class="features">
    <p class="section-title">产品功能</p>
    <h2 class="section-subtitle">为效率而生</h2>
    <div class="feature-grid">
      ${d.features.map(f=>`<div class="feature"><div class="icon">${esc(f.icon)}</div><h3>${esc(f.title)}</h3><p>${esc(f.desc)}</p></div>`).join('\n      ')}
    </div>
  </section>
  <section class="stats">
    <div class="container">
      <div class="stats-grid">
        ${d.stats.map(s=>`<div class="stat"><div class="value">${esc(s.value)}</div><div class="label">${esc(s.label)}</div></div>`).join('\n        ')}
      </div>
    </div>
  </section>
  <section class="testimonials">
    <p class="section-title">客户评价</p>
    <h2 class="section-subtitle">值得信赖</h2>
    <div class="testimonial-grid">
      ${d.testimonials.map(t=>`<div class="testimonial"><p class="content">"${esc(t.content)}"</p><div class="author"><div class="avatar">${esc(t.avatar)}</div><div><div class="name">${esc(t.name)}</div><div class="role">${esc(t.role)}</div></div></div></div>`).join('\n      ')}
    </div>
  </section>
  <section class="faq">
    <div class="container">
      <p class="section-title">常见问题</p>
      <h2 class="section-subtitle">疑问解答</h2>
      ${d.faq.map(f=>`<details class="faq-item"><summary>${esc(f.q)}</summary><div class="answer">${esc(f.a)}</div></details>`).join('\n      ')}
    </div>
  </section>
</div>
<section class="cta-section">
  <h2>准备好开始了吗？</h2>
  <p>加入数万企业的选择</p>
  <a class="btn btn-primary" style="background:#fff;color:#1e40af">${esc(d.cta)}</a>
</section>
<footer>${esc(d.footer)}</footer>
</body>
</html>`;

const renderedHTML = computed(() => {
  if (!generatedData.value) return '';
  const d = generatedData.value;
  if (currentTemplate.value === 'minimal') return renderMinimal(d);
  if (currentTemplate.value === 'warm') return renderWarm(d);
  if (currentTemplate.value === 'business') return renderBusiness(d);
  return '';
});

// ---------- Export ----------
const exportHTML = () => {
  const blob = new Blob([renderedHTML.value], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'landing-page.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(renderedHTML.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // fallback: 选中文本供用户手动复制
    const ta = document.createElement('textarea');
    ta.value = renderedHTML.value;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); copied.value = true; setTimeout(() => (copied.value = false), 2000); } catch {}
    document.body.removeChild(ta);
  }
};

const openInNewTab = () => {
  const blob = new Blob([renderedHTML.value], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};
</script>

<template>
  <div class="h-full flex flex-col lg:flex-row bg-slate-950 text-slate-200 overflow-hidden font-sans">
    <!-- ===== Left Panel: Input & Controls ===== -->
    <div class="h-[48%] lg:h-full lg:w-[380px] shrink-0 flex flex-col border-r border-white/5 bg-slate-900/50 backdrop-blur-xl overflow-y-auto pb-safe-min">
      <!-- Header -->
      <div class="p-5 border-b border-white/5 shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg shadow-orange-500/20">
            <Rocket class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">AI 落地页生成器</h3>
            <p class="text-[10px] text-slate-400 uppercase tracking-widest">输入描述 · 一键生成</p>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-5 space-y-4 flex-1">
        <!-- Description Input -->
        <div>
          <label class="text-xs font-semibold text-slate-400 mb-2 block">产品描述</label>
          <textarea
            v-model="description"
            placeholder="描述你的产品或服务，越具体生成效果越好..."
            class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-600 resize-none h-28 scrollbar-none"
            :disabled="isGenerating"
          ></textarea>
        </div>

        <!-- Examples Dropdown -->
        <div class="relative">
          <button
            @click="showExamples = !showExamples"
            class="flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-400 transition-all"
          >
            <Wand2 class="w-3.5 h-3.5" />
            查看示例
            <ChevronDown class="w-3.5 h-3.5" :class="showExamples ? 'rotate-180' : ''" />
          </button>
          <div
            v-if="showExamples"
            class="mt-2 space-y-1.5 bg-slate-950 border border-white/10 rounded-xl p-2"
          >
            <button
              v-for="(ex, i) in examples"
              :key="i"
              @click="useExample(ex)"
              class="block w-full text-left text-xs text-slate-400 hover:text-orange-400 hover:bg-white/5 rounded-lg px-3 py-2 transition-all"
            >
              {{ ex }}
            </button>
          </div>
        </div>

        <!-- Template Selector -->
        <div>
          <label class="text-xs font-semibold text-slate-400 mb-2 block">选择模板风格</label>
          <div class="space-y-2">
            <button
              v-for="tpl in templates"
              :key="tpl.id"
              @click="currentTemplate = tpl.id"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left"
              :class="
                currentTemplate === tpl.id
                  ? 'border-orange-500/50 bg-orange-500/10'
                  : 'border-white/5 hover:border-white/10 bg-slate-950'
              "
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border border-white/10"
                :style="{ background: 'rgba(255,255,255,0.08)', color: tpl.color }"
              >
                {{ tpl.name[0] }}
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold text-slate-200">{{ tpl.name }}</div>
                <div
                  class="text-[10px] truncate"
                  :class="currentTemplate === tpl.id ? 'text-slate-300' : 'text-slate-500'"
                >
                  {{ tpl.desc }}
                </div>
              </div>
              <Check
                v-if="currentTemplate === tpl.id"
                class="w-4 h-4 text-orange-400 shrink-0 ml-auto"
              />
            </button>
          </div>
        </div>

        <!-- Generate Button -->
        <button
          @click="generate"
          :disabled="!description.trim() || isGenerating"
          class="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 disabled:opacity-30 disabled:hover:from-orange-500 disabled:hover:to-rose-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
        >
          <Loader2 v-if="isGenerating" class="w-4 h-4 animate-spin" />
          <Sparkles v-else class="w-4 h-4" />
          {{ isGenerating ? '生成中...' : '生成落地页' }}
        </button>

        <!-- Error -->
        <div
          v-if="error"
          class="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3"
        >
          {{ error }}
        </div>

        <!-- Tips -->
        <div v-if="!generatedData && !isGenerating" class="pt-2">
          <div class="flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
            <Sparkles class="w-3 h-3 mt-0.5 shrink-0 text-orange-500/50" />
            <span>
              描述越具体，生成效果越好。包含产品名称、目标用户、核心卖点、价格等信息效果最佳。
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Right Panel: Preview ===== -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- Preview Toolbar -->
      <div
        v-if="generatedData"
        class="h-12 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-slate-900/50"
      >
        <!-- View Toggle -->
        <div class="flex bg-white/5 rounded-lg p-1 gap-1">
          <button
            @click="previewMode = 'preview'"
            class="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all"
            :class="previewMode === 'preview' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'"
          >
            <Eye class="w-3.5 h-3.5" />
            预览
          </button>
          <button
            @click="previewMode = 'code'"
            class="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all"
            :class="previewMode === 'code' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'"
          >
            <Code2 class="w-3.5 h-3.5" />
            代码
          </button>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            @click="copyCode"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-slate-300 transition-all"
          >
            <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-400" />
            <Copy v-else class="w-3.5 h-3.5" />
            {{ copied ? '已复制' : '复制' }}
          </button>
          <button
            @click="openInNewTab"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-slate-300 transition-all"
          >
            <ExternalLink class="w-3.5 h-3.5" />
            新窗口
          </button>
          <button
            @click="exportHTML"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-400 rounded-lg text-[11px] font-bold text-white transition-all"
          >
            <Download class="w-3.5 h-3.5" />
            导出 HTML
          </button>
        </div>
      </div>

      <!-- Preview Content -->
      <div class="flex-1 overflow-hidden bg-slate-950">
        <!-- iframe Preview -->
        <iframe
          v-if="generatedData && previewMode === 'preview'"
          :srcdoc="renderedHTML"
          class="w-full h-full border-0 bg-white"
          sandbox="allow-scripts"
        ></iframe>

        <!-- Code View -->
        <div v-else-if="generatedData && previewMode === 'code'" class="w-full h-full overflow-auto p-4">
          <pre class="text-xs text-slate-400 font-mono whitespace-pre-wrap break-all">{{ renderedHTML }}</pre>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="w-full h-full flex flex-col items-center justify-center gap-4 text-center px-8"
        >
          <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center">
            <FileCode2 class="w-10 h-10 text-orange-400/60" />
          </div>
          <div>
            <p class="text-sm font-bold text-slate-400">还没有生成内容</p>
            <p class="text-xs text-slate-600 mt-1">在左侧输入产品描述，点击生成落地页</p>
          </div>
          <div class="flex flex-wrap gap-2 justify-center max-w-md mt-2">
            <button
              v-for="(ex, i) in examples.slice(0, 2)"
              :key="i"
              @click="useExample(ex); generate()"
              class="text-[11px] text-slate-500 hover:text-orange-400 bg-white/5 hover:bg-orange-500/10 border border-white/5 rounded-lg px-3 py-1.5 transition-all"
            >
              {{ ex.slice(0, 20) }}...
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
