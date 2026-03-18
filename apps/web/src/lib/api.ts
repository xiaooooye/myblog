import type { ArchiveGroup, BlogHomeResponse, PostDetail, PostSummary, TagItem } from '../types/blog'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return (await response.json()) as T
}

export function fetchBlogHome() {
  return request<BlogHomeResponse>('/blog')
}

export function fetchPosts(search?: string, tag?: string) {
  const params = new URLSearchParams()
  if (search && search.trim()) {
    params.set('q', search.trim())
  }
  if (tag && tag.trim()) {
    params.set('tag', tag.trim())
  }
  const query = params.size > 0 ? `?${params.toString()}` : ''
  return request<PostSummary[]>(`/blog/posts${query}`)
}

export function fetchPostById(id: number) {
  return request<PostDetail>(`/blog/posts/${id}`)
}

export function fetchArchive() {
  return request<ArchiveGroup[]>('/blog/archive')
}

export function fetchTags() {
  return request<TagItem[]>('/blog/tags')
}
