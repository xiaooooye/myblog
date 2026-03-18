import { Controller, Get, Header, Param, ParseIntPipe, Query } from '@nestjs/common'
import { BlogService } from './blog.service'

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  getBlogData() {
    return this.blogService.getBlogHome()
  }

  @Get('posts')
  getPosts(@Query('q') q?: string, @Query('tag') tag?: string) {
    return this.blogService.getPosts(q, tag)
  }

  @Get('posts/:id')
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.getPostById(id)
  }

  @Get('archive')
  getArchive() {
    return this.blogService.getArchive()
  }

  @Get('tags')
  getTags() {
    return this.blogService.getTags()
  }

  @Get('rss.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  getRss() {
    return this.blogService.getRssXml(process.env.BLOG_SITE_URL ?? 'http://localhost:5173')
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  getSitemap() {
    return this.blogService.getSitemapXml(process.env.BLOG_SITE_URL ?? 'http://localhost:5173')
  }
}
