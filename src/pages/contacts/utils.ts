import { Contact, ContactFilters } from './typings'

export function filterAndSortContacts(contacts: Contact[], filters: ContactFilters): Contact[] {
  let result = [...contacts]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.position?.toLowerCase().includes(q)
    )
  }

  if (filters.status !== 'all') {
    result = result.filter((c) => c.status === filters.status)
  }

  result.sort((a, b) => {
    let valA = ''
    let valB = ''

    switch (filters.sortField) {
      case 'name':
        valA = `${a.firstName} ${a.lastName}`
        valB = `${b.firstName} ${b.lastName}`
        break
      case 'company':
        valA = a.company ?? ''
        valB = b.company ?? ''
        break
      case 'status':
        valA = a.status
        valB = b.status
        break
      case 'lastContacted':
        valA = a.lastContacted ?? ''
        valB = b.lastContacted ?? ''
        break
      case 'createdAt':
        valA = a.createdAt
        valB = b.createdAt
        break
    }

    const cmp = valA.localeCompare(valB)
    return filters.sortDirection === 'asc' ? cmp : -cmp
  })

  return result
}
