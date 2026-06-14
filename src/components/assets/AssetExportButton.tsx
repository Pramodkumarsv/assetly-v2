'use client'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

export default function AssetExportButton() {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/assets')
      if (!res.ok) throw new Error('Failed to fetch assets')
      const assets = await res.json()

      const raw = assets.map((asset: any) => ({
        AssetTag: asset.assetTag,
        Name: asset.name,
        Type: asset.type,
        Status: asset.status,
        Lifecycle: asset.lifecycle,
        SerialNumber: asset.serialNumber,
        Brand: asset.brand,
        Model: asset.model,
        Specs: asset.specs,
        PurchaseDate: asset.purchaseDate,
        PurchasePrice: asset.purchasePrice,
        CurrentValue: asset.currentValue,
        WarrantyExpiry: asset.warrantyExpiry,
        Location: asset.location,
        Department: asset.department,
        AssignedTo: asset.assignedTo,
        Notes: asset.notes,
        ImageUrl: asset.imageUrl,
        CreatedAt: asset.createdAt,
      }))

      const worksheet = XLSX.utils.json_to_sheet(raw)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets')
      const data = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([data], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `assets-export-${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success('Exported assets to Excel')
    } catch (error) {
      console.error(error)
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <button onClick={handleExport} disabled={exporting} className="btn-secondary">
      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      {exporting ? 'Exporting...' : 'Export Excel'}
    </button>
  )
}
