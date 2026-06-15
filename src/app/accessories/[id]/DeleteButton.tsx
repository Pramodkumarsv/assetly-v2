'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function DeleteAccessoryButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this accessory permanently?')) return
    setLoading(true)
    await fetch(`/api/accessories/${id}`, { method: 'DELETE' })
    toast.success('Accessory deleted')
    router.push('/accessories')
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="btn-danger">
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
