'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ASSET_TYPES, ASSET_STATUSES, LIFECYCLE_STAGES } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function EditAssetPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({
    assetTag: '', name: '', type: 'LAPTOP', status: 'AVAILABLE', lifecycle: 'ACTIVE',
    serialNumber: '', brand: '', model: '', specs: '',
    purchaseDate: '', purchasePrice: '', currentValue: '',
    warrantyExpiry: '', location: '', department: '', assignedTo: '', notes: '',
  })

  useEffect(() => {
    fetch(`/api/assets/${id}`).then(r => r.json()).then(d => {
      setForm({
        assetTag: d.assetTag || '',
        name: d.name || '',
        type: d.type || 'LAPTOP',
        status: d.status || 'AVAILABLE',
        lifecycle: d.lifecycle || 'ACTIVE',
        serialNumber: d.serialNumber || '',
        brand: d.brand || '',
        model: d.model || '',
        specs: d.specs || '',
        purchaseDate: d.purchaseDate?.split('T')[0] || '',
        purchasePrice: d.purchasePrice?.toString() || '',
        currentValue: d.currentValue?.toString() || '',
        warrantyExpiry: d.warrantyExpiry?.split('T')[0] || '',
        location: d.location || '',
        department: d.department || '',
        assignedTo: d.assignedTo || '',
        notes: d.notes || '',
      })
      setFetching(false)
    })
  }, [id])

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/assets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { toast.success('Asset updated!'); router.push(`/assets/${id}`) }
    else { toast.error('Update failed'); setLoading(false) }
  }

  if (fetching) return <div className="p-8 text-zinc-500 text-sm">Loading...</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href={`/assets/${id}`} className="text-xs text-zinc-500 hover:text-zinc-300">← Back to Asset</Link>
        <h1 className="page-title mt-2">Edit Asset</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Identity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Asset Tag</label><input className="input font-mono" value={form.assetTag} onChange={e => set('assetTag', e.target.value)} /></div>
            <div><label className="label">Serial Number</label><input className="input" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} /></div>
          </div>
          <div><label className="label">Asset Name *</label><input className="input" required value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Type</label><select className="select" value={form.type} onChange={e => set('type', e.target.value)}>{ASSET_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label">Status</label><select className="select" value={form.status} onChange={e => set('status', e.target.value)}>{ASSET_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="label">Lifecycle</label><select className="select" value={form.lifecycle} onChange={e => set('lifecycle', e.target.value)}>{LIFECYCLE_STAGES.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={e => set('brand', e.target.value)} /></div>
            <div><label className="label">Model</label><input className="input" value={form.model} onChange={e => set('model', e.target.value)} /></div>
          </div>
          <div><label className="label">Specs</label><textarea className="input" rows={2} value={form.specs} onChange={e => set('specs', e.target.value)} /></div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Financials</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Purchase Date</label><input type="date" className="input" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} /></div>
            <div><label className="label">Purchase Price (₹)</label><input type="number" className="input" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} /></div>
            <div><label className="label">Current Value (₹)</label><input type="number" className="input" value={form.currentValue} onChange={e => set('currentValue', e.target.value)} /></div>
          </div>
          <div><label className="label">Warranty Expiry</label><input type="date" className="input" value={form.warrantyExpiry} onChange={e => set('warrantyExpiry', e.target.value)} /></div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Assignment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Assigned To</label><input className="input" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} /></div>
            <div><label className="label">Department</label><input className="input" value={form.department} onChange={e => set('department', e.target.value)} /></div>
          </div>
          <div><label className="label">Location</label><input className="input" value={form.location} onChange={e => set('location', e.target.value)} /></div>
          <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          <Link href={`/assets/${id}`} className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
