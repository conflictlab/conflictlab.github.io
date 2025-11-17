import { readSnapshot } from '@/lib/forecasts'
import dynamic from 'next/dynamic'
const ScenariosGrid = dynamic(() => import('@/components/ScenariosGrid'), { ssr: false })

export default async function ScenariosPage() {
  const snap = readSnapshot('latest')
  const items = snap.entities
    .filter((e) => (e.entityType || 'country') === 'country')
    .map((e) => ({ name: e.name, iso3: e.iso3 }))
  return (
    <div className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">Country Scenarios</h1>
        <p className="text-gray-600 mb-6">Interactive plots of scenario series extracted from sce_dictionary for each country.</p>
        <ScenariosGrid items={items} />
      </div>
    </div>
  )
}

