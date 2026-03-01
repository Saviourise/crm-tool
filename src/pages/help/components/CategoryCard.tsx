import { BookOpen, Users, TrendingUp, Mail, BarChart3, Plug, ChevronDown, ChevronUp } from 'lucide-react'
import type React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ArticleAccordion } from './ArticleAccordion'
import type { HelpCategory, HelpArticle } from '../typings'

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Users,
  TrendingUp,
  Mail,
  BarChart3,
  Plug,
}

interface CategoryCardProps {
  category: HelpCategory
  articles: HelpArticle[]
  isExpanded: boolean
  onToggle: () => void
}

export function CategoryCard({ category, articles, isExpanded, onToggle }: CategoryCardProps) {
  const Icon = ICON_MAP[category.icon] ?? BookOpen

  return (
    <div className={cn(
      'border rounded-xl overflow-hidden transition-all',
      isExpanded ? 'shadow-sm' : ''
    )}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm">{category.name}</span>
            <Badge variant="secondary" className="text-xs h-4 px-1.5">
              {category.articleCount}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{category.description}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
        )}
      </button>

      {isExpanded && (
        <div className="px-5 pb-4 border-t bg-muted/10">
          <div className="pt-3">
            <ArticleAccordion articles={articles} />
          </div>
        </div>
      )}
    </div>
  )
}
