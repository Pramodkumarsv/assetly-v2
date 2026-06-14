import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const assets = await prisma.asset.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(assets)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const userId = (session.user as any).id

  try {
    const asset = await prisma.asset.create({
      data: {
        assetTag: body.assetTag,
        name: body.name,
        type: body.type,
        status: body.status || 'AVAILABLE',
        lifecycle: body.lifecycle || 'ACTIVE',
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
        imageUrl: body.imageUrl || null,
        userId,
      },
    })

    // Log assignment if assigned
    if (body.assignedTo) {
      await prisma.assetAssignment.create({
        data: { assetId: asset.id, assignedTo: body.assignedTo, userId, notes: 'Initial assignment' },
      })
    }

    return NextResponse.json(asset, { status: 201 })
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'Asset tag or serial number already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }
}
