import { useState } from 'react'
import { Sparkles, Copy, RotateCcw, ChevronDown, ChevronUp, Clock, Mail, Megaphone, Target } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { AIGeneration, AIContentType } from '../typings'
import { MOCK_GENERATIONS } from '../data'
import { RequireFeature } from '@/auth/guards'

// ─── Config ───────────────────────────────────────────────────────────────────

const CONTENT_TYPES: { value: AIContentType; label: string; icon: React.ElementType; description: string }[] = [
  {
    value: 'email',
    label: 'Email Copy',
    icon: Mail,
    description: 'Subject lines, body copy, and CTAs for email campaigns',
  },
  {
    value: 'social',
    label: 'Social Post',
    icon: Megaphone,
    description: 'Engaging posts for LinkedIn, Twitter, and other platforms',
  },
  {
    value: 'ad-copy',
    label: 'Ad Copy',
    icon: Target,
    description: 'Headlines and descriptions for paid ads and landing pages',
  },
]

const TONES = ['professional', 'friendly', 'persuasive', 'urgent', 'empathetic', 'concise']

const PROMPTS_BY_TYPE: Record<AIContentType, string[]> = {
  email: [
    'Write a follow-up email after a product demo for B2B SaaS',
    'Create a re-engagement email for contacts inactive for 90 days',
    'Write a cold outreach email introducing our CRM platform',
    'Craft a webinar invitation email for sales professionals',
  ],
  social: [
    'LinkedIn post about improving sales team productivity with CRM',
    'Twitter thread on common sales pipeline mistakes and how to fix them',
    'LinkedIn post celebrating a customer success milestone',
    'Social post announcing a new product feature launch',
  ],
  'ad-copy': [
    'Google ad headline for a CRM software targeting SMBs',
    'Facebook ad copy for a free CRM trial offer',
    'LinkedIn ad for an enterprise sales automation platform',
    'Retargeting ad for visitors who viewed the pricing page',
  ],
}

// Pre-written mock outputs to simulate AI generation
const MOCK_OUTPUTS: Record<AIContentType, Record<string, string>> = {
  email: {
    default: `Subject: Quick question about {{company}}'s sales process

Hi {{first_name}},

I came across {{company}} recently and noticed you're scaling your sales team — congrats on the growth!

I work with companies at your stage to help them get more out of their pipeline without adding headcount. Most teams we work with cut their admin time by 40% in the first 60 days.

Would it be worth a 15-minute call this week to see if there's a fit?

No pitch, just a conversation.

Best,
{{sender_name}}

P.S. If timing's off, happy to reconnect next quarter — just say the word.`,
  },
  social: {
    default: `Most sales teams track the wrong metrics.

They obsess over calls made and emails sent.

But the number that actually predicts quota attainment?

→ Days to first meaningful conversation.

The faster you get a real dialogue going, the higher your close rate. Period.

Here's what top-performing reps do differently:
• They personalize the first touch (not just the name)
• They lead with insight, not a pitch
• They follow up 5–7 times (most give up after 2)

The tools matter less than the system.

What's the one metric your team tracks that you wish more managers cared about?

#B2BSales #SalesStrategy #RevenueGrowth`,
  },
  'ad-copy': {
    default: `Headline: Close More Deals. Less Admin.

Description: The CRM built for modern sales teams. Automate follow-ups, score leads automatically, and get full pipeline visibility — all in one place. Start free today.

CTA: Start Free Trial

---

Headline: Your Pipeline, Finally Organized

Description: Stop losing deals to spreadsheets. Our AI-powered CRM helps you prioritize the right leads and close faster. Trusted by 500+ sales teams.

CTA: See It In Action

---

Headline: Cut Sales Admin Time by 40%

Description: Automate the tasks your team hates — data entry, follow-up emails, meeting notes. Your reps get more selling time. You get more closed deals.

CTA: Book a Demo`,
  },
}

// ─── History Item ─────────────────────────────────────────────────────────────

function HistoryItem({ gen, onReuse }: { gen: AIGeneration; onReuse: (gen: AIGeneration) => void }) {
  const [expanded, setExpanded] = useState(false)
  const typeCfg = CONTENT_TYPES.find((t) => t.value === gen.type)!
  const TypeIcon = typeCfg.icon

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-1">{gen.prompt}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-xs h-4 px-1.5">{typeCfg.label}</Badge>
            <Badge variant="outline" className="text-xs h-4 px-1.5 capitalize">{gen.tone}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {gen.createdAt}
          </span>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t bg-muted/20">
          <pre className="px-4 py-3 text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed line-clamp-6">
            {gen.output}
          </pre>
          <div className="flex gap-2 px-4 pb-3">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5"
              onClick={() => {
                navigator.clipboard.writeText(gen.output)
                toast.success('Copied to clipboard')
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5"
              onClick={() => onReuse(gen)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reuse
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main AIHub ───────────────────────────────────────────────────────────────

export function AIHub() {
  const [contentType, setContentType] = useState<AIContentType>('email')
  const [tone, setTone] = useState('professional')
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<AIGeneration[]>(MOCK_GENERATIONS)

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first')
      return
    }
    setLoading(true)
    setOutput('')

    // Simulate streaming generation
    setTimeout(() => {
      const mockOutput = MOCK_OUTPUTS[contentType]?.default ?? 'Content generated successfully.'
      setOutput(mockOutput)
      setLoading(false)

      const newGen: AIGeneration = {
        id: Date.now().toString(),
        type: contentType,
        tone,
        prompt: prompt.trim(),
        output: mockOutput,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }
      setHistory((prev) => [newGen, ...prev])
    }, 1400)
  }

  const handleReuse = (gen: AIGeneration) => {
    setContentType(gen.type)
    setTone(gen.tone)
    setPrompt(gen.prompt)
    setOutput(gen.output)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard')
  }

  return (
    <RequireFeature feature="ai-content">
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Left: Input panel ── */}
      <div className="lg:col-span-2 space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Content Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Content type selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Content Type</Label>
              <div className="grid grid-cols-1 gap-2">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setContentType(type.value)
                      setPrompt('')
                      setOutput('')
                    }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                      contentType === type.value
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30 text-muted-foreground'
                    )}
                  >
                    <type.icon className={cn('h-5 w-5 shrink-0', contentType === type.value ? 'text-primary' : 'text-muted-foreground')} />
                    <div>
                      <p className={cn('text-sm font-medium', contentType === type.value && 'text-foreground')}>{type.label}</p>
                      <p className="text-xs text-muted-foreground leading-snug">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tone */}
            <div className="space-y-2">
              <Label htmlFor="tone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prompt</Label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create..."
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
              {/* Quick-fill suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {PROMPTS_BY_TYPE[contentType].slice(0, 2).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="text-xs text-primary hover:text-primary/80 underline underline-offset-2 transition-colors text-left"
                  >
                    {p.length > 48 ? p.slice(0, 48) + '…' : p}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Right: Output + history ── */}
      <div className="lg:col-span-3 space-y-5">
        {/* Output area */}
        <Card className="min-h-[280px]">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base">Generated Content</CardTitle>
            {output && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[100, 90, 80, 95, 70].map((w, i) => (
                  <div key={i} className="h-3 bg-muted rounded" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : output ? (
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-foreground">{output}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Ready to generate</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a type, set your tone, and describe what you need.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Generations</h3>
            <div className="space-y-2">
              {history.map((gen) => (
                <HistoryItem key={gen.id} gen={gen} onReuse={handleReuse} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </RequireFeature>
  )
}
