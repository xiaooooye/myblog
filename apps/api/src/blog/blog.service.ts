import { Injectable, NotFoundException } from '@nestjs/common'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

type PostSummary = {
  id: number
  title: string
  excerpt: string
  category: string
  tags: string[]
  coverImage: string
  readTime: string
  publishedAt: string
}

type PostDetail = PostSummary & {
  content: string
}

type PostDetailResponse = PostDetail & {
  previous: PostSummary | null
  next: PostSummary | null
}

type SiteProfile = {
  name: string
  role: string
  tagline: string
  location: string
  focus: string[]
  stats: Array<{ label: string; value: string }>
}

type ArchiveGroup = {
  month: string
  count: number
  posts: PostSummary[]
}

type TagItem = {
  name: string
  count: number
}

@Injectable()
export class BlogService {
  private readonly profile: SiteProfile = {
    name: 'xiaoyee',
    role: '全栈学习者',
    tagline: '持续记录学习路径、实践过程和每周复盘。',
    location: '广州',
    focus: ['Vue 3', 'NestJS', 'Tailwind CSS'],
    stats: [
      { label: '文章总数', value: '24' },
      { label: '技术专题', value: '5' },
      { label: '更新频率', value: '每周' },
    ],
  }

  getBlogHome() {
    return {
      profile: this.profile,
      posts: this.getPostSummaries(),
    }
  }

  getPosts(search?: string, tag?: string) {
    let posts = this.getPostSummaries()

    if (tag && tag.trim()) {
      const normalizedTag = tag.trim().toLowerCase()
      posts = posts.filter((post) => post.tags.some((item) => item.toLowerCase() === normalizedTag))
    }

    if (search && search.trim()) {
      const keyword = search.trim().toLowerCase()
      posts = posts.filter((post) => {
        const searchTarget = [post.title, post.excerpt, post.category, post.tags.join(' ')].join(' ').toLowerCase()
        return searchTarget.includes(keyword)
      })
    }

    return posts
  }

  getPostById(id: number): PostDetailResponse {
    const posts = this.getPostDetails()
    const index = posts.findIndex((post) => post.id === id)
    if (index === -1) {
      throw new NotFoundException(`Post ${id} not found`)
    }

    const { content, ...currentSummary } = posts[index]
    const previous = index > 0 ? this.toSummary(posts[index - 1]) : null
    const next = index < posts.length - 1 ? this.toSummary(posts[index + 1]) : null

    return {
      ...currentSummary,
      content,
      previous,
      next,
    }
  }

  getArchive(): ArchiveGroup[] {
    const map = new Map<string, PostSummary[]>()
    for (const post of this.getPostSummaries()) {
      const month = post.publishedAt.slice(0, 7)
      if (!map.has(month)) {
        map.set(month, [])
      }
      map.get(month)!.push(post)
    }

    return Array.from(map.entries()).map(([month, posts]) => ({
      month,
      count: posts.length,
      posts,
    }))
  }

  getTags(): TagItem[] {
    const counter = new Map<string, number>()
    for (const post of this.getPostSummaries()) {
      for (const tag of post.tags) {
        counter.set(tag, (counter.get(tag) ?? 0) + 1)
      }
    }

    return Array.from(counter.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }

  getRssXml(siteUrl: string) {
    const baseUrl = siteUrl.replace(/\/$/, '')
    const items = this.getPostSummaries()
      .map(
        (post) => `
    <item>
      <title>${this.escapeXml(post.title)}</title>
      <link>${baseUrl}/posts/${post.id}</link>
      <guid>${baseUrl}/posts/${post.id}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${this.escapeXml(post.excerpt)}</description>
      ${post.tags.map((tag) => `<category>${this.escapeXml(tag)}</category>`).join('')}
    </item>`,
      )
      .join('')

    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>xiaoyee 学习博客</title>
    <link>${baseUrl}</link>
    <description>记录学习路径、实践过程和每周复盘。</description>
    <language>zh-cn</language>${items}
  </channel>
</rss>`
  }

  getSitemapXml(siteUrl: string) {
    const baseUrl = siteUrl.replace(/\/$/, '')
    const staticUrls = ['/', '/posts', '/archive', '/tags', '/about']
    const postUrls = this.getPostSummaries().map((post) => `/posts/${post.id}`)
    const allUrls = [...staticUrls, ...postUrls]

    const body = allUrls
      .map((path) => `<url><loc>${baseUrl}${path}</loc></url>`)
      .join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`
  }

  private getPostSummaries(): PostSummary[] {
    return this.getPostDetails().map((post) => this.toSummary(post))
  }

  private toSummary(post: PostDetail): PostSummary {
    const { content, ...summary } = post
    return summary
  }

  private getPostDetails(): PostDetail[] {
    const postsDir = this.resolvePostsDir()
    const files = readdirSync(postsDir).filter((file) => file.endsWith('.md')).sort()
    const posts = files.map((file) => this.parseMarkdown(readFileSync(resolve(postsDir, file), 'utf8'), file))

    posts.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    this.validatePosts(posts)
    return posts
  }

  private resolvePostsDir() {
    const candidates = [
      resolve(process.cwd(), 'content', 'posts'),
      resolve(process.cwd(), '..', '..', 'content', 'posts'),
      resolve(process.cwd(), '..', 'content', 'posts'),
    ]

    const found = candidates.find((dir) => existsSync(dir))
    if (!found) {
      throw new Error('Posts directory not found. Expected content/posts.')
    }
    return found
  }

  private parseMarkdown(markdown: string, fileName: string): PostDetail {
    const normalized = markdown.replace(/\r\n/g, '\n')
    const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
    if (!frontmatterMatch) {
      throw new Error(`Invalid markdown frontmatter format in ${fileName}.`)
    }

    const [, rawMeta, rawBody] = frontmatterMatch
    const meta = new Map<string, string>()

    for (const line of rawMeta.split('\n')) {
      const separator = line.indexOf(':')
      if (separator === -1) {
        continue
      }
      const key = line.slice(0, separator).trim()
      const value = line.slice(separator + 1).trim()
      meta.set(key, value)
    }

    const id = Number(meta.get('id'))
    const title = meta.get('title') ?? ''
    const excerpt = meta.get('excerpt') ?? ''
    const category = meta.get('category') ?? ''
    const readTime = meta.get('readTime') ?? ''
    const publishedAt = meta.get('publishedAt') ?? ''
    const tags = (meta.get('tags') ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    const coverImage = meta.get('coverImage') ?? ''

    const requiredChecks: Array<[boolean, string]> = [
      [Number.isInteger(id) && id > 0, 'id must be a positive integer'],
      [title.length > 0, 'title is required'],
      [excerpt.length > 0, 'excerpt is required'],
      [category.length > 0, 'category is required'],
      [tags.length > 0, 'tags is required'],
      [coverImage.length > 0, 'coverImage is required'],
      [readTime.length > 0, 'readTime is required'],
      [/^\d{4}-\d{2}-\d{2}$/.test(publishedAt), 'publishedAt must be YYYY-MM-DD'],
      [rawBody.trim().length > 0, 'content body is required'],
    ]

    const failed = requiredChecks.find(([ok]) => !ok)
    if (failed) {
      throw new Error(`Invalid frontmatter in ${fileName}: ${failed[1]}.`)
    }

    return {
      id,
      title,
      excerpt,
      category,
      tags,
      coverImage,
      readTime,
      publishedAt,
      content: rawBody.trim(),
    }
  }

  private validatePosts(posts: PostDetail[]) {
    const ids = new Set<number>()
    for (const post of posts) {
      if (ids.has(post.id)) {
        throw new Error(`Duplicate post id found: ${post.id}.`)
      }
      ids.add(post.id)
    }
  }

  private escapeXml(input: string) {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}
