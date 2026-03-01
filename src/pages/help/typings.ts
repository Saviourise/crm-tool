export interface HelpArticle {
  id: string
  title: string
  content: string
  categoryId: string
}

export interface HelpCategory {
  id: string
  name: string
  description: string
  icon: string // lucide icon name
  articleCount: number
}
