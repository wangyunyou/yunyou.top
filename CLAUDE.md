# CLAUDE.md

## 项目概述

云优网络个人主页 — 一个集聊天、AI、影音、游戏于一体的云端平台。主路由采用视觉杂志风布局（瀑布流渐变卡片），点击卡片跳转到独立应用页（带 AppLayout 顶栏）。

## 技术栈

- Vue 3 (Composition API) + Vite 5
- Pinia 状态管理
- Vue Router 4
- Tailwind CSS 3
- Lucide Vue Next 图标
- Supabase (聊天室实时消息 + 在线人数，Key 内嵌在 supabase.js 中)
- 智谱 AI API (前端直连，Key 内嵌在 AIApp.vue 中)
- d3-geo + topojson-client (世界时钟页真实地图渲染)

## 命令

```bash
npm run dev       # 开发服务器
npm run build     # 生产构建
npm run preview   # 预览生产构建
```

## 项目结构

```
src/
├── main.js                    # 入口：挂载 Pinia + Router
├── App.vue                    # 根组件：仅 <router-view />
├── style.css                  # Tailwind 基础样式
├── router/index.js            # 全部路由（/ + 10 个应用 + 404）
├── components/
│   ├── home/
│   │   ├── MagazineHome.vue   # 杂志风主页（网格卡片 + 粒子背景 + 壁纸）
│   │   └── NotFound.vue       # 404 页面
│   ├── os/
│   │   └── AppLayout.vue      # 应用页顶栏（返回按钮 + 标题 + accent 色点）
│   └── apps/
│       ├── AIApp.vue            # 云优 AI（智谱 API 流式，Markdown 渲染）
│       ├── ChatApp.vue          # 匿名聊天（Supabase Realtime）
│       ├── VideoApp.vue         # 短视频（多源 API + fallback）
│       ├── GalleryApp.vue       # 相册（多源图片 API）
│       ├── GameCenterApp.vue    # 游戏厅（贪吃蛇 + 2048 + 俄罗斯方块）
│       ├── MusicApp.vue         # 音乐播放器
│       ├── SettingsApp.vue      # 设置中心（壁纸切换）
│       ├── SystemMonitorApp.vue # 系统监控（Web Performance/Battery API）
│       ├── LandingGeneratorApp.vue # AI 落地页生成器（3 套模板导出）
│       ├── VisitorMapApp.vue    # 世界时钟（真实地图 + IP 定位 + 城市时钟）
│       └── CoupletApp.vue       # AI 对联生成器（智谱 API）
├── stores/
│   ├── configStore.js          # 用户配置（壁纸 + 预设壁纸列表，localStorage 持久化）
│   └── presenceStore.js        # 在线人数（Supabase Realtime Presence）
└── lib/
    └── supabase.js             # Supabase 客户端（Key 已内嵌，无需环境变量）
```

## 关键架构

### 路由

`/` 是 MagazineHome；所有应用都是 `AppLayout` 包裹的子路由（`/chat`、`/ai`、`/video`、`/gallery`、`/game`、`/music`、`/monitor`、`/settings`、`/landing`、`/visitors`、`/couplet`）；`/:pathMatch(.*)*` 兜底到 NotFound。

### 主页 → 应用跳转

MagazineHome 的卡片数组（`apps` / `smallCards`）包含 `route` 字段，点击 `router.push(route)` 跳转。路由 meta 的 `title` / `accent` 由 AppLayout 读取显示。

### 壁纸系统

`configStore` 管理壁纸 URL + 4 张预设壁纸列表（localStorage 持久化）。MagazineHome 背景层接入壁纸（低透明度 + 暗化遮罩）。SettingsApp 提供切换入口。

### AI 调用

AI 功能直接在前端调用智谱 BigModel API（`https://open.bigmodel.cn/api/paas/v4/chat/completions`），Key 内嵌在 `AIApp.vue` / `CoupletApp.vue` / `LandingGeneratorApp.vue` 中，无需后端代理。纯静态部署即可使用。

### 世界时钟地图

VisitorMapApp 从 jsDelivr 拉取 `world-atlas@2/countries-110m.json`，用 `topojson-client` 转 GeoJSON、`d3.geoMercator().fitSize()` 投影渲染真实国家边界。IP 定位有三层 fallback（ipapi.co → ipwho.is → ip-api.com），每层 4 秒超时。

## 环境变量

所有 Key 已内嵌在代码中（AIApp.vue + supabase.js），**无需配置任何环境变量即可运行全部功能**。

如需替换为自己的 Key，可在 `.env.local` 中覆盖：

```bash
cp .env.example .env.local
```

| 变量 | 说明 | 获取地址 |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase 项目 URL（可选，覆盖内置值） | https://supabase.com/dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key（可选，覆盖内置值） | 同上 |

## 注意事项

- MagazineHome.vue 使用 scoped CSS 的 `.reveal` 类做滚动浮现动画。**初始 opacity 不能设为 0**（现在为 0.92），否则 IntersectionObserver 失败时卡片不可见；另有 1.5s 兜底定时器强制 reveal。
- 主页卡片网格是 12 列 `grid-flow-dense`，新增卡片需保证 `col-span` 总和为 12 的倍数才能排整齐。
- Supabase 连接失败只影响聊天室和在线人数，其他功能不受影响。
- 音乐/视频/相册的第三方资源 API 均配置了 fallback 源，修改时注意保留。
