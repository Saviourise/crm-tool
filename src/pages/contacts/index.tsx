import { useState } from 'react'
import { ContactsHeader } from './components/ContactsHeader'
import { ContactsTable } from './components/ContactsTable'
import { ContactStats } from './components/ContactStats'
import { MOCK_CONTACTS } from './data'
import { filterAndSortContacts } from './utils'
import { ContactFilters, ContactStatus, SortField } from './typings'

const defaultFilters: ContactFilters = {
  search: '',
  status: 'all',
  sortField: 'name',
  sortDirection: 'asc',
}

export default function Contacts() {
  const [filters, setFilters] = useState<ContactFilters>(defaultFilters)

  const filtered = filterAndSortContacts(MOCK_CONTACTS, filters)

  const handleSearch = (value: string) => {
    setFilters((f) => ({ ...f, search: value }))
  }

  const handleStatusChange = (value: ContactStatus | 'all') => {
    setFilters((f) => ({ ...f, status: value }))
  }

  const handleSort = (field: SortField) => {
    setFilters((f) => ({
      ...f,
      sortField: field,
      sortDirection: f.sortField === field && f.sortDirection === 'asc' ? 'desc' : 'asc',
    }))
  }

  return (
    <div className="space-y-6">
      <ContactsHeader
        filters={filters}
        total={filtered.length}
        onSearchChange={handleSearch}
        onStatusChange={handleStatusChange}
      />
      <ContactStats contacts={MOCK_CONTACTS} />
      <ContactsTable contacts={filtered} filters={filters} onSort={handleSort} />
    </div>
  )
}
