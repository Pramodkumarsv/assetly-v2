import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseDate } from '@/lib/utils'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const accessories = await prisma.accessory.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(accessories)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const userId = (session.user as any).id

  try {
    const accessory = await prisma.accessory.create({
      data: {
        assetTag:       body.assetTag,
        name:           body.name,
        type:           body.type,
        status:         body.status || 'AVAILABLE',
        serialNumber:   body.serialNumber || null,
        brand:          body.brand || null,
        model:          body.model || null,
        purchaseDate:   parseDate(body.purchaseDate),
        purchasePrice:  body.purchasePrice ? parseFloat(body.purchasePrice) : null,
        warrantyExpiry: parseDate(body.warrantyExpiry),
        location:       body.location || null,
        department:     body.department || null,
        assignedTo:     body.assignedTo || null,
        assignedDate:   body.assignedTo ? new Date() : null,
        notes:          body.notes || null,
        imageUrl:       body.imageUrl || null,
        userId,
      },
    })
    return NextResponse.json(accessory, { status: 201 })
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'Asset tag or serial number already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to create accessory' }, { status: 500 })
  }
}
