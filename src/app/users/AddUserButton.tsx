'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AddUserButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VIEWER', department: '' })
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('User created!')
      setOpen(false)
      setForm({ name: '', email: '', password: '', role: 'VIEWER', department: '' })
      router.refresh()
    } else {
      const err = await res.json()
      toast.error(err.error || 'Failed to create user')
    }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Member
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5">Add Team Member</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Priya Sharma" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="priya@company.com" />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" required value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" minLength={6} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Role</label>
                  <select className="select" value={form.role} onChange={e => set('role', e.target.value)}>
                    <option value="VIEWER">Viewer</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label">Department</label>
                  <input className="input" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Engineering" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Member'}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
