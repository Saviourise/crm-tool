import { toast } from 'sonner'
import { CompanyHeader } from './components/CompanyHeader'
import { CompanyStats } from './components/CompanyStats'
import { CompaniesTable } from './components/CompaniesTable'
import { MOCK_COMPANIES } from './data'

export default function Companies() {
  return (
    <div className="space-y-6">
      <CompanyHeader
        total={MOCK_COMPANIES.length}
        onAdd={() => toast.info('Add Company dialog coming')}
        onImport={() => toast.info('Import coming')}
      />
      <CompanyStats companies={MOCK_COMPANIES} />
      <CompaniesTable companies={MOCK_COMPANIES} />
    </div>
  )
}
