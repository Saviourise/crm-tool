import { formatDistanceToNow } from 'date-fns'
import type { ApiContact } from '@/api/contacts'
import type { Contact } from './typings'

export function mapApiContactToContact(api: ApiContact): Contact {
  const company =
    typeof api.company === 'object' && api.company && 'name' in api.company
      ? api.company.name
      : typeof api.company === 'string'
        ? api.company
        : undefined

  const companyId =
    typeof api.company === 'object' && api.company && 'id' in api.company
      ? api.company.id
      : undefined

  const lastContacted = api.last_contacted
    ? formatDistanceToNow(new Date(api.last_contacted), { addSuffix: true })
    : undefined

  return {
    id: api.id,
    firstName: api.first_name,
    lastName: api.last_name,
    email: api.email,
    phone: api.phone ?? undefined,
    company,
    companyId,
    position: api.position ?? undefined,
    status: (api.status as Contact['status']) || 'active',
    tags: api.tags ?? [],
    avatar: api.avatar_url ?? undefined,
    linkedin: api.linkedin ?? undefined,
    twitter: api.twitter ?? undefined,
    lastContacted,
    createdAt: api.created_at,
  }
}
