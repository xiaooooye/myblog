export type PostSummary = {
  id: number
  title: string
  excerpt: string
  category: string
  tags: string[]
  coverImage: string
  readTime: string
  publishedAt: string
}

export type PostDetail = PostSummary & {
  content: string
  previous: PostSummary | null
  next: PostSummary | null
}

export type SiteProfile = {
  name: string
  role: string
  tagline: string
  location: string
  focus: string[]
  stats: Array<{ label: string; value: string }>
}

export type BlogHomeResponse = {
  profile: SiteProfile
  posts: PostSummary[]
}

export type ArchiveGroup = {
  month: string
  count: number
  posts: PostSummary[]
}

export type TagItem = {
  name: string
  count: number
}
