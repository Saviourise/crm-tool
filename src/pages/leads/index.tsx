import { LeadsHeader } from './components/LeadsHeader'
import { LeadsStats } from './components/LeadsStats'
import { LeadsTable } from './components/LeadsTable'
import { MOCK_LEADS } from './data'

export default function Leads() {
  return (
    <div className="space-y-6">
      <LeadsHeader total={MOCK_LEADS.length} />
      <LeadsStats leads={MOCK_LEADS} />
      <LeadsTable leads={MOCK_LEADS} />
    </div>
  )
}
