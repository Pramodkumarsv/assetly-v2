'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadFile } from '@/lib/supabase'
import { generateAssetTag, ASSET_TYPES, ASSET_STATUSES, LIFECYCLE_STAGES } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NewAssetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    assetTag: generateAssetTag(),
    name: '', type: 'LAPTOP', status: 'AVAILABLE', lifecycle: 'ACTIVE',
    serialNumber: '', brand: '', model: '', specs: '',
    purchaseDate: '', purchasePrice: '', currentValue: '',
    warrantyExpiry: '', location: '', department: '',
    assignedTo: '', notes: '',
  })

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    let imageUrl = null
    if (imageFile) imageUrl = await uploadFile(imageFile, 'images')
    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, imageUrl }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Asset created!')
      router.push(`/assets/${data.id}`)
    } else {
      toast.error(data?.error || 'Failed to create asset')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/assets" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">← Assets</Link>
        <h1 className="page-title mt-2">Add New Asset</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Identity */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Identity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Asset Tag</label>
              <input className="input font-mono" value={form.assetTag} onChange={e => set('assetTag', e.target.value)} required />
            </div>
            <div>
              <label className="label">Serial Number</label>
              <input className="input" placeholder="SN-XXXX" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Asset Name *</label>
            <input className="input" placeholder="e.g. MacBook Pro 14 — Rahul's Machine" required value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Type *</label>
              <select className="select" value={form.type} onChange={e => set('type', e.target.value)}>
                {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                {ASSET_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Lifecycle</label>
              <select className="select" value={form.lifecycle} onChange={e => set('lifecycle', e.target.value)}>
                {LIFECYCLE_STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Brand</label>
              <input className="input" placeholder="Apple, Dell, HP..." value={form.brand} onChange={e => set('brand', e.target.value)} />
            </div>
            <div>
              <label className="label">Model</label>
              <input className="input" placeholder="MacBook Pro M3 14&quot;" value={form.model} onChange={e => set('model', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Specs / Description</label>
            <textarea className="input" rows={2} placeholder="16GB RAM, 512GB SSD, Apple M3..." value={form.specs} onChange={e => set('specs', e.target.value)} />
          </div>
        </div>

        {/* Purchase */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Purchase & Financials</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Purchase Date</label>
              <input type="date" className="input" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Purchase Price (₹)</label>
              <input type="number" className="input" placeholder="85000" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} />
            </div>
            <div>
              <label className="label">Current Value (₹)</label>
              <input type="number" className="input" placeholder="65000" value={form.currentValue} onChange={e => set('currentValue', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Warranty Expiry</label>
            <input type="date" className="input" value={form.warrantyExpiry} onChange={e => set('warrantyExpiry', e.target.value)} />
          </div>
        </div>

        {/* Assignment */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Assignment & Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Assigned To</label>
              <input className="input" placeholder="Employee name" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input" placeholder="Engineering, HR, Sales..." value={form.department} onChange={e => set('department', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" placeholder="Office Floor 2, Remote, Warehouse..." value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} placeholder="Any additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        {/* Image */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Image</h2>
          <input
            type="file" accept="image/*"
            className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 file:cursor-pointer"
            onChange={e => setImageFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Asset'}
          </button>
          <Link href="/assets" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
