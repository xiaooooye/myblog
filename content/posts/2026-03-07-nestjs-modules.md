---
id: 3
title: 第 3 周学习记录：NestJS 内容接口模块拆分
excerpt: 记录文章、标签、作者三个模块怎么拆，为什么这样拆，以及后续接数据库时的扩展点。
category: 后端
tags: NestJS, API, 模块化
coverImage: /covers/cover-3.svg
readTime: 9 分钟
publishedAt: 2026-03-07
---
我把博客内容接口分成了三类：首页聚合数据、文章列表数据、文章详情数据。虽然现在数据量不大，但这种拆法可以避免后续字段越来越乱。

## 接口分层策略

在 NestJS 中，Controller 只负责路由和参数，Service 负责实际业务数据组织。这样后续接入 Prisma 或其他数据库时，替换成本最低。

### 一个简单的 Controller 例子

```ts
@Get('posts/:id')
getPostById(@Param('id', ParseIntPipe) id: number) {
  return this.blogService.getPostById(id)
}
```

这周的结论是：小项目也要保留清晰边界。边界清晰的项目会更容易扩展，也更容易协作。
