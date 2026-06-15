import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatCurrency, formatDate, STATUS_COLORS, LIFECYCLE_COLORS } from '@/lib/utils'
import ExportButton from '@/components/ui/ExportButton'

export default async function AssetsPage({ searchParams }: { searchParams: { q?: string; type?: string; status?: string } }) {
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

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.asset.count(),
  ])

  return (
    <div className="p-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assets</h1>
          <p className="page-subtitle">{assets.length} of {total} assets</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/assets/import" className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Import CSV
          </Link>
          <ExportButton type="assets" />
          <Link href="/assets/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Asset
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form className="flex gap-3 flex-wrap flex-1">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search by name, tag, serial, person..."
            className="input max-w-xs"
          />
          <select name="type" defaultValue={searchParams.type} className="select w-40">
            <option value="">All Types</option>
            {['LAPTOP','DESKTOP','PHONE','TABLET','MONITOR','KEYBOARD','MOUSE','PRINTER','SERVER','NETWORKING','SOFTWARE','OTHER'].map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select name="status" defaultValue={searchParams.status} className="select w-40">
            <option value="">All Status</option>
            {['AVAILABLE','ASSIGNED','MAINTENANCE','RETIRED','LOST'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">Filter</button>
          {(searchParams.q || searchParams.type || searchParams.status) && (
            <Link href="/assets" className="btn-ghost">Clear</Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {assets.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <svg className="w-10 h-10 mx-auto mb-3 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
            <p className="text-sm mb-3">No assets found</p>
            <Link href="/assets/new" className="btn-primary">Add your first asset</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="table-header">Asset</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Lifecycle</th>
                  <th className="table-header">Assigned To</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Value</th>
                  <th className="table-header">Warranty</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => (
                  <tr key={asset.id} className="table-row">
                    <td className="table-cell">
                      <Link href={`/assets/${asset.id}`} className="font-medium text-white hover:text-zinc-300 block">
                        {asset.name}
                      </Link>
                      <p className="text-xs text-zinc-500 font-mono">{asset.assetTag}</p>
                    </td>
                    <td className="table-cell text-zinc-400">{asset.type}</td>
                    <td className="table-cell"><span className={`badge ${STATUS_COLORS[asset.status]}`}>{asset.status}</span></td>
                    <td className="table-cell"><span className={`badge ${LIFECYCLE_COLORS[asset.lifecycle]}`}>{asset.lifecycle}</span></td>
                    <td className="table-cell">{asset.assignedTo || <span className="text-zinc-600">—</span>}</td>
                    <td className="table-cell text-zinc-400">{asset.location || <span className="text-zinc-600">—</span>}</td>
                    <td className="table-cell">{asset.purchasePrice ? formatCurrency(asset.purchasePrice) : <span className="text-zinc-600">—</span>}</td>
                    <td className="table-cell">
                      {asset.warrantyExpiry ? (
                        <span className={`text-xs ${new Date(asset.warrantyExpiry) < new Date() ? 'text-red-400' : 'text-zinc-400'}`}>
                          {formatDate(asset.warrantyExpiry)}
                        </span>
                      ) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="table-cell">
                      <Link href={`/assets/${asset.id}`} className="text-zinc-400 hover:text-white text-xs font-medium transition-colors">
                        View →
                      </Link>
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
