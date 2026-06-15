'use client'
import { useState } from 'react'
import Papa from 'papaparse'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { generateAssetTag } from '@/lib/utils'

export default function ImportPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (result) => setRows(result.data as any[]),
    })
  }

  async function handleImport() {
    setLoading(true)
    let success = 0
    for (const row of rows) {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetTag: row.assetTag || generateAssetTag(),
          name: row.name || 'Unnamed Asset',
          type: row.type || 'OTHER',
          status: row.status || 'AVAILABLE',
          lifecycle: row.lifecycle || 'ACTIVE',
          brand: row.brand || null,
          model: row.model || null,
          serialNumber: row.serialNumber || null,
          purchasePrice: row.purchasePrice ? parseFloat(row.purchasePrice) : null,
          location: row.location || null,
          assignedTo: row.assignedTo || null,
          department: row.department || null,
        }),
      })
      if (res.ok) success++
    }
    toast.success(`Imported ${success} of ${rows.length} assets!`)
    setLoading(false)
    setDone(true)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/assets" className="text-xs text-zinc-500 hover:text-zinc-300">← Assets</Link>
        <h1 className="page-title mt-2">Import Assets via CSV</h1>
        <p className="page-subtitle">Upload a CSV file to bulk import assets</p>
      </div>

      {/* Template */}
      <div className="card p-6 mb-5">
        <p className="text-sm font-semibold text-zinc-300 mb-3">CSV Format</p>
        <p className="text-xs text-zinc-500 mb-3">Your CSV should have these column headers (only <span className="text-white">name</span> is required):</p>
        <div className="bg-zinc-950 rounded-lg p-3 font-mono text-xs text-zinc-400 overflow-x-auto">
          name, type, status, brand, model, serialNumber, purchasePrice, location, assignedTo, department
        </div>
        <a
          href="data:text/csv;charset=utf-8,name,type,status,brand,model,serialNumber,purchasePrice,location,assignedTo,department%0AMacBook Pro 14,LAPTOP,ASSIGNED,Apple,MacBook Pro M3,SN-001,145000,Office Floor 2,Rahul Kumar,Engineering"
          download="asset-import-template.csv"
          className="btn-ghost mt-3 text-xs"
        >
          ↓ Download Template
        </a>
      </div>

      {/* Upload */}
      <div className="card p-6 mb-5">
        <label className="label">Upload CSV File</label>
        <input type="file" accept=".csv" onChange={handleFile}
          className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 file:cursor-pointer" />
      </div>

      {/* Preview */}
      {rows.length > 0 && !done && (
        <div className="card mb-5">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <p className="text-sm font-semibold text-zinc-300">{rows.length} rows found</p>
            <button onClick={handleImport} disabled={loading} className="btn-primary">
              {loading ? 'Importing...' : `Import ${rows.length} assets`}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  {Object.keys(rows[0]).slice(0, 5).map(k => <th key={k} className="table-header">{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="table-row">
                    {Object.values(row).slice(0, 5).map((v: any, j) => <td key={j} className="table-cell">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && <p className="text-xs text-zinc-500 px-4 py-3">...and {rows.length - 5} more rows</p>}
          </div>
        </div>
      )}

      {done && (
        <div className="alert-success">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Import complete! <Link href="/assets" className="underline">View all assets →</Link>
        </div>
      )}
    </div>
  )
}
