<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchArchive } from '../lib/api'
import type { ArchiveGroup } from '../types/blog'

const loading = ref(true)
const archive = ref<ArchiveGroup[]>([])

onMounted(async () => {
  try {
    archive.value = await fetchArchive()
  } catch (error) {
    console.warn('Failed to load archive.', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="rounded-[30px] border border-black/5 bg-white/90 p-8 shadow-soft md:p-10">
    <p class="text-sm uppercase tracking-[0.28em] text-black/45">时间归档</p>
    <h1 class="mt-3 font-display text-5xl">归档</h1>
    <p class="mt-4 text-sm leading-7 text-black/65">按月份回看学习轨迹，快速定位当时的主题与结论。</p>
  </section>

  <section class="mt-8 space-y-6">
    <p v-if="loading" class="text-sm text-black/55">正在加载归档...</p>
    <article v-for="group in archive" :key="group.month" class="rounded-3xl border border-black/5 bg-white/88 p-6 shadow-soft">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-display text-4xl">{{ group.month }}</h2>
        <span class="rounded-full bg-fog px-3 py-1 text-xs text-black/65">{{ group.count }} 篇</span>
      </div>
      <div class="space-y-3">
        <RouterLink
          v-for="post in group.posts"
          :key="post.id"
          :to="`/posts/${post.id}`"
          class="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-black/5 bg-[#f8f4ed] px-4 py-3 transition-colors hover:bg-white"
        >
          <span class="text-sm text-black/75">{{ post.title }}</span>
          <span class="text-xs text-black/45">{{ post.publishedAt }}</span>
        </RouterLink>
      </div>
    </article>
  </section>
</template>

