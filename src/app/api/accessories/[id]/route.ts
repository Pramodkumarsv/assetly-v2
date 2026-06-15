import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseDate } from '@/lib/utils'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const item = await prisma.accessory.findUnique({ where: { id: params.id } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any).role
  if (role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const existing = await prisma.accessory.findUnique({ where: { id: params.id } })

  const assignedToChanged = body.assignedTo && body.assignedTo !== existing?.assignedTo
  const assignedDate = assignedToChanged
    ? new Date()
    : (body.assignedTo ? existing?.assignedDate : null)

  const item = await prisma.accessory.update({
    where: { id: params.id },
    data: {
      assetTag:       body.assetTag,
      name:           body.name,
      type:           body.type,
      status:         body.status,
      serialNumber:   body.serialNumber || null,
      brand:          body.brand || null,
      model:          body.model || null,
      purchaseDate:   parseDate(body.purchaseDate),
      purchasePrice:  body.purchasePrice ? parseFloat(body.purchasePrice) : null,
      warrantyExpiry: parseDate(body.warrantyExpiry),
      location:       body.location || null,
      department:     body.department || null,
      assignedTo:     body.assignedTo || null,
      assignedDate:   assignedDate ?? null,
      notes:          body.notes || null,
    },
  })
  return NextResponse.json(item)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Only admins can delete' }, { status: 403 })
  await prisma.accessory.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
