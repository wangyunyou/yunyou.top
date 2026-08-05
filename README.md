# 云优 · yunyou.top

> 个人门户网站 — 杂志风主页 + 8 款内置应用 + 实时协作

## 应用

| 应用 | 说明 |
|---|---|
| 匿名聊天 | 基于 Supabase Realtime 的多人匿名聊天室 |
| 云优 AI | 多模型 AI 对话（DeepSeek / 豆包 / 通义千问） |
| 短视频 | 短视频浏览与播放 |
| 相册 | 图片管理与浏览 |
| 游戏厅 | 小游戏集合 |
| 音乐 | 在线音乐播放器 |
| 系统监控 | 实时系统资源监控面板 |
| 设置 | 壁纸切换、主题配置 |

## 技术栈

- **框架** — Vue 3 (Composition API) + Vite 5
- **路由** — Vue Router 4
- **状态管理** — Pinia
- **样式** — Tailwind CSS 3
- **图标** — Lucide Vue Next
- **工具库** — VueUse
- **后端/实时** — Supabase (Realtime + Auth)

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
```

然后编辑 `.env.local`，配置 Supabase：

| 变量 | 用途 | 获取地址 |
|---|---|---|
| `VITE_SUPABASE_URL` | 聊天室 + 在线人数 | https://supabase.com/dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | 同上 | 同上 |

> 不配 Supabase 不影响主页和其他应用，只影响匿名聊天室和在线人数统计。

```bash
# 启动开发服务器
npm run dev
```

访问 `http://localhost:5173` 即可看到主页。

## 构建部署

```bash
npm run build    # 输出到 dist/
npm run preview  # 本地预览生产构建
```

`dist/` 目录可直接部署到任意静态托管服务（Vercel、Netlify、Cloudflare Pages 等）。

## 项目结构

```
src/
├── components/
│   ├── apps/          # 8 个应用组件
│   ├── home/          # 杂志风主页
│   └── os/            # 窗口系统
├── lib/               # 应用注册表等工具
├── stores/            # Pinia stores (config/window/presence)
├── router/            # 路由定义
├── App.vue            # 根组件
├── main.js            # 入口
└── style.css          # 全局样式
```

## 许可证

MIT
