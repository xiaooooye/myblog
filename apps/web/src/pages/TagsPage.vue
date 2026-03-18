<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { fetchPosts, fetchTags } from '../lib/api'
import type { PostSummary, TagItem } from '../types/blog'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const tags = ref<TagItem[]>([])
const posts = ref<PostSummary[]>([])
const activeTag = ref(typeof route.query.tag === 'string' ? route.query.tag : '')

const pageTitle = computed(() => (activeTag.value ? `标签：${activeTag.value}` : '全部标签'))

onMounted(async () => {
  await loadAll()
})

async function loadAll() {
  loading.value = true
  try {
    tags.value = await fetchTags()
    posts.value = await fetchPosts(undefined, activeTag.value || undefined)
  } catch (error) {
    console.warn('Failed to load tags page.', error)
  } finally {
    loading.value = false
  }
}

async function selectTag(tag: string) {
  activeTag.value = tag
  await router.push({ path: '/tags', query: tag ? { tag } : {} })
  await loadAll()
}
</script>

<template>
  <section class="rounded-[30px] border border-black/5 bg-white/90 p-8 shadow-soft md:p-10">
    <p class="text-sm uppercase tracking-[0.28em] text-black/45">标签索引</p>
    <h1 class="mt-3 font-display text-5xl">{{ pageTitle }}</h1>
    <p class="mt-4 text-sm leading-7 text-black/65">按标签快速定位学习主题，查看同类问题和实践记录。</p>

    <div class="mt-6 flex flex-wrap gap-2">
      <button
        class="rounded-full px-4 py-2 text-sm transition-colors"
        :class="activeTag === '' ? 'bg-ink text-white' : 'border border-black/10 bg-fog text-black/70 hover:bg-white'"
        @click="selectTag('')"
      >
        全部
      </button>
      <button
        v-for="tag in tags"
        :key="tag.name"
        class="rounded-full px-4 py-2 text-sm transition-colors"
        :class="activeTag === tag.name ? 'bg-ink text-white' : 'border border-black/10 bg-fog text-black/70 hover:bg-white'"
        @click="selectTag(tag.name)"
      >
        {{ tag.name }} ({{ tag.count }})
      </button>
    </div>
  </section>

  <section class="mt-8">
    <p v-if="loading" class="text-sm text-black/55">正在加载标签内容...</p>
    <div v-else-if="posts.length > 0" class="grid gap-4 md:grid-cols-2">
      <article v-for="post in posts" :key="post.id" class="overflow-hidden rounded-3xl border border-black/5 bg-white/90 shadow-soft">
        <img :src="post.coverImage" :alt="post.title" class="h-40 w-full object-cover" />
        <div class="p-5">
          <p class="text-xs text-black/45">{{ post.publishedAt }} · {{ post.readTime }}</p>
          <h2 class="mt-2 font-display text-3xl leading-tight">{{ post.title }}</h2>
          <p class="mt-2 text-sm leading-7 text-black/62">{{ post.excerpt }}</p>
          <RouterLink class="mt-4 inline-flex text-sm font-medium text-black/75 hover:text-clay" :to="`/posts/${post.id}`">阅读全文 →</RouterLink>
        </div>
      </article>
    </div>
    <div v-else class="rounded-2xl border border-black/5 bg-white/80 p-6 text-sm text-black/60">
      该标签下暂时没有文章。
    </div>
  </section>
</template>

