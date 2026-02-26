import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '5')
    const star = searchParams.get('star')
    const maxPrice = searchParams.get('maxPrice')

    // 👉 1. 新增：获取前端传来的关键词
    const keyword = searchParams.get('keyword')

    const whereCondition: Prisma.HotelWhereInput = {
      status: 'PUBLISHED',
    }

    if (city && city !== '我的位置') {
      whereCondition.address = { contains: city }
    }

    if (star) {
      whereCondition.star = { gte: parseInt(star) }
    }

    if (maxPrice) {
      whereCondition.price = { lte: parseInt(maxPrice) }
    }

    // 👉 2. 新增：关键词模糊搜索（匹配标题或地址）
    if (keyword) {
      whereCondition.OR = [{ title: { contains: keyword } }, { address: { contains: keyword } }]
    }

    const hotels = await prisma.hotel.findMany({
      where: whereCondition,
      orderBy: { star: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    const total = await prisma.hotel.count({ where: whereCondition })

    return NextResponse.json({
      success: true,
      data: hotels,
      hasMore: page * pageSize < total,
    })
  } catch (error) {
    console.error('获取推荐酒店失败:', error)
    return NextResponse.json({ success: false, message: '获取数据失败' }, { status: 500 })
  }
}
