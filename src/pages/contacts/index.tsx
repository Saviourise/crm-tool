import { ContactsHeader } from './components/ContactsHeader'
import { ContactsTable } from './components/ContactsTable'
import { ContactStats } from './components/ContactStats'
import { MOCK_CONTACTS } from './data'

export default function Contacts() {
  return (
    <div className="space-y-6">
      <ContactsHeader total={MOCK_CONTACTS.length} />
      <ContactStats contacts={MOCK_CONTACTS} />
      <ContactsTable contacts={MOCK_CONTACTS} />
    </div>
  )
}
