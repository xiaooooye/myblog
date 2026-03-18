<script setup lang="ts">
import ThreeAmbient from './components/ThreeAmbient.vue'
import ThreeHero from './components/ThreeHero.vue'
</script>

<template>
  <div class="min-h-screen bg-fog text-ink">
    <ThreeAmbient />
    <ThreeHero />
    <div class="pointer-events-none absolute inset-0 z-[2] bg-grid bg-[size:36px_36px] opacity-25"></div>
    <div class="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[420px] bg-[radial-gradient(circle_at_top,rgba(200,127,86,0.18),transparent_62%)]"></div>

    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pt-6 md:px-8 lg:px-10">
      <header class="sticky top-4 z-20 mb-8 rounded-2xl border border-black/5 bg-white/90 px-5 py-4 shadow-soft backdrop-blur">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <RouterLink class="flex items-center gap-3" to="/">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-pine font-semibold text-white">X</span>
            <div>
              <p class="font-display text-2xl leading-none">xiaoyee 博客</p>
              <p class="mt-1 text-xs tracking-[0.2em] text-black/45">LEARNING JOURNAL</p>
            </div>
          </RouterLink>

          <nav class="flex items-center gap-2 text-sm text-black/70">
            <RouterLink class="rounded-full px-4 py-2 transition-colors hover:bg-black/5" active-class="bg-ink text-white hover:bg-ink" to="/" exact-active-class="bg-ink text-white hover:bg-ink">首页</RouterLink>
            <RouterLink class="rounded-full px-4 py-2 transition-colors hover:bg-black/5" active-class="bg-ink text-white hover:bg-ink" to="/posts">文章</RouterLink>
            <RouterLink class="rounded-full px-4 py-2 transition-colors hover:bg-black/5" active-class="bg-ink text-white hover:bg-ink" to="/archive">归档</RouterLink>
            <RouterLink class="rounded-full px-4 py-2 transition-colors hover:bg-black/5" active-class="bg-ink text-white hover:bg-ink" to="/tags">标签</RouterLink>
            <RouterLink class="rounded-full px-4 py-2 transition-colors hover:bg-black/5" active-class="bg-ink text-white hover:bg-ink" to="/about">关于</RouterLink>
          </nav>
        </div>
      </header>

      <main class="flex-1 pb-10">
        <RouterView />
      </main>

      <footer class="mb-6 rounded-3xl border border-black/5 bg-white/80 px-6 py-5 text-sm text-black/55">
        <p>© 2026 xiaoyee · 记录学习过程与实践复盘</p>
        <div class="mt-2 flex flex-wrap gap-3 text-xs text-black/45">
          <a href="http://localhost:3000/api/blog/rss.xml" target="_blank" rel="noreferrer">RSS</a>
          <a href="http://localhost:3000/api/blog/sitemap.xml" target="_blank" rel="noreferrer">Sitemap</a>
        </div>
      </footer>
    </div>
  </div>
</template>
