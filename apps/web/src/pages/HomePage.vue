<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchBlogHome } from '../lib/api'
import type { BlogHomeResponse, PostSummary, SiteProfile } from '../types/blog'

const fallbackData: BlogHomeResponse = {
  profile: {
    name: 'xiaoyee',
    role: '全栈学习者',
    tagline: '记录每天学到的新知识，也记录踩坑和修正过程。',
    location: '广州',
    focus: ['Vue 3', 'NestJS', 'Tailwind CSS'],
    stats: [
      { label: '文章总数', value: '24' },
      { label: '技术专题', value: '5' },
      { label: '更新频率', value: '每周' },
    ],
  },
  posts: [],
}

const loading = ref(true)
const profile = ref<SiteProfile>(fallbackData.profile)
const posts = ref<PostSummary[]>(fallbackData.posts)

const featuredPost = computed(() => posts.value[0])
const latestPosts = computed(() => posts.value.slice(1, 5))

onMounted(async () => {
  try {
    const data = await fetchBlogHome()
    profile.value = data.profile
    posts.value = data.posts
  } catch (error) {
    console.warn('Using fallback home data.', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
    <article class="rounded-[30px] border border-black/5 bg-white/90 p-8 shadow-soft backdrop-blur md:p-10">
      <p class="text-sm uppercase tracking-[0.28em] text-black/40">学习记录博客</p>
      <h1 class="mt-4 max-w-3xl font-display text-5xl leading-[1.04] md:text-6xl">
        把每天学习过程
        <span class="text-clay">清晰记录下来</span>
      </h1>
      <p class="mt-6 max-w-2xl text-base leading-8 text-black/65">
        这里主要记录前端、后端和工程化学习笔记。每篇文章都会写清楚背景、过程、结果和复盘，方便自己回看，也方便别人跟学。
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <span v-for="focus in profile.focus" :key="focus" class="rounded-full border border-black/10 bg-fog px-4 py-2 text-sm text-black/70">
          {{ focus }}
        </span>
      </div>
      <div class="mt-8 grid gap-3 sm:grid-cols-3">
        <div v-for="stat in profile.stats" :key="stat.label" class="rounded-2xl border border-black/5 bg-[#f7f3eb] px-4 py-3">
          <p class="text-xs text-black/45">{{ stat.label }}</p>
          <p class="mt-2 font-display text-3xl">{{ stat.value }}</p>
        </div>
      </div>
    </article>

    <aside class="space-y-6">
      <div class="rounded-[30px] bg-pine p-7 text-white shadow-soft">
        <p class="text-sm uppercase tracking-[0.28em] text-white/65">关于作者</p>
        <h2 class="mt-4 font-display text-3xl">{{ profile.name }}</h2>
        <p class="mt-2 text-white/80">{{ profile.role }}</p>
        <p class="mt-5 text-sm leading-7 text-white/80">{{ profile.tagline }}</p>
        <p class="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-sm">常驻：{{ profile.location }}</p>
      </div>

      <div class="rounded-[30px] border border-black/5 bg-white/90 p-7 shadow-soft">
        <p class="text-sm uppercase tracking-[0.28em] text-black/45">阅读入口</p>
        <h3 class="mt-3 font-display text-3xl">从文章开始</h3>
        <p class="mt-3 text-sm leading-7 text-black/65">所有内容都按时间线更新，可从文章列表快速浏览，再进入详情页深入阅读。</p>
        <div class="mt-6 flex flex-wrap gap-2">
          <RouterLink class="inline-flex rounded-full bg-ink px-5 py-2 text-sm text-white transition-colors hover:bg-black/80" to="/posts">
            查看全部文章
          </RouterLink>
          <RouterLink class="inline-flex rounded-full border border-black/10 bg-fog px-5 py-2 text-sm text-black/75 transition-colors hover:bg-white" to="/archive">
            查看归档
          </RouterLink>
        </div>
      </div>
    </aside>
  </section>

  <section v-if="featuredPost" class="mt-8 rounded-[32px] border border-black/5 bg-[#1f1a17] p-8 text-white shadow-soft md:p-10">
    <img :src="featuredPost.coverImage" :alt="featuredPost.title" class="mb-6 h-56 w-full rounded-2xl object-cover opacity-90" />
    <p class="text-sm uppercase tracking-[0.28em] text-white/60">本周重点学习</p>
    <div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
      <span>{{ featuredPost.category }}</span>
      <span class="h-1 w-1 rounded-full bg-white/30"></span>
      <span>{{ featuredPost.readTime }}</span>
      <span class="h-1 w-1 rounded-full bg-white/30"></span>
      <span>{{ featuredPost.publishedAt }}</span>
    </div>
    <h2 class="mt-4 max-w-4xl font-display text-4xl leading-tight md:text-5xl">{{ featuredPost.title }}</h2>
    <p class="mt-5 max-w-4xl text-base leading-8 text-white/75">{{ featuredPost.excerpt }}</p>
    <RouterLink class="mt-7 inline-flex rounded-full border border-white/25 px-4 py-2 text-sm text-white/90 transition-colors hover:bg-white/10" :to="`/posts/${featuredPost.id}`">
      阅读全文
    </RouterLink>
  </section>

  <section class="mt-10">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <h2 class="font-display text-4xl">最近更新</h2>
      <p class="text-sm text-black/45">{{ loading ? '正在同步内容...' : '内容已同步' }}</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <article
        v-for="post in latestPosts"
        :key="post.id"
        class="group overflow-hidden rounded-3xl border border-black/5 bg-white/88 shadow-soft transition-transform duration-300 hover:-translate-y-1"
      >
        <img :src="post.coverImage" :alt="post.title" class="h-44 w-full object-cover" />
        <div class="p-6">
          <div class="flex flex-wrap items-center gap-3 text-sm text-black/45">
            <span>{{ post.category }}</span>
            <span class="h-1 w-1 rounded-full bg-black/20"></span>
            <span>{{ post.readTime }}</span>
            <span class="h-1 w-1 rounded-full bg-black/20"></span>
            <span>{{ post.publishedAt }}</span>
          </div>
          <h3 class="mt-4 font-display text-3xl leading-tight transition-colors duration-300 group-hover:text-clay">{{ post.title }}</h3>
          <p class="mt-3 text-sm leading-7 text-black/62">{{ post.excerpt }}</p>
          <RouterLink class="mt-5 inline-flex text-sm font-medium text-black/75 transition-colors hover:text-clay" :to="`/posts/${post.id}`">阅读全文 →</RouterLink>
        </div>
      </article>
    </div>
  </section>
</template>
