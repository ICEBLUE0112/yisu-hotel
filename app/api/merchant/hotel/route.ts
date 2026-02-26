// app/api/merchant/hotel/route.ts

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchantId')

    if (!merchantId) {
      return NextResponse.json({ success: false, message: '未提供商户ID' }, { status: 400 })
    }

    const hotels = await prisma.hotel.findMany({
      where: { merchantId: Number(merchantId) },
      orderBy: { createdAt: 'desc' },
      // 👉 新增：把关联的房型(rooms)也一并查出来，供修改时回显
      include: { rooms: true },
    })

    return NextResponse.json({ success: true, data: hotels })
  } catch (error) {
    console.error('获取商户酒店列表失败:', error)
    return NextResponse.json({ success: false, message: '获取数据失败' }, { status: 500 })
  }
}
