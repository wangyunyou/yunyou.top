# Changelog

## 2025-08-05

### Added
- 全新杂志风首页 `MagazineHome.vue`：12 列非对称网格布局，hero 封面卡 + 8 张应用渐变卡 + 每日一句引言卡 + 底部小卡
- 背景彩色光晕漂浮动画 + 滚动卡片浮现动效
- 壁纸系统接入新主页背景（暗化叠加处理）
- `CLAUDE.md` 项目开发指南
- `README.md` + `CHANGELOG.md`

### Removed
- `Desktop.vue`、`DesktopIcon.vue`、`ContextMenu.vue`、`Taskbar.vue` — 旧桌面模块
- `/desktop` 路由
- `App.vue` 精简为纯 `<router-view />`

### Fixed
- `presenceStore.initPresence()` 重复初始化调用
- 杂志页 reveal 入场动画在部分情况下卡片不可见的问题
- 云优 AI 通讯中断：未配置 ZHIPU_API_KEY 时前端解析空响应体报错

### Changed
- `Window.vue` 根元素增加 `pointer-events-auto`
- 页面标题更新为「云优」
