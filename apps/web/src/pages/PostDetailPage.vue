<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { fetchPostById } from '../lib/api'
import type { PostDetail } from '../types/blog'

type TocItem = {
  id: string
  text: string
  level: 2 | 3
}

const route = useRoute()
const loading = ref(true)
const error = ref(false)
const post = ref<PostDetail | null>(null)

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('typescript', typescript)

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
  highlight(code: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      return `<pre><code class="hljs language-${lang}">${hljs.highlight(code, { language: lang }).value}</code></pre>`
    }
    return `<pre><code class="hljs">${escapeHtml(code)}</code></pre>`
  },
})

const postId = computed(() => Number(route.params.id))

const markdownResult = computed(() => {
  if (!post.value) {
    return { html: '', toc: [] as TocItem[] }
  }

  const slugCount = new Map<string, number>()
  const toc: TocItem[] = []
  const tokens = markdown.parse(post.value.content, {})

  for (let i = 0; i < tokens.length; i += 1) {
    const current = tokens[i]
    const inline = tokens[i + 1]
    if (current.type !== 'heading_open' || (current.tag !== 'h2' && current.tag !== 'h3') || inline?.type !== 'inline') {
      continue
    }

    const text = inline.content.trim()
    const baseId = slugify(text)
    const count = slugCount.get(baseId) ?? 0
    slugCount.set(baseId, count + 1)
    const id = count === 0 ? baseId : `${baseId}-${count}`
    current.attrSet('id', id)
    toc.push({ id, text, level: current.tag === 'h2' ? 2 : 3 })
  }

  return {
    html: markdown.renderer.render(tokens, markdown.options, {}),
    toc,
  }
})

watch(
  () => route.params.id,
  async () => {
    await loadPost()
  },
  { immediate: true },
)

async function loadPost() {
  loading.value = true
  error.value = false
  post.value = null

  if (!Number.isInteger(postId.value)) {
    error.value = true
    loading.value = false
    return
  }

  try {
    post.value = await fetchPostById(postId.value)
  } catch (e) {
    console.warn('Failed to load post detail.', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

function slugify(input: string) {
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return normalized || 'section'
}
</script>

<template>
  <section v-if="loading" class="rounded-[30px] border border-black/5 bg-white/90 p-8 shadow-soft">
    <p class="text-sm text-black/55">正在加载文章内容...</p>
  </section>

  <section v-else-if="error || !post" class="rounded-[30px] border border-black/5 bg-white/90 p-8 shadow-soft">
    <h1 class="font-display text-4xl">文章不存在</h1>
    <p class="mt-4 text-sm text-black/60">你访问的文章可能已删除，或者链接不正确。</p>
    <RouterLink class="mt-6 inline-flex rounded-full bg-ink px-4 py-2 text-sm text-white" to="/posts">返回文章列表</RouterLink>
  </section>

  <article v-else class="grid gap-6 xl:grid-cols-[1.55fr_0.45fr]">
    <section class="rounded-[30px] border border-black/5 bg-white/92 p-8 shadow-soft md:p-10">
      <img :src="post.coverImage" :alt="post.title" class="mb-6 h-64 w-full rounded-2xl object-cover" />
      <div class="flex flex-wrap items-center gap-3 text-sm text-black/45">
        <span>{{ post.category }}</span>
        <span class="h-1 w-1 rounded-full bg-black/20"></span>
        <span>{{ post.readTime }}</span>
        <span class="h-1 w-1 rounded-full bg-black/20"></span>
        <span>{{ post.publishedAt }}</span>
      </div>

      <h1 class="mt-4 max-w-4xl font-display text-5xl leading-tight">{{ post.title }}</h1>
      <p class="mt-4 max-w-4xl text-base leading-8 text-black/68">{{ post.excerpt }}</p>

      <div class="mt-4 flex flex-wrap gap-2">
        <span v-for="tag in post.tags" :key="tag" class="rounded-full bg-fog px-3 py-1 text-xs text-black/65">#{{ tag }}</span>
      </div>

      <div class="article-content mt-8" v-html="markdownResult.html"></div>

      <div class="mt-8 flex flex-wrap gap-2">
        <RouterLink class="inline-flex rounded-full border border-black/10 bg-fog px-4 py-2 text-sm text-black/80 transition-colors hover:bg-white" to="/posts">
          返回文章列表
        </RouterLink>
        <RouterLink
          v-if="post.previous"
          class="inline-flex rounded-full border border-black/10 bg-fog px-4 py-2 text-sm text-black/80 transition-colors hover:bg-white"
          :to="`/posts/${post.previous.id}`"
        >
          上一篇
        </RouterLink>
        <RouterLink
          v-if="post.next"
          class="inline-flex rounded-full border border-black/10 bg-fog px-4 py-2 text-sm text-black/80 transition-colors hover:bg-white"
          :to="`/posts/${post.next.id}`"
        >
          下一篇
        </RouterLink>
      </div>
    </section>

    <aside class="h-fit rounded-[24px] border border-black/5 bg-white/88 p-5 shadow-soft xl:sticky xl:top-28">
      <p class="text-xs uppercase tracking-[0.24em] text-black/45">文章目录</p>
      <ul class="mt-3 space-y-2">
        <li v-for="item in markdownResult.toc" :key="item.id">
          <a
            class="block text-sm text-black/70 transition-colors hover:text-clay"
            :class="item.level === 3 ? 'pl-3 text-[13px]' : ''"
            :href="`#${item.id}`"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </aside>
  </article>
</template>
