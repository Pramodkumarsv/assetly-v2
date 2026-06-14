import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { formatDate, ROLE_COLORS } from '@/lib/utils'
import AddUserButton from './AddUserButton'

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (role !== 'ADMIN' && role !== 'MANAGER') redirect('/dashboard')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { assets: true } } },
  })

  return (
    <div className="p-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">{users.length} members</p>
        </div>
        {role === 'ADMIN' && <AddUserButton />}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="table-header">Member</th>
              <th className="table-header">Role</th>
              <th className="table-header">Department</th>
              <th className="table-header">Assets Created</th>
              <th className="table-header">Status</th>
              <th className="table-header">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0">
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell"><span className={`badge ${ROLE_COLORS[user.role]}`}>{user.role}</span></td>
                <td className="table-cell text-zinc-400">{user.department || '—'}</td>
                <td className="table-cell text-zinc-400">{user._count.assets}</td>
                <td className="table-cell">
                  <span className={`badge ${user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="table-cell text-zinc-500">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
