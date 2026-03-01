import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { HelpSearch } from './components/HelpSearch'
import { CategoryCard } from './components/CategoryCard'
import { ContactSupportCard } from './components/ContactSupportCard'
import { HELP_CATEGORIES, HELP_ARTICLES } from './data'
import type { HelpArticle } from './typings'
import { useAuth } from '@/auth/context'
import type { Permission, Feature } from '@/auth/types'

// ─── Category access gates ────────────────────────────────────────────────────

const CATEGORY_GATES: Record<string, { planRequired?: Feature; permission?: Permission }> = {
  'getting-started': {},
  'contacts':        {},
  'pipeline':        { planRequired: 'pipeline' },
  'campaigns':       { planRequired: 'marketing' },
  'reporting':       { planRequired: 'reports' },
  'integrations':    { permission: 'settings.integrations' },
}

// ─── Search results component ─────────────────────────────────────────────────

function SearchResults({
  results,
  categories,
}: {
  results: HelpArticle[]
  categories: typeof HELP_CATEGORIES
}) {
  if (results.length === 0) {
    return <p className="text-muted-foreground text-sm">No articles found.</p>
  }
  return (
    <div className="space-y-2">
      {results.map((article) => {
        const cat = categories.find((c) => c.id === article.categoryId)
        return (
          <div
            key={article.id}
            className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">{cat?.name}</Badge>
            </div>
            <p className="font-medium text-sm">{article.title}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.content}</p>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Help() {
  const { can, hasPlan } = useAuth()
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Filter categories the user has access to
  const visibleCategories = useMemo(() => {
    return HELP_CATEGORIES.filter((cat) => {
      const gate = CATEGORY_GATES[cat.id] ?? {}
      if (gate.planRequired && !hasPlan(gate.planRequired)) return false
      if (gate.permission && !can(gate.permission)) return false
      return true
    })
  }, [can, hasPlan])

  // Only expose articles from accessible categories to search
  const visibleArticles = useMemo(() => {
    const visibleIds = new Set(visibleCategories.map((c) => c.id))
    return HELP_ARTICLES.filter((a) => visibleIds.has(a.categoryId))
  }, [visibleCategories])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground mt-1">Find answers, guides, and support resources.</p>
      </div>

      {/* Search — scoped to articles the user can access */}
      <HelpSearch
        articles={visibleArticles}
        categories={visibleCategories}
        onResults={setSearchResults}
        onQueryChange={setIsSearching}
      />

      {/* Search results or category grid */}
      {isSearching ? (
        <SearchResults results={searchResults} categories={visibleCategories} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              articles={visibleArticles.filter((a) => a.categoryId === cat.id)}
              isExpanded={expandedCategory === cat.id}
              onToggle={() =>
                setExpandedCategory(expandedCategory === cat.id ? null : cat.id)
              }
            />
          ))}
        </div>
      )}

      <ContactSupportCard />
    </div>
  )
}
