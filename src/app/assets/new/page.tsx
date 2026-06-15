'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadFile } from '@/lib/supabase'
import { generateAssetTag, ASSET_TYPES, ASSET_STATUSES, LIFECYCLE_STAGES } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

export default function NewAssetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [createdItem, setCreatedItem] = useState<{ id: string; assetTag: string; name: string } | null>(null)
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
    if (res.ok) {
      const data = await res.json()
      toast.success('Asset created!')
      setCreatedItem({ id: data.id, assetTag: data.assetTag, name: data.name })
    } else {
      toast.error('Failed to create asset')
      setLoading(false)
    }
  }

  async function downloadQR() {
    if (!createdItem) return
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, `ASSET:${createdItem.assetTag}:${createdItem.id}`, {
      width: 300, margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
    const link = document.createElement('a')
    link.download = `${createdItem.assetTag}-qr.png`
    link.href = canvas.toDataURL()
    link.click()
    toast.success('QR downloaded!')
  }

  if (createdItem) {
    return (
      <div className="p-8 max-w-lg">
        <div className="card p-8 text-center">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Asset Created!</h2>
          <p className="text-zinc-400 text-sm mb-6">{createdItem.name} · {createdItem.assetTag}</p>

          <div className="bg-white rounded-xl p-4 inline-block mb-6">
            <QRCanvas assetTag={createdItem.assetTag} assetId={createdItem.id} />
          </div>

          <p className="text-xs text-zinc-500 mb-6">Download the QR code and stick it on the device for easy scanning and tracking.</p>

          <div className="flex flex-col gap-3">
            <button onClick={downloadQR} className="btn-primary justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download QR Code
            </button>
            <button onClick={() => { setCreatedItem(null); setForm({ assetTag: generateAssetTag(), name: '', type: 'LAPTOP', status: 'AVAILABLE', lifecycle: 'ACTIVE', serialNumber: '', brand: '', model: '', specs: '', purchaseDate: '', purchasePrice: '', currentValue: '', warrantyExpiry: '', location: '', department: '', assignedTo: '', notes: '' }) }} className="btn-secondary">
              Add Another Asset
            </button>
            <Link href="/assets" className="btn-ghost justify-center text-center">View All Assets</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/assets" className="text-xs text-zinc-500 hover:text-zinc-300">← Assets</Link>
        <h1 className="page-title mt-2">Add New Asset</h1>
        <p className="page-subtitle">A QR code will be generated automatically after saving</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Identity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Asset Tag</label><input className="input font-mono" value={form.assetTag} onChange={e => set('assetTag', e.target.value)} required /></div>
            <div><label className="label">Serial Number</label><input className="input" placeholder="SN-XXXX" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} /></div>
          </div>
          <div><label className="label">Asset Name *</label><input className="input" placeholder="e.g. MacBook Pro 14 — Rahul's Machine" required value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Type *</label><select className="select" value={form.type} onChange={e => set('type', e.target.value)}>{ASSET_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label">Status</label><select className="select" value={form.status} onChange={e => set('status', e.target.value)}>{ASSET_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="label">Lifecycle</label><select className="select" value={form.lifecycle} onChange={e => set('lifecycle', e.target.value)}>{LIFECYCLE_STAGES.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Brand</label><input className="input" placeholder="Apple, Dell, HP..." value={form.brand} onChange={e => set('brand', e.target.value)} /></div>
            <div><label className="label">Model</label><input className="input" placeholder="MacBook Pro M3 14&quot;" value={form.model} onChange={e => set('model', e.target.value)} /></div>
          </div>
          <div><label className="label">Specs / Description</label><textarea className="input" rows={2} placeholder="16GB RAM, 512GB SSD..." value={form.specs} onChange={e => set('specs', e.target.value)} /></div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Purchase & Financials</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Purchase Date</label><input type="date" className="input" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} /></div>
            <div><label className="label">Purchase Price (₹)</label><input type="number" className="input" placeholder="85000" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} /></div>
            <div><label className="label">Current Value (₹)</label><input type="number" className="input" placeholder="65000" value={form.currentValue} onChange={e => set('currentValue', e.target.value)} /></div>
          </div>
          <div><label className="label">Warranty Expiry</label><input type="date" className="input" value={form.warrantyExpiry} onChange={e => set('warrantyExpiry', e.target.value)} /></div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Assignment & Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Assigned To</label><input className="input" placeholder="Employee name" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} /></div>
            <div><label className="label">Department</label><input className="input" placeholder="Engineering, HR..." value={form.department} onChange={e => set('department', e.target.value)} /></div>
          </div>
          <div><label className="label">Location</label><input className="input" placeholder="Office Floor 2, Remote..." value={form.location} onChange={e => set('location', e.target.value)} /></div>
          <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Image</h2>
          <input type="file" accept="image/*"
            className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 file:cursor-pointer"
            onChange={e => setImageFile(e.target.files?.[0] || null)} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save & Generate QR'}</button>
          <Link href="/assets" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}

function QRCanvas({ assetTag, assetId }: { assetTag: string; assetId: string }) {
  const canvasRef = (canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      QRCode.toCanvas(canvas, `ASSET:${assetTag}:${assetId}`, {
        width: 200, margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
    }
  }
  return <canvas ref={canvasRef} />
}
