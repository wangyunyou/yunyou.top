# 云优 OS 后端配置指南

这个项目目前是一个纯前端项目。聊天室使用 Supabase，云优 AI 通过本地 Vite 服务端代理调用智谱 API，密钥不会打进前端包。

## 环境变量配置

1. 复制 `.env.example` 为 `.env.local`。
2. 填入以下配置：

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
ZHIPU_API_KEY=
```

`ZHIPU_API_KEY` 只被服务端代理读取，如果留空，云优 AI 会返回“服务端未配置 ZHIPU_API_KEY”。

## AI 代理说明

开发环境使用 `npm run dev`，构建后使用 `npm run preview`，两者都会提供 `/api/ai/chat` 代理。正式部署到静态托管平台时，需要把这个代理适配到平台函数服务，例如 Cloudflare Worker、Vercel Function 或 Supabase Edge Function。

## 推荐方案：Supabase（免费且强大）

1.  **注册账号**：访问 [Supabase 官网](https://supabase.com/)。
2.  **创建项目**：新建一个名为 `YunYouOS` 的项目。
3.  **获取 API 密钥**：
    *   进入项目设置 (Project Settings) -> API。
    *   找到 `Project URL` 和 `anon key`。
4.  **创建数据库表**：
    *   在 SQL Editor 中运行以下代码：
    ```sql
    create table messages (
      id bigint primary key generated always as identity,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      username text,
      content text,
      type text
    );

    -- 必须执行以下步骤才能开启实时更新功能：
    
    -- 1. 开启 Realtime 实时监听 (非常重要！)
    alter publication supabase_realtime add table messages;

    -- 2. (可选) 启用 RLS 权限控制 (如果发现发不出消息)
    alter table messages enable row level security;

    -- 3. (可选) 允许任何人查看和发送消息
    create policy "Allow anyone to select" on messages for select using (true);
    create policy "Allow anyone to insert" on messages for insert with check (true);
    ```
5.  **填入环境变量**：将 `Project URL` 和 `anon key` 分别填入 `.env.local` 的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，然后重新运行 `npm run dev`。

聊天室的长度限制、关键词过滤和发送频率限制目前在前端实现，适合演示；正式公开部署时建议把这些规则移到服务端。

---

## 其他备选方案
- **Cloudflare D1**: 如果你想全量使用 Cloudflare 生态。
- **Firebase**: Google 提供的实时数据库。
