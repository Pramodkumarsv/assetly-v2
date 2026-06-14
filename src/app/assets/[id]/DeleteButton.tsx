'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this asset permanently?')) return
    setLoading(true)
    await fetch(`/api/assets/${id}`, { method: 'DELETE' })
    toast.success('Asset deleted')
    router.push('/assets')
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="btn-danger">
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
