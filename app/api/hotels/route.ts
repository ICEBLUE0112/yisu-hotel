import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// 创建prisma客户端实例
const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city') || ''
    const searchKeyword = searchParams.get('keyword') || ''
    const sortBy = searchParams.get('sortBy') || 'popularity'
    const tagsParam = searchParams.get('tags') || ''
    const selectedTags = tagsParam.split(',').filter((tag) => tag.trim())
    const checkIn = searchParams.get('checkIn') || ''
    const checkOut = searchParams.get('checkOut') || ''

    // 构建查询条件
    const whereCondition = {
      status: 'PUBLISHED' as const,
      OR: [
        {
          title: {
            contains: searchKeyword,
          },
        },
        {
          address: {
            contains: searchKeyword,
          },
        },
        {
          tags: {
            contains: searchKeyword,
          },
        },
      ],
    }

    // 查询酒店数据
    let hotels = await prisma.hotel.findMany({
      where: whereCondition,
    })

    // 城市过滤
    if (city) {
      // 更灵活的城市过滤逻辑
      const filteredHotels = hotels.filter((hotel) => {
        // 转换为小写进行不区分大小写的比较
        const hotelAddress = hotel.address.toLowerCase()
        const cityLower = city.toLowerCase()
        // 检查酒店地址是否包含城市名称
        return hotelAddress.includes(cityLower)
      })

      // 如果没有找到匹配的酒店，使用原始的酒店列表
      // 这样即使数据库中没有该城市的酒店，也能显示其他城市的酒店
      hotels = filteredHotels.length > 0 ? filteredHotels : hotels
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      hotels = hotels.filter((hotel) => {
        const hotelTags = hotel.tags.split(',')
        return selectedTags.some((tag) => hotelTags.includes(tag))
      })
    }

    // 排序
    switch (sortBy) {
      case 'price':
        hotels.sort((a, b) => a.price - b.price)
        break
      case 'rating':
        hotels.sort((a, b) => b.score - a.score)
        break
      case 'distance':
        // 模拟距离排序
        hotels.sort(() => Math.random() - 0.5)
        break
      case 'popularity':
      default:
        // 模拟欢迎度排序
        hotels.sort(() => Math.random() - 0.5)
        break
    }

    // 格式化酒店数据
    const formattedHotels = hotels.map((hotel) => {
      // 直接使用酒店的图片 URL
      let imageUrl = hotel.images

      // 确保 imageUrl 是一个有效的字符串
      if (!imageUrl || typeof imageUrl !== 'string') {
        imageUrl =
          'https://cache.marriott.com.cn/content/dam/marriott-renditions/CKGWI/ckgwi-lobby-1481-hor-wide.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=375px:*'
      } else {
        // 清理 imageUrl，移除可能的方括号和多余的引号
        imageUrl = imageUrl.replace(/\[|\]|`|'|"/g, '')
        imageUrl = imageUrl.trim()
      }

      return {
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
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedHotels,
      total: formattedHotels.length,
    })
  } catch (error) {
    console.error('获取酒店列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取酒店列表失败',
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
