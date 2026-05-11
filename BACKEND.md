# 云优 OS 后端配置指南

这个项目目前是一个纯前端项目。如果你想激活 **匿名聊天室 (ChatApp)** 的真实联网功能，请按照以下步骤操作：

## 推荐方案：Supabase (免费且强大)

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
5.  **联系 Antigravity**：把 URL 和 Key 告诉我，我帮你完成最后一步的代码对接。

---

## 其他备选方案
- **Cloudflare D1**: 如果你想全量使用 Cloudflare 生态。
- **Firebase**: Google 提供的实时数据库。
