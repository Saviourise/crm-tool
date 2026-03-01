export type Channel = 'email' | 'sms' | 'call' | 'note'
export type ConversationStatus = 'open' | 'resolved' | 'pending'
export type CallOutcome = 'answered' | 'no-answer' | 'voicemail' | 'busy'
export type MessageDirection = 'inbound' | 'outbound'

export interface ContactThread {
  id: string
  contactName: string
  contactInitials: string
  avatarColor: string
  contactCompany: string
  lastMessage: string
  lastMessageTime: string
  lastChannel: Channel
  unreadCount: number
  status: ConversationStatus
}

export interface EmailMessage {
  id: string
  from: string
  to: string
  subject: string
  body: string
  timestamp: string
  direction: MessageDirection
  read: boolean
}

export interface SMSMessage {
  id: string
  body: string
  timestamp: string
  direction: MessageDirection
}

export interface CallEntry {
  id: string
  direction: MessageDirection
  duration: string
  outcome: CallOutcome
  notes?: string
  timestamp: string
  hasRecording: boolean
}

export interface NoteEntry {
  id: string
  body: string
  author: string
  authorInitials: string
  timestamp: string
}

export interface EmailDraft {
  id: string
  contactId: string
  contactName: string
  contactInitials: string
  avatarColor: string
  subject: string
  body: string
  savedAt: string
}

export interface ContactConversation {
  thread: ContactThread
  emails: EmailMessage[]
  sms: SMSMessage[]
  calls: CallEntry[]
  notes: NoteEntry[]
}
