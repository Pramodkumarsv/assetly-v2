import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatCurrency, formatDate, STATUS_COLORS } from '@/lib/utils'
import ExportButton from '@/components/ui/ExportButton'

export default async function AccessoriesPage({ searchParams }: { searchParams: { q?: string; type?: string; status?: string } }) {
  const where: any = {}
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { assetTag: { contains: searchParams.q, mode: 'insensitive' } },
      { serialNumber: { contains: searchParams.q, mode: 'insensitive' } },
      { assignedTo: { contains: searchParams.q, mode: 'insensitive' } },
      { brand: { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }
  if (searchParams.type) where.type = searchParams.type
  if (searchParams.status) where.status = searchParams.status

  const [accessories, total] = await Promise.all([
    prisma.accessory.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.accessory.count(),
  ])

  const ACCESSORY_TYPES = ['KEYBOARD','MOUSE','PRINTER','SERVER','NETWORKING','SOFTWARE','HEADSET','WEBCAM','DOCKING_STATION','CABLE','CHARGER','BATTERY','STORAGE','OTHER']

  return (
    <div className="p-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accessories</h1>
          <p className="page-subtitle">{accessories.length} of {total} accessories</p>
        </div>
        <div className="flex gap-3">
          <ExportButton type="accessories" />
          <Link href="/accessories/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Accessory
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form className="flex gap-3 flex-wrap flex-1">
          <input name="q" defaultValue={searchParams.q} placeholder="Search by name, tag, person..." className="input max-w-xs" />
          <select name="type" defaultValue={searchParams.type} className="select w-44">
            <option value="">All Types</option>
            {ACCESSORY_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select name="status" defaultValue={searchParams.status} className="select w-40">
            <option value="">All Status</option>
            {['AVAILABLE','ASSIGNED','MAINTENANCE','RETIRED','LOST'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button type="submit" className="btn-secondary">Filter</button>
          {(searchParams.q || searchParams.type || searchParams.status) && (
            <Link href="/accessories" className="btn-ghost">Clear</Link>
          )}
        </form>
      </div>

      <div className="card overflow-hidden">
        {accessories.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <svg className="w-10 h-10 mx-auto mb-3 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <p className="text-sm mb-3">No accessories yet</p>
            <Link href="/accessories/new" className="btn-primary">Add your first accessory</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="table-header">Accessory</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Brand / Model</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Assigned To</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Value</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody>
                {accessories.map(item => (
                  <tr key={item.id} className="table-row">
                    <td className="table-cell">
                      <Link href={`/accessories/${item.id}`} className="font-medium text-white hover:text-zinc-300 block">{item.name}</Link>
                      <p className="text-xs text-zinc-500 font-mono">{item.assetTag}</p>
                    </td>
                    <td className="table-cell text-zinc-400">{item.type.replace('_', ' ')}</td>
                    <td className="table-cell text-zinc-400">{[item.brand, item.model].filter(Boolean).join(' / ') || '—'}</td>
                    <td className="table-cell"><span className={`badge ${STATUS_COLORS[item.status]}`}>{item.status}</span></td>
                    <td className="table-cell">{item.assignedTo || <span className="text-zinc-600">—</span>}</td>
                    <td className="table-cell text-zinc-400">{item.location || <span className="text-zinc-600">—</span>}</td>
                    <td className="table-cell">{item.purchasePrice ? formatCurrency(item.purchasePrice) : <span className="text-zinc-600">—</span>}</td>
                    <td className="table-cell">
                      <Link href={`/accessories/${item.id}`} className="text-zinc-400 hover:text-white text-xs font-medium">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
