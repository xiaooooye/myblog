declare module 'markdown-it' {
  type Token = {
    type: string
    tag: string
    content: string
    attrSet(name: string, value: string): void
  }

  type MarkdownItOptions = {
    html?: boolean
    linkify?: boolean
    breaks?: boolean
    highlight?: (code: string, lang: string) => string
  }

  export default class MarkdownIt {
    constructor(options?: MarkdownItOptions)
    utils: { escapeHtml: (input: string) => string }
    options: unknown
    renderer: {
      render: (tokens: Token[], options: unknown, env: unknown) => string
    }
    parse(content: string, env: unknown): Token[]
  }
}
