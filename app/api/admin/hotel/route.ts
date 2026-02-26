import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: 获取所有酒店列表
export async function GET() {
  try {
    const hotels = await prisma.hotel.findMany({
      orderBy: { createdAt: 'desc' },
      // 可选：关联查询商户信息，方便管理员看是谁提交的
      include: { merchant: { select: { username: true } } },
    })
    return NextResponse.json({ success: true, data: hotels })
  } catch (error) {
    console.error('获取酒店列表失败:', error)
    return NextResponse.json({ success: false, message: '服务器内部错误' }, { status: 500 })
  }
}

// PATCH: 更新酒店状态（审核通过、驳回、下线、恢复）
export async function PATCH(request: Request) {
  try {
    const { id, status, rejectReason } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ success: false, message: '参数不完整' }, { status: 400 })
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id: Number(id) },
      data: {
        status,
        // 如果是重新审核或通过，清空原来的拒绝原因
        rejectReason: status === 'REJECTED' ? rejectReason : null,
      },
    })

    return NextResponse.json({ success: true, data: updatedHotel })
  } catch (error) {
    console.error('更新酒店状态失败:', error)
    return NextResponse.json({ success: false, message: '更新失败' }, { status: 500 })
  }
}
