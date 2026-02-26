import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// 创建prisma客户端实例
const prisma = new PrismaClient()

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params

    // 查询酒店数据
    const hotel = await prisma.hotel.findUnique({
      where: {
        id: parseInt(id),
      },
    })

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          message: '酒店不存在',
        },
        {
          status: 404,
        },
      )
    }

    // 格式化酒店数据
    let imageUrl = hotel.images

    // 确保 imageUrl 是一个有效的字符串
    if (!imageUrl || typeof imageUrl !== 'string') {
      imageUrl =
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20room%20interior&image_size=square'
    } else {
      // 清理 imageUrl，移除可能的方括号和多余的引号
      imageUrl = imageUrl.replace(/^\["'\s*|\s*"'\]$/g, '')
      imageUrl = imageUrl.replace(/^`|`$/g, '')
    }

    const formattedHotel = {
      id: hotel.id.toString(),
      title: hotel.title,
      score: hotel.score,
      reviewCount: Math.floor(Math.random() * 5000) + 1000, // 模拟评论数
      favoriteCount: Math.floor(Math.random() * 50000) + 5000, // 模拟收藏数
      location: hotel.address,
      tags: hotel.tags.split(','),
      price: hotel.price, // 直接使用价格
      originalPrice: Math.floor(hotel.price * 1.5), // 模拟原价
      imageUrl: imageUrl,
      hasVideo: false, // 暂时禁用视频功能，确保所有图片都能显示
      isFeatured: Math.random() > 0.7,
      description: `${hotel.title}是一家位于${hotel.address}的优质酒店`,
      facilities: ['免费停车', 'Wi-Fi', '健身房', '游泳池', '餐厅', '会议室'],
      address: hotel.address,
      distance: '距最近地铁站步行1.5公里，约22分钟',
      openingYear: '2020',
      style: '现代风格',
      features: ['免费停车', 'Wi-Fi', '健身房', '游泳池'],
    }

    return NextResponse.json(formattedHotel)
  } catch (error) {
    console.error('获取酒店详情失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取酒店详情失败',
      },
      {
        status: 500,
      },
    )
  } finally {
    // 确保prisma客户端断开连接
    await prisma.$disconnect()
  }
}
