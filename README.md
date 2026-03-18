# Personal Blog Workspace

一个基于 `Vite + Vue 3 + Tailwind CSS + NestJS` 的个人博客起步项目。

## 项目结构

- `apps/web`: 前端博客首页与展示层
- `apps/api`: 后端 API，提供博客内容与作者信息

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 启动后端

```bash
npm run dev:api
```

3. 启动前端

```bash
npm run dev:web
```

默认情况下：

- 前端: `http://localhost:5173`
- 后端: `http://localhost:3000/api`

如果你想把前端请求改到别的地址，可以在 `apps/web` 下新增 `.env.local`：

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

## 写文章（Markdown）

文章目录：`content/posts/*.md`

每篇文章 frontmatter 示例：

```md
---
id: 6
title: 第 6 周学习记录：标题
excerpt: 这篇文章的摘要
category: 前端
tags: Vue3, 路由, 工程化
coverImage: /covers/cover-1.svg
readTime: 6 分钟
publishedAt: 2026-03-20
---
正文内容...
```

后端会校验上述字段是否完整，并按 `publishedAt` 倒序输出。

## 已提供接口

- `GET /api/blog`
- `GET /api/blog/posts?q=关键词&tag=标签`
- `GET /api/blog/posts/:id`
- `GET /api/blog/archive`
- `GET /api/blog/tags`
- `GET /api/blog/rss.xml`
- `GET /api/blog/sitemap.xml`

## 站点地址配置

生成 RSS 和 sitemap 时使用 `BLOG_SITE_URL`（默认 `http://localhost:5173`）。
在生产环境请设置为你的正式域名。

## Three.js 角色展示

首页已接入 Three.js 场景组件：

- 默认显示内置“Steve 风格”低多边形人物
- 若存在模型文件 `apps/web/public/models/source/steve.fbx`，会自动优先加载该模型（纹理目录为 `apps/web/public/models/textures`）

你也可以替换为自己的 `.glb`，并在 `ThreeHero.vue` 中修改加载路径。
