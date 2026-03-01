import { useState } from 'react'
import { Check, Download, CreditCard, Zap, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

function downloadInvoice(inv: { id: string; date: string; description: string; amount: number; status: string }) {
  const csv = [
    'Invoice ID,Date,Description,Amount,Status',
    `${inv.id},${inv.date},"${inv.description}",$${inv.amount}.00,${inv.status}`,
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${inv.id}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success(`Invoice ${inv.id} downloaded`)
}
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PLANS, INVOICES, PAYMENT_METHOD, USAGE } from '../data'
import { getUsagePercent, getUsageColor, formatNumber } from '../utils'
import type { BillingCycle } from '../typings'
import { cn } from '@/lib/utils'

// ─── Usage bar ─────────────────────────────────────────────────────────────────

function UsageBar({ label, used, limit, unit = '' }: { label: string; used: number; limit: number; unit?: string }) {
  const pct = getUsagePercent(used, limit)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {formatNumber(used)} / {formatNumber(limit)}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getUsageColor(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{pct}% used</p>
    </div>
  )
}

// ─── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  cycle,
  currentMonthlyPrice,
}: {
  plan: (typeof PLANS)[number]
  cycle: BillingCycle
  currentMonthlyPrice: number
}) {
  const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice

  return (
    <div
      className={cn(
        'rounded-xl border p-5 space-y-4 relative flex flex-col',
        plan.isCurrent
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : plan.highlighted
            ? 'border-primary/40 bg-primary/[0.02]'
            : 'border-border'
      )}
    >
      {plan.isCurrent && (
        <Badge className="absolute top-4 right-4 text-xs bg-primary text-primary-foreground">
          Current
        </Badge>
      )}
      {plan.highlighted && !plan.isCurrent && (
        <Badge className="absolute top-4 right-4 text-xs bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800">
          Popular
        </Badge>
      )}

      {/* Name + price */}
      <div>
        <p className="font-semibold text-base">{plan.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{plan.description}</p>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-3xl font-bold">
            {price === 0 ? 'Free' : `$${price}`}
          </span>
          {price > 0 && (
            <span className="text-muted-foreground text-sm">/mo</span>
          )}
        </div>
        {cycle === 'yearly' && price > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">billed annually</p>
        )}
      </div>

      {/* Limits */}
      <div className="text-xs text-muted-foreground space-y-0.5 border-t pt-3">
        <p><span className="font-medium text-foreground">{plan.users}</span></p>
        <p><span className="font-medium text-foreground">{plan.contacts}</span> contacts</p>
        <p><span className="font-medium text-foreground">{plan.emails}</span> emails</p>
      </div>

      {/* Core features */}
      <ul className="space-y-1.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* AI features (if any) */}
      {plan.aiFeatures.length > 0 && (
        <div className="border-t pt-3 space-y-1.5">
          <p className="text-xs font-semibold flex items-center gap-1.5 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI Features
          </p>
          <ul className="space-y-1.5">
            {plan.aiFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs">
                <Sparkles className="h-3 w-3 text-primary/60 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <Button
        size="sm"
        variant={plan.isCurrent ? 'outline' : plan.highlighted ? 'default' : 'outline'}
        className="w-full mt-auto"
        disabled={plan.isCurrent}
        onClick={() => {
          if (plan.monthlyPrice > currentMonthlyPrice) {
            toast.success(`Upgrading to ${plan.name}...`)
          } else {
            toast.info(`Switching to ${plan.name}...`)
          }
        }}
      >
        {plan.isCurrent
          ? 'Current Plan'
          : plan.monthlyPrice > currentMonthlyPrice
            ? 'Upgrade'
            : plan.monthlyPrice === 0
              ? 'Downgrade to Free'
              : 'Downgrade'}
      </Button>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function BillingSection() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  const currentPlan = PLANS.find((p) => p.isCurrent)!

  return (
    <div className="space-y-6">
      {/* Current plan + usage */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription className="mt-1">
                You are on the <strong>{currentPlan.name}</strong> plan.{' '}
                {currentPlan.aiFeatures.length > 0 && 'Includes AI add-ons.'}
              </CardDescription>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {currentPlan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UsageBar label="Team Members" used={USAGE.users.used}    limit={USAGE.users.limit} />
            <UsageBar label="Contacts"     used={USAGE.contacts.used} limit={USAGE.contacts.limit} />
            <UsageBar label="Emails / mo"  used={USAGE.emails.used}   limit={USAGE.emails.limit} />
            <UsageBar label="Storage"      used={USAGE.storage.used}  limit={USAGE.storage.limit} unit=" GB" />
          </div>
          {currentPlan.aiFeatures.length > 0 && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Active AI Add-ons
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentPlan.aiFeatures.map((f) => (
                  <Badge key={f} variant="secondary" className="text-xs">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 pt-2 border-t">
            <Button
              size="sm"
              onClick={() => {
                document.getElementById('plan-comparison')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              Upgrade Plan
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => toast.error('Subscription cancellation is disabled for demo accounts.')}
            >
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan comparison */}
      <Card id="plan-comparison">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Compare Plans</CardTitle>
              <CardDescription>
                Choose the plan that fits your team. AI features are available from Professional and above.
              </CardDescription>
            </div>
            {/* Billing toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted text-sm">
              <button
                type="button"
                onClick={() => setCycle('monthly')}
                className={cn(
                  'px-3 py-1 rounded-md transition-all font-medium',
                  cycle === 'monthly'
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setCycle('yearly')}
                className={cn(
                  'px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5',
                  cycle === 'yearly'
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Yearly
                <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                cycle={cycle}
                currentMonthlyPrice={currentPlan.monthlyPrice}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            All plans include a 14-day free trial. No credit card required for Free plan. AI features are module-level add-ons available on Professional and above.
          </p>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your billing payment details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-9 w-14 rounded border bg-background flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{PAYMENT_METHOD.brand} ending in {PAYMENT_METHOD.last4}</p>
                <p className="text-xs text-muted-foreground">
                  Expires {PAYMENT_METHOD.expMonth.toString().padStart(2, '0')}/{PAYMENT_METHOD.expYear}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Redirecting to payment update page...')}
            >
              Update
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Next billing date: <span className="font-medium text-foreground">March 1, 2026</span> — $49.00
          </p>
        </CardContent>
      </Card>

      {/* Invoice history */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Download past invoices for your records.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-3 text-muted-foreground text-xs">{inv.date}</td>
                  <td className="px-4 py-3 text-sm">{inv.description}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">${inv.amount}.00</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => downloadInvoice(inv)}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
