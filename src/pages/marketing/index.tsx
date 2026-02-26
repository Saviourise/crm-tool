import { useState } from 'react'
import { Megaphone, Mail, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarketingStats } from './components/MarketingStats'
import { CampaignList } from './components/CampaignList'
import { TemplateGallery } from './components/TemplateGallery'
import { AIHub } from './components/AIHub'
import { MOCK_CAMPAIGNS, MOCK_TEMPLATES } from './data'

type MarketingTab = 'campaigns' | 'templates' | 'ai-hub'

const TABS: { value: MarketingTab; label: string; icon: React.ElementType }[] = [
  { value: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { value: 'templates', label: 'Templates', icon: Mail },
  { value: 'ai-hub', label: 'AI Hub', icon: Sparkles },
]

export default function Marketing() {
  const [activeTab, setActiveTab] = useState<MarketingTab>('campaigns')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground mt-1">
            Create campaigns, manage templates, and generate content with AI.
          </p>
        </div>
      </div>

      {/* Stats */}
      <MarketingStats campaigns={MOCK_CAMPAIGNS} />

      {/* Tab nav */}
      <div className="flex gap-1 border-b">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === value
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {value === 'ai-hub' && (
              <span className="ml-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary leading-none">
                AI
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'campaigns' && (
        <CampaignList campaigns={MOCK_CAMPAIGNS} />
      )}

      {activeTab === 'templates' && (
        <div className="space-y-4">
          <TemplateGallery templates={MOCK_TEMPLATES} />
        </div>
      )}

      {activeTab === 'ai-hub' && (
        <AIHub />
      )}
    </div>
  )
}
