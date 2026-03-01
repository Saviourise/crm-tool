import { useState } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { HelpArticle, HelpCategory } from '../typings'
import { HELP_ARTICLES } from '../data'

interface HelpSearchProps {
  articles: HelpArticle[]
  categories: HelpCategory[]
  onResults: (results: HelpArticle[]) => void
  onQueryChange: (searching: boolean) => void
}

export function HelpSearch({ articles, categories, onResults, onQueryChange }: HelpSearchProps) {
  const [query, setQuery] = useState('')
  const [resultCount, setResultCount] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (!value.trim()) {
      onResults([])
      onQueryChange(false)
      setResultCount(0)
      return
    }

    const lower = value.toLowerCase()
    const results = HELP_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(lower) ||
        a.content.toLowerCase().includes(lower)
    )
    setResultCount(results.length)
    onResults(results)
    onQueryChange(true)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search help articles..."
          className="w-full h-12 pl-10 pr-4 text-base rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>
      {query.trim() && (
        <p className="text-sm text-muted-foreground">
          <Badge variant="secondary" className="mr-1.5">{resultCount}</Badge>
          result{resultCount !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  )
}
