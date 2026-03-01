import { Mail, MessageCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function ContactSupportCard() {
  return (
    <div className="border rounded-xl p-6 bg-muted/20">
      <h2 className="text-base font-semibold mb-1">Need more help?</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Our support team is here to help you get the most out of the CRM.
      </p>
      <div className="flex flex-wrap gap-3">
        <a href="mailto:support@crmtool.io">
          <Button variant="outline" size="sm" className="gap-2">
            <Mail className="h-4 w-4" />
            Email Support
          </Button>
        </a>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => toast.info('Live chat', { description: 'Connecting you to a support agent...' })}
        >
          <MessageCircle className="h-4 w-4" />
          Start Live Chat
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        We typically respond within 2 hours during business hours.
      </p>
    </div>
  )
}
