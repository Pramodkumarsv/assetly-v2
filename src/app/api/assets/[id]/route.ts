import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const asset = await prisma.asset.findUnique({ where: { id: params.id } })
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(asset)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any).role
  if (role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const existing = await prisma.asset.findUnique({ where: { id: params.id } })

  const asset = await prisma.asset.update({
    where: { id: params.id },
    data: {
      assetTag: body.assetTag,
      name: body.name,
      type: body.type,
      status: body.status,
      lifecycle: body.lifecycle,
      serialNumber: body.serialNumber || null,
      brand: body.brand || null,
      model: body.model || null,
      specs: body.specs || null,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
      currentValue: body.currentValue ? parseFloat(body.currentValue) : null,
      warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null,
      location: body.location || null,
      department: body.department || null,
      assignedTo: body.assignedTo || null,
      notes: body.notes || null,
    },
  })

  // Track assignment change
  if (body.assignedTo && body.assignedTo !== existing?.assignedTo) {
    await prisma.assetAssignment.create({
      data: {
        assetId: params.id,
        assignedTo: body.assignedTo,
        userId: (session.user as any).id,
        notes: `Reassigned from ${existing?.assignedTo || 'unassigned'}`,
      },
    })
  }

  return NextResponse.json(asset)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Only admins can delete assets' }, { status: 403 })
  await prisma.asset.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
