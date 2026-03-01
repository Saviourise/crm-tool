import type { ConversationStatus, CallOutcome } from './typings'

export function getStatusConfig(status: ConversationStatus) {
  const configs = {
    open: {
      label: 'Open',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
      dot: 'bg-emerald-500',
    },
    pending: {
      label: 'Pending',
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
      dot: 'bg-amber-500',
    },
    resolved: {
      label: 'Resolved',
      className: 'bg-muted text-muted-foreground border-border',
      dot: 'bg-muted-foreground/50',
    },
  }
  return configs[status]
}

export function getOutcomeConfig(outcome: CallOutcome) {
  const configs = {
    answered: {
      label: 'Answered',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
    },
    'no-answer': {
      label: 'No Answer',
      className: 'bg-muted text-muted-foreground border-border',
    },
    voicemail: {
      label: 'Voicemail',
      className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
    },
    busy: {
      label: 'Busy',
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
    },
  }
  return configs[outcome]
}

export function renderWithMentions(text: string): { type: 'text' | 'mention'; value: string; key: string }[] {
  return text.split(/(@\w+)/).map((part, i) => ({
    type: part.startsWith('@') ? 'mention' : 'text',
    value: part,
    key: `${i}`,
  }))
}
