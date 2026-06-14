import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { formatCurrency, formatDate, daysUntil, STATUS_COLORS, LIFECYCLE_COLORS } from '@/lib/utils'

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="stat-card">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  )
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const [totalAssets, byStatus, byType, byLifecycle, recentAssets, totalValue, warrantyExpiring, users] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.groupBy({ by: ['status'], _count: true }),
    prisma.asset.groupBy({ by: ['type'], _count: true, orderBy: { _count: { type: 'desc' } }, take: 6 }),
    prisma.asset.groupBy({ by: ['lifecycle'], _count: true }),
    prisma.asset.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.asset.aggregate({ _sum: { purchasePrice: true } }),
    prisma.asset.findMany({
      where: { warrantyExpiry: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
      orderBy: { warrantyExpiry: 'asc' },
      take: 5,
    }),
    prisma.user.count(),
  ])

  const statusMap = Object.fromEntries(byStatus.map(s => [s.status, s._count]))
  const total = totalValue._sum.purchasePrice || 0

  return (
    <div className="p-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {session?.user?.name}</p>
        </div>
        <Link href="/assets/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Asset
        </Link>
      </div>

      {/* Warranty alerts */}
      {warrantyExpiring.length > 0 && (
        <div className="alert-warning mb-6 text-sm">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div>
            <p className="font-semibold mb-1">{warrantyExpiring.length} asset{warrantyExpiring.length > 1 ? 's' : ''} warranty expiring within 30 days</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {warrantyExpiring.map(a => (
                <Link key={a.id} href={`/assets/${a.id}`} className="underline underline-offset-2 hover:text-amber-200">
                  {a.name} ({daysUntil(a.warrantyExpiry)}d)
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Assets" value={totalAssets} sub={`${users} team members`} color="text-white" />
        <StatCard label="Total Value" value={formatCurrency(total)} sub="purchase price" color="text-white" />
        <StatCard label="Available" value={statusMap['AVAILABLE'] || 0} sub="ready to assign" color="text-emerald-400" />
        <StatCard label="Assigned" value={statusMap['ASSIGNED'] || 0} sub="in use" color="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Status breakdown */}
        <div className="card p-6">
          <p className="section-title">By Status</p>
          <div className="space-y-3">
            {byStatus.map(s => (
              <div key={s.status} className="flex items-center justify-between">
                <span className={`badge ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-400 rounded-full" style={{ width: `${totalAssets ? (s._count / totalAssets) * 100 : 0}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-zinc-300 w-6 text-right">{s._count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lifecycle */}
        <div className="card p-6">
          <p className="section-title">Lifecycle Stage</p>
          <div className="space-y-3">
            {byLifecycle.map(l => (
              <div key={l.lifecycle} className="flex items-center justify-between">
                <span className={`badge ${LIFECYCLE_COLORS[l.lifecycle]}`}>{l.lifecycle}</span>
                <span className="text-sm font-semibold text-zinc-300">{l._count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By type */}
        <div className="card p-6">
          <p className="section-title">Top Asset Types</p>
          <div className="space-y-3">
            {byType.map(t => (
              <div key={t.type} className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-400 truncate">{t.type}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-white/40 rounded-full" style={{ width: `${totalAssets ? (t._count / totalAssets) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-zinc-400 w-4 text-right">{t._count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent assets */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <p className="section-title mb-0">Recent Assets</p>
          <Link href="/assets" className="text-xs text-zinc-400 hover:text-white transition-colors">View all →</Link>
        </div>
        {recentAssets.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No assets yet. <Link href="/assets/new" className="text-white hover:underline">Add your first asset</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="table-header">Asset</th>
                <th className="table-header">Type</th>
                <th className="table-header">Status</th>
                <th className="table-header">Assigned To</th>
                <th className="table-header">Added</th>
              </tr>
            </thead>
            <tbody>
              {recentAssets.map(asset => (
                <tr key={asset.id} className="table-row">
                  <td className="table-cell">
                    <Link href={`/assets/${asset.id}`} className="font-medium text-white hover:text-zinc-300">
                      {asset.name}
                    </Link>
                    <p className="text-xs text-zinc-500">{asset.assetTag}</p>
                  </td>
                  <td className="table-cell text-zinc-400">{asset.type}</td>
                  <td className="table-cell"><span className={`badge ${STATUS_COLORS[asset.status]}`}>{asset.status}</span></td>
                  <td className="table-cell">{asset.assignedTo || <span className="text-zinc-600">—</span>}</td>
                  <td className="table-cell text-zinc-500">{formatDate(asset.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
