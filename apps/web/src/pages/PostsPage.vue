<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { fetchPosts } from '../lib/api'
import type { PostSummary } from '../types/blog'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const posts = ref<PostSummary[]>([])
const activeCategory = ref('全部')
const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')
const activeTag = ref(typeof route.query.tag === 'string' ? route.query.tag : '')

const categories = computed(() => {
  const set = new Set(posts.value.map((post) => post.category))
  return ['全部', ...set]
})

const filteredPosts = computed(() => {
  if (activeCategory.value === '全部') {
    return posts.value
  }
  return posts.value.filter((post) => post.category === activeCategory.value)
})

onMounted(async () => {
  await loadPosts()
})

watch(
  () => route.query.q,
  async (query) => {
    const nextKeyword = typeof query === 'string' ? query : ''
    if (nextKeyword !== keyword.value) {
      keyword.value = nextKeyword
      await loadPosts()
    }
  },
)

watch(
  () => route.query.tag,
  async (tag) => {
    const nextTag = typeof tag === 'string' ? tag : ''
    if (nextTag !== activeTag.value) {
      activeTag.value = nextTag
      await loadPosts()
    }
  },
)

async function loadPosts() {
  loading.value = true
  try {
    posts.value = await fetchPosts(keyword.value, activeTag.value)
  } catch (error) {
    console.warn('Failed to load posts.', error)
  } finally {
    loading.value = false
  }
}

async function onSearch() {
  const q = keyword.value.trim()
  const query: Record<string, string> = {}
  if (q) {
    query.q = q
  }
  if (activeTag.value) {
    query.tag = activeTag.value
  }
  await router.push({ path: '/posts', query })
}
</script>

<template>
  <section class="rounded-[30px] border border-black/5 bg-white/90 p-8 shadow-soft md:p-10">
    <p class="text-sm uppercase tracking-[0.28em] text-black/45">文章列表</p>
    <h1 class="mt-3 font-display text-5xl">学习文章</h1>
    <p class="mt-4 text-sm leading-7 text-black/65">按分类浏览最近的学习记录、实战复盘和踩坑总结。</p>
    <p v-if="activeTag" class="mt-3 text-xs text-black/50">当前标签过滤：#{{ activeTag }}</p>

    <form class="mt-6 flex flex-wrap items-center gap-3" @submit.prevent="onSearch">
      <input
        v-model="keyword"
        type="search"
        class="min-w-[240px] flex-1 rounded-full border border-black/10 bg-fog px-4 py-2 text-sm outline-none ring-0 placeholder:text-black/35 focus:border-black/25"
        placeholder="搜索标题、摘要或标签"
      />
      <button class="rounded-full bg-ink px-5 py-2 text-sm text-white transition-colors hover:bg-black/80" type="submit">搜索</button>
    </form>

    <div class="mt-6 flex flex-wrap gap-2">
      <button
        v-for="category in categories"
        :key="category"
        class="rounded-full px-4 py-2 text-sm transition-colors"
        :class="activeCategory === category ? 'bg-ink text-white' : 'border border-black/10 bg-fog text-black/70 hover:bg-white'"
        @click="activeCategory = category"
      >
        {{ category }}
      </button>
    </div>
  </section>

  <section class="mt-8">
    <p v-if="loading" class="text-sm text-black/50">正在加载文章...</p>
    <div v-else-if="filteredPosts.length > 0" class="space-y-4">
      <article v-for="post in filteredPosts" :key="post.id" class="overflow-hidden rounded-3xl border border-black/5 bg-white/88 shadow-soft">
        <img :src="post.coverImage" :alt="post.title" class="h-44 w-full object-cover" />
        <div class="p-6">
        <div class="flex flex-wrap items-center gap-3 text-sm text-black/45">
          <span>{{ post.category }}</span>
          <span class="h-1 w-1 rounded-full bg-black/20"></span>
          <span>{{ post.readTime }}</span>
          <span class="h-1 w-1 rounded-full bg-black/20"></span>
          <span>{{ post.publishedAt }}</span>
        </div>
        <h2 class="mt-4 font-display text-4xl leading-tight">{{ post.title }}</h2>
        <p class="mt-3 text-sm leading-7 text-black/62">{{ post.excerpt }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="tag in post.tags"
            :key="tag"
            class="rounded-full bg-fog px-3 py-1 text-xs text-black/60 transition-colors hover:bg-white"
            type="button"
            @click="activeTag = tag; onSearch()"
          >
            #{{ tag }}
          </button>
        </div>
        <RouterLink class="mt-5 inline-flex text-sm font-medium text-black/75 transition-colors hover:text-clay" :to="`/posts/${post.id}`">阅读全文 →</RouterLink>
        </div>
      </article>
    </div>
    <div v-else class="rounded-2xl border border-black/5 bg-white/80 p-6 text-sm text-black/60">
      没有找到匹配的文章，试试更短的关键词或切换分类。
    </div>
  </section>
</template>
