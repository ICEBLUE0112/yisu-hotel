import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 👉 1. params 的类型改为 Promise
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 👉 2. 使用 await 等待 params 解析，然后再取 id
    const { id } = await params
    const hotelId = parseInt(id)

    if (isNaN(hotelId)) {
      return NextResponse.json({ success: false, message: '无效的酒店ID' }, { status: 400 })
    }

    // 去数据库查询该酒店，并要求必须是“已发布”状态
    const hotel = await prisma.hotel.findUnique({
      where: {
        id: hotelId,
        status: 'PUBLISHED',
      },
      // 👉 关键点：把该酒店关联的所有房型一并查出来
      include: {
        rooms: true,
      },
    })

    if (!hotel) {
      return NextResponse.json({ success: false, message: '酒店不存在或已下线' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: hotel })
  } catch (error) {
    console.error('获取酒店详情失败:', error)
    return NextResponse.json({ success: false, message: '服务器内部错误' }, { status: 500 })
  }
}
