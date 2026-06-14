import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatCurrency, formatDate, STATUS_COLORS, LIFECYCLE_COLORS, isAccessoryType } from '@/lib/utils'

export default async function AccessoriesPage() {
  const assets = await prisma.asset.findMany({
    where: { type: { in: ['KEYBOARD', 'MOUSE', 'PRINTER', 'SERVER', 'NETWORKING', 'SOFTWARE', 'OTHER'] } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accessories</h1>
          <p className="page-subtitle">All accessory items except laptops, phones, tablets, and monitors</p>
        </div>
        <Link href="/assets/new" className="btn-primary">
          Add Accessory
        </Link>
      </div>

      <div className="card overflow-hidden">
        {assets.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-sm mb-3">No accessories found</p>
            <Link href="/assets/new" className="btn-primary">Add accessory</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="table-header">Asset</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Assigned To</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Value</th>
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
                    <td className="table-cell text-zinc-400">{asset.assignedTo || <span className="text-zinc-600">—</span>}</td>
                    <td className="table-cell text-zinc-400">{asset.location || <span className="text-zinc-600">—</span>}</td>
                    <td className="table-cell">{asset.purchasePrice ? formatCurrency(asset.purchasePrice) : <span className="text-zinc-600">—</span>}</td>
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
