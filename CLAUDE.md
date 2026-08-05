# CLAUDE.md

## 项目概述

云优网络个人主页 — 一个集聊天、AI、影音、游戏于一体的云端平台。主路由采用视觉杂志风布局（瀑布流渐变卡片），点卡片弹窗打开应用。

## 技术栈

- Vue 3 (Composition API) + Vite 5
- Pinia 状态管理
- Vue Router 4
- Tailwind CSS 3
- Lucide Vue Next 图标
- Supabase (聊天室实时消息 + 在线人数)
- 智谱 AI API (Vite 代理 `/api/ai/chat`，密钥不进前端包)

## 命令

```bash
npm run dev       # 开发服务器（含 AI 代理）
npm run build     # 生产构建
npm run preview   # 预览生产构建（含 AI 代理）
```

## 项目结构

```
src/
├── main.js                    # 入口：挂载 Pinia + Router
├── App.vue                    # 根组件：仅 <router-view />
├── style.css                  # Tailwind 基础样式
├── router/index.js            # 路由：/ → MagazineHome, /chat → ChatApp
├── components/
│   ├── home/
│   │   └── MagazineHome.vue   # 杂志风主页（杂志网格 + 背景光晕 + 壁纸）
│   ├── os/
│   │   └── Window.vue          # 窗口组件（拖拽、最小化、关闭、最大宽度 520px）
│   └── apps/
│       ├── AIApp.vue           # 云优 AI（智谱 API，Markdown 渲染）
│       ├── ChatApp.vue         # 匿名聊天（Supabase Realtime）
│       ├── VideoApp.vue        # 短视频瀑布流
│       ├── GalleryApp.vue      # 相册
│       ├── GameCenterApp.vue   # 游戏厅（俄罗斯方块等）
│       ├── MusicApp.vue        # 音乐播放器
│       ├── SettingsApp.vue     # 设置中心（壁纸切换）
│       └── SystemMonitorApp.vue # 系统监控
├── stores/
│   ├── windowStore.js          # 窗口管理（打开/关闭/聚焦/Z-Index）
│   ├── configStore.js          # 用户配置（壁纸 + 预设壁纸列表）
│   └── presenceStore.js        # 在线人数（Supabase Realtime Presence）
└── lib/
    ├── appRegistry.js          # 应用注册表（defineAsyncComponent 懒加载）
    └── supabase.js             # Supabase 客户端（需配置环境变量）
```

## 关键架构

### 路由（仅 2 条）

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | MagazineHome.vue | 杂志风主页，fullScreen |
| `/chat` | ChatApp.vue | 独立聊天页，fullScreen |

没有布局嵌套，`App.vue` 就是纯 `<router-view />`。

### 窗口系统

`windowStore` 管理应用弹窗，`MagazineHome.vue` 点卡片调用 `windowStore.openWindow()` 打开。`Window.vue` 支持：
- 拖拽（`@vueuse/core` 的 `useDraggable`）
- 最小化/关闭按钮
- 最大宽度 520px，超过则缩放
- 多层 Z-Index（聚焦提升）

应用通过 `appRegistry.js` 注册为异步组件，按需加载。MagazineHome 通过 `app.id` 查找 `appRegistry[app.component]` 来打开窗口。

### 壁纸系统

`configStore` 管理壁纸 URL + 4 张预设壁纸列表。`MagazineHome.vue` 背景层接入壁纸（30% 不透明度 + 轻微模糊 + 暗化遮罩）。`SettingsApp.vue` 提供切换入口。

### AI 代理

Vite 配置了自定义插件 `aiProxyPlugin`，拦截 `/api/ai/chat` 请求转发到智谱 BigModel API。密钥从环境变量 `ZHIPU_API_KEY` 读取，不会打包到前端。开发和生产预览环境都支持。

## 环境变量

在 `.env.local` 中配置：

```bash
VITE_SUPABASE_URL=         # Supabase 项目 URL
VITE_SUPABASE_ANON_KEY=    # Supabase anon key
ZHIPU_API_KEY=             # 智谱 API 密钥（服务端代理用）
```

## 注意事项

- MagazineHome.vue 使用 scoped CSS 的 `.reveal` 类做滚动浮现动画。修改时注意初始状态不能为 `opacity: 0`，否则 IntersectionObserver 失败时卡片不可见。
- Window.vue 的根元素需要 `pointer-events-auto`，因为 MagazineHome 的窗口容器设置了 `pointer-events-none`。
- Supabase 连接失败（如缺环境变量）只影响聊天室和在线人数，其他功能不受影响。
- 正式部署到大屏时，窗口最大宽度 520px 可能需要调整。
