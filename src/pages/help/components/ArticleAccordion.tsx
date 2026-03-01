import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HelpArticle } from '../typings'

interface ArticleAccordionProps {
  articles: HelpArticle[]
}

export function ArticleAccordion({ articles }: ArticleAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="space-y-1">
      {articles.map((article) => {
        const isOpen = openId === article.id
        return (
          <div key={article.id} className="border rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : article.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <span>{article.title}</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
              )}
            </button>
            {isOpen && (
              <div className="px-4 pb-3 pt-1 text-sm text-muted-foreground border-t bg-muted/20">
                {article.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
