'use client'
import toast from 'react-hot-toast'

export default function ExportButton({ type = 'assets' }: { type?: 'assets' | 'accessories' }) {
  async function exportExcel() {
    const XLSX = await import('xlsx')
    const res = await fetch(`/api/${type}`)
    const data = await res.json()

    if (!data.length) { toast.error('No data to export'); return }

    const rows = data.map((item: any) => ({
      'Asset Tag': item.assetTag,
      'Name': item.name,
      'Type': item.type,
      'Status': item.status,
      'Brand': item.brand || '',
      'Model': item.model || '',
      'Serial Number': item.serialNumber || '',
      'Assigned To': item.assignedTo || '',
      'Department': item.department || '',
      'Location': item.location || '',
      'Purchase Price': item.purchasePrice || '',
      'Purchase Date': item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('en-IN') : '',
      'Warranty Expiry': item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString('en-IN') : '',
      'Assigned Date': item.assignedDate ? new Date(item.assignedDate).toLocaleDateString('en-IN') : '',
      'Notes': item.notes || '',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, type === 'assets' ? 'Assets' : 'Accessories')

    // Style header row width
    ws['!cols'] = Object.keys(rows[0]).map(() => ({ wch: 18 }))

    XLSX.writeFile(wb, `${type}-export-${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success(`Exported ${rows.length} ${type}!`)
  }

  return (
    <button onClick={exportExcel} className="btn-secondary">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export Excel
    </button>
  )
}
