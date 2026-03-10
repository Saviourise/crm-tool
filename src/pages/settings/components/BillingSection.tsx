import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, CreditCard, Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlanCard, type BillingCycle } from '@/components/common/PlanCard'
import { pricingApi, billingApi } from '@/api/pricing'
import { getUsagePercent, getUsageColor, formatNumber } from '../utils'
import { cn } from '@/lib/utils'
import { INVOICES, PAYMENT_METHOD, USAGE } from '../data'

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

function UsageBar({ label, used, limit, unit = '' }: { label: string; used: number; limit: number; unit?: string }) {
  const isUnlimited = limit < 0
  const pct = isUnlimited ? 0 : getUsagePercent(used, limit)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {formatNumber(used)} / {isUnlimited ? '∞' : formatNumber(limit)}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', isUnlimited ? 'bg-primary/30' : getUsageColor(pct))}
          style={{ width: isUnlimited ? '100%' : `${Math.min(pct, 100)}%` }}
        />
      </div>
      {!isUnlimited && <p className="text-xs text-muted-foreground">{pct}% used</p>}
    </div>
  )
}

export function BillingSection() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  const { data: plans = [], isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const res = await pricingApi.getPlans()
      return res.data
    },
  })

  const { data: billing, isLoading: billingLoading } = useQuery({
    queryKey: ['billing-overview'],
    queryFn: async () => {
      const res = await billingApi.getOverview()
      return res.data
    },
    retry: false,
  })

  const currentPlanKey = billing?.plan ?? 'free'

  async function handleCheckout(planKey: string, billingCycle: BillingCycle) {
    if (planKey === 'free' || planKey === currentPlanKey) return
    try {
      const { data } = await billingApi.checkout(planKey, billingCycle)
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        toast.error('No checkout URL returned.')
      }
    } catch {
      toast.error('Failed to start checkout. Please try again.')
    }
  }

  if (plansError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Failed to load pricing plans.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero + Plans */}
      <div id="plan-comparison" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Plans that scale with your team
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Choose the plan that fits. All paid plans include a 14-day free trial. No credit card required for Free.
          </p>
        </div>

        {/* Monthly / Yearly toggle */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted text-sm">
            <button
              type="button"
              onClick={() => setCycle('monthly')}
              className={cn(
                'px-4 py-2 rounded-md transition-all font-medium',
                cycle === 'monthly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCycle('yearly')}
              className={cn(
                'px-4 py-2 rounded-md transition-all font-medium flex items-center gap-2',
                cycle === 'yearly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Save 17%</Badge>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        {plansLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                billingCycle={cycle}
                variant="checkout"
                currentPlanKey={currentPlanKey}
                onCheckout={handleCheckout}
              />
            ))}
          </div>
        )}
      </div>

      {/* Current plan + usage */}
      {!billingLoading && billing && (
        <Card id="current-plan">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Current Plan & Usage</CardTitle>
                <CardDescription className="mt-1">
                  You are on the <strong className="text-foreground">{billing.plan}</strong> plan.
                </CardDescription>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {billing.plan}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UsageBar
                label="AI Credits"
                used={billing.ai_credits_used}
                limit={billing.ai_credits_total}
              />
              <UsageBar label="Team Members" used={USAGE.users.used} limit={USAGE.users.limit} />
              <UsageBar label="Contacts" used={USAGE.contacts.used} limit={USAGE.contacts.limit} />
              <UsageBar label="Storage" used={USAGE.storage.used} limit={USAGE.storage.limit} unit=" GB" />
            </div>
            <div className="flex items-center gap-3 pt-2 border-t">
              <Button
                size="sm"
                onClick={() => document.getElementById('plan-comparison')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Change Plan
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => toast.info('Contact support to cancel your subscription.')}
              >
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your billing payment details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border bg-muted/30">
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
            <Button variant="outline" size="sm" onClick={() => toast.info('Redirect to Stripe customer portal to update.')}>
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice history */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Download past invoices for your records.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
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
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => downloadInvoice(inv)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
