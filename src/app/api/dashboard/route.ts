import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [total, byStatus, byType, totalValue] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.groupBy({ by: ['status'], _count: true }),
    prisma.asset.groupBy({ by: ['type'], _count: true, orderBy: { _count: { type: 'desc' } }, take: 6 }),
    prisma.asset.aggregate({ _sum: { purchasePrice: true } }),
  ])

  return NextResponse.json({ total, byStatus, byType, totalValue: totalValue._sum.purchasePrice || 0 })
}
