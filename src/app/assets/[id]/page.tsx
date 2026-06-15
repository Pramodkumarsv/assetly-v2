import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency, formatDate, daysUntil, STATUS_COLORS, LIFECYCLE_COLORS } from '@/lib/utils'
import DeleteButton from './DeleteButton'
import QRCodeDisplay from './QRCodeDisplay'

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="text-sm text-zinc-200">{value || '—'}</p>
    </div>
  )
}

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const asset = await prisma.asset.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { name: true, email: true } },
      assignments: { orderBy: { assignedAt: 'desc' }, take: 5 },
      maintenances: { orderBy: { scheduledAt: 'desc' }, take: 5 },
    },
  })
  if (!asset) notFound()

  const warrantyDays = daysUntil(asset.warrantyExpiry)

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/assets" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">← Assets</Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="page-title">{asset.name}</h1>
              <span className={`badge ${STATUS_COLORS[asset.status]}`}>{asset.status}</span>
              <span className={`badge ${LIFECYCLE_COLORS[asset.lifecycle]}`}>{asset.lifecycle}</span>
            </div>
            <p className="text-zinc-500 text-sm font-mono">{asset.assetTag} {asset.serialNumber ? `· ${asset.serialNumber}` : ''}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/assets/${asset.id}/edit`} className="btn-secondary">Edit</Link>
            <DeleteButton id={asset.id} />
          </div>
        </div>
      </div>

      {/* Warranty alert */}
      {warrantyDays !== null && warrantyDays <= 30 && warrantyDays >= 0 && (
        <div className="alert-warning mb-6 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Warranty expires in {warrantyDays} day{warrantyDays !== 1 ? 's' : ''} on {formatDate(asset.warrantyExpiry)}
        </div>
      )}
      {warrantyDays !== null && warrantyDays < 0 && (
        <div className="alert-error mb-6 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          Warranty expired {Math.abs(warrantyDays)} days ago on {formatDate(asset.warrantyExpiry)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Details */}
          <div className="card p-6">
            <p className="section-title">Asset Details</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Field label="Brand" value={asset.brand} />
              <Field label="Model" value={asset.model} />
              <Field label="Type" value={asset.type} />
              <Field label="Department" value={asset.department} />
              <Field label="Location" value={asset.location} />
              <Field label="Assigned To" value={asset.assignedTo} />
              <Field label="Assigned Date" value={(asset as any).assignedDate ? formatDate((asset as any).assignedDate) : null} />
              {asset.specs && <div className="col-span-2"><Field label="Specifications" value={asset.specs} /></div>}
              {asset.notes && <div className="col-span-2"><Field label="Notes" value={asset.notes} /></div>}
            </div>
          </div>

          {/* Financials */}
          <div className="card p-6">
            <p className="section-title">Financials & Warranty</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Field label="Purchase Date" value={formatDate(asset.purchaseDate)} />
              <Field label="Purchase Price" value={asset.purchasePrice ? formatCurrency(asset.purchasePrice) : null} />
              <Field label="Current Value" value={asset.currentValue ? formatCurrency(asset.currentValue) : null} />
              <Field label="Warranty Expiry" value={formatDate(asset.warrantyExpiry)} />
            </div>
          </div>

          {/* Assignment history */}
          {asset.assignments.length > 0 && (
            <div className="card p-6">
              <p className="section-title">Assignment History</p>
              <div className="space-y-3">
                {asset.assignments.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="text-sm text-zinc-200">{a.assignedTo}</p>
                      {a.notes && <p className="text-xs text-zinc-500">{a.notes}</p>}
                    </div>
                    <div className="text-right text-xs text-zinc-500">
                      <p>{formatDate(a.assignedAt)}</p>
                      {a.returnedAt && <p>→ {formatDate(a.returnedAt)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance history */}
          {asset.maintenances.length > 0 && (
            <div className="card p-6">
              <p className="section-title">Maintenance Records</p>
              <div className="space-y-3">
                {asset.maintenances.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="text-sm text-zinc-200">{m.title}</p>
                      <p className="text-xs text-zinc-500">{m.type} · {m.status}</p>
                    </div>
                    <p className="text-xs text-zinc-500">{formatDate(m.scheduledAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Image */}
          {asset.imageUrl && (
            <div className="card overflow-hidden p-0">
              <Image src={asset.imageUrl} alt={asset.name} width={400} height={300} className="w-full object-cover" />
            </div>
          )}

          {/* QR Code */}
          <div className="card p-6">
            <p className="section-title">QR Code</p>
            <QRCodeDisplay assetTag={asset.assetTag} assetId={asset.id} />
          </div>

          {/* Meta */}
          <div className="card p-6">
            <p className="section-title">Meta</p>
            <div className="space-y-3">
              <Field label="Added By" value={asset.createdBy.name} />
              <Field label="Created" value={formatDate(asset.createdAt)} />
              <Field label="Last Updated" value={formatDate(asset.updatedAt)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
