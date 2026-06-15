import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency, formatDate, daysUntil, STATUS_COLORS } from '@/lib/utils'
import DeleteAccessoryButton from './DeleteButton'
import QRCodeDisplay from '../../assets/[id]/QRCodeDisplay'

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="text-sm text-zinc-200">{value || '—'}</p>
    </div>
  )
}

export default async function AccessoryDetailPage({ params }: { params: { id: string } }) {
  const item = await prisma.accessory.findUnique({
    where: { id: params.id },
    include: { createdBy: { select: { name: true } } },
  })
  if (!item) notFound()

  const warrantyDays = daysUntil(item.warrantyExpiry)

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/accessories" className="text-xs text-zinc-500 hover:text-zinc-300">← Accessories</Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="page-title">{item.name}</h1>
              <span className={`badge ${STATUS_COLORS[item.status]}`}>{item.status}</span>
            </div>
            <p className="text-zinc-500 text-sm font-mono">{item.assetTag} {item.serialNumber ? `· ${item.serialNumber}` : ''}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/accessories/${item.id}/edit`} className="btn-secondary">Edit</Link>
            <DeleteAccessoryButton id={item.id} />
          </div>
        </div>
      </div>

      {warrantyDays !== null && warrantyDays <= 30 && warrantyDays >= 0 && (
        <div className="alert-warning mb-6 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Warranty expires in {warrantyDays} day{warrantyDays !== 1 ? 's' : ''} on {formatDate(item.warrantyExpiry)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <p className="section-title">Details</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Field label="Type" value={item.type.replace('_', ' ')} />
              <Field label="Brand" value={item.brand} />
              <Field label="Model" value={item.model} />
              <Field label="Department" value={item.department} />
              <Field label="Location" value={item.location} />
              <Field label="Assigned To" value={item.assignedTo} />
              <Field label="Assigned Date" value={(item as any).assignedDate ? formatDate((item as any).assignedDate) : null} />
              {item.notes && <div className="col-span-2"><Field label="Notes" value={item.notes} /></div>}
            </div>
          </div>
          <div className="card p-6">
            <p className="section-title">Financials</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Field label="Purchase Date" value={formatDate(item.purchaseDate)} />
              <Field label="Purchase Price" value={item.purchasePrice ? formatCurrency(item.purchasePrice) : null} />
              <Field label="Warranty Expiry" value={formatDate(item.warrantyExpiry)} />
              <Field label="Added By" value={item.createdBy.name} />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {item.imageUrl && (
            <div className="card overflow-hidden p-0">
              <Image src={item.imageUrl} alt={item.name} width={400} height={300} className="w-full object-cover" />
            </div>
          )}
          <div className="card p-6">
            <p className="section-title">QR Code</p>
            <QRCodeDisplay assetTag={item.assetTag} assetId={item.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
