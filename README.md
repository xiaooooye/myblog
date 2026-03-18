# Personal Blog Workspace

基于 `Vite + Vue 3 + Tailwind CSS + NestJS` 的个人技术博客项目。

## 线上地址

- 博客首页: `http://141.11.87.249`
- 博客接口: `http://141.11.87.249/api`

## 项目结构

- `apps/web`: 前端博客页面与展示层
- `apps/api`: 后端 API，提供博客内容和作者信息
- `content/posts`: Markdown 文章内容

## 本地开发

安装依赖：

```bash
npm install
```

启动后端：

```bash
npm run dev:api
```

启动前端：

```bash
npm run dev:web
```

默认本地地址：

- 前端: `http://localhost:5173`
- 后端: `http://localhost:3000/api`

如果你需要显式指定前端请求地址，可以在 `apps/web/.env.local` 中配置：

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

## 文章写法

文章目录：

```text
content/posts/*.md
```

Frontmatter 示例：

```md
---
id: 6
title: 第 6 周学习记录：文章标题
excerpt: 这篇文章的摘要
category: 前端
tags: Vue3, 路由, 工程化
coverImage: /covers/cover-1.svg
readTime: 6 分钟
publishedAt: 2026-03-20
---

## 背景

这里写文章正文。
```

要求：

- `id` 必须唯一
- `publishedAt` 格式必须为 `YYYY-MM-DD`
- `tags` 使用英文逗号分隔

## 已提供接口

- `GET /api/blog`
- `GET /api/blog/posts?q=关键词&tag=标签`
- `GET /api/blog/posts/:id`
- `GET /api/blog/archive`
- `GET /api/blog/tags`
- `GET /api/blog/rss.xml`
- `GET /api/blog/sitemap.xml`

## Three.js 展示

首页已接入 Three.js 视觉组件：

- 右下角角色展示组件
- 左右两侧氛围动效组件

如果需要替换模型，可修改：

- `apps/web/public/models/source/`
- `apps/web/public/models/textures/`
- `apps/web/src/components/ThreeHero.vue`
