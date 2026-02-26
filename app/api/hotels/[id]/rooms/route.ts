import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// 创建prisma客户端实例
const prisma = new PrismaClient()

// 模拟房间数据库
interface Room {
  id: string
  name: string
  description: string
  size: string
  capacity: string
  floors: string
  price: number
  imageUrl: string
  breakfast: boolean
  instantConfirm: boolean
  bedType: string
  freeCancellation: boolean
  selected: boolean
}

const mockRoomsDatabase: Record<string, Room[]> = {
  '1': [
    {
      id: '1',
      name: '智能双床房',
      description: '2张1.2米单人床，智能客控',
      size: '35㎡',
      capacity: '2人住',
      floors: '5-10层',
      price: 318,
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20hotel%20room%20with%20two%20beds&image_size=square',
      breakfast: true,
      instantConfirm: true,
      bedType: '双床',
      freeCancellation: true,
      selected: true,
    },
    {
      id: '2',
      name: '智能大床房',
      description: '1张2米大床，智能客控',
      size: '38㎡',
      capacity: '2人住',
      floors: '5-10层',
      price: 358,
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20hotel%20room%20with%20king%20bed&image_size=square',
      breakfast: true,
      instantConfirm: true,
      bedType: '大床',
      freeCancellation: true,
      selected: false,
    },
  ],
  '2': [
    {
      id: '1',
      name: '海景双床房',
      description: '2张1.2米单人床，海景',
      size: '40㎡',
      capacity: '2人住',
      floors: '3-8层',
      price: 289,
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beach%20hotel%20room%20with%20two%20beds%20and%20ocean%20view&image_size=square',
      breakfast: true,
      instantConfirm: true,
      bedType: '双床',
      freeCancellation: true,
      selected: true,
    },
    {
      id: '2',
      name: '海景大床房',
      description: '1张2米大床，海景',
      size: '42㎡',
      capacity: '2人住',
      floors: '3-8层',
      price: 329,
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beach%20hotel%20room%20with%20king%20bed%20and%20ocean%20view&image_size=square',
      breakfast: true,
      instantConfirm: true,
      bedType: '大床',
      freeCancellation: true,
      selected: false,
    },
  ],
  '3': [
    {
      id: '1',
      name: '豪华双床房',
      description: '2张1.35米单人床，无边泳池景',
      size: '50㎡',
      capacity: '2人住',
      floors: '10-15层',
      price: 858,
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20room%20with%20two%20beds%20and%20pool%20view&image_size=square',
      breakfast: true,
      instantConfirm: true,
      bedType: '双床',
      freeCancellation: true,
      selected: true,
    },
    {
      id: '2',
      name: '豪华大床房',
      description: '1张2.2米大床，无边泳池景',
      size: '55㎡',
      capacity: '2人住',
      floors: '10-15层',
      price: 928,
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20room%20with%20king%20bed%20and%20pool%20view&image_size=square',
      breakfast: true,
      instantConfirm: true,
      bedType: '大床',
      freeCancellation: true,
      selected: false,
    },
  ],
  '4': [
    {
      id: '1',
      name: '海景双床房',
      description: '2张1.2米单人床，海景',
      size: '40㎡',
      capacity: '2人住',
      floors: '3-5层',
      price: 268,
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=seaview%20homestay%20room%20with%20two%20beds&image_size=square',
      breakfast: false,
      instantConfirm: true,
      bedType: '双床',
      freeCancellation: true,
      selected: true,
    },
    {
      id: '2',
      name: '海景大床房',
      description: '1张2米大床，海景',
      size: '42㎡',
      capacity: '2人住',
      floors: '3-5层',
      price: 298,
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=seaview%20homestay%20room%20with%20king%20bed&image_size=square',
      breakfast: false,
      instantConfirm: true,
      bedType: '大床',
      freeCancellation: true,
      selected: false,
    },
  ],
  '5': [
    {
      id: '1',
      name: '豪华双床房',
      description: '2张1.35米单人床，水族馆景',
      size: '60㎡',
      capacity: '2人住',
      floors: '5-15层',
      price: 1988,
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20resort%20room%20with%20two%20beds%20and%20aquarium%20view&image_size=square',
      breakfast: true,
      instantConfirm: true,
      bedType: '双床',
      freeCancellation: true,
      selected: true,
    },
    {
      id: '2',
      name: '豪华大床房',
      description: '1张2.2米大床，水族馆景',
      size: '65㎡',
      capacity: '2人住',
      floors: '5-15层',
      price: 2188,
      imageUrl:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20resort%20room%20with%20king%20bed%20and%20aquarium%20view&image_size=square',
      breakfast: true,
      instantConfirm: true,
      bedType: '大床',
      freeCancellation: true,
      selected: false,
    },
  ],
}

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params

    // 从数据库中查询房间信息
    const dbRooms = await prisma.room.findMany({
      where: {
        hotelId: parseInt(id),
      },
    })

    // 将数据库房间信息转换为前端需要的格式
    let rooms = dbRooms.map((room) => ({
      id: room.id.toString(),
      name: room.title,
      description: room.title.includes('双床') ? '2张1.2米单人床' : '1张2米大床',
      size: '35㎡',
      capacity: '2人住',
      floors: '5-15层',
      price: room.price,
      imageUrl:
        room.images ||
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20room%20${room.title}&image_size=square`,
      breakfast: true,
      instantConfirm: true,
      bedType: room.title.includes('双床') ? '双床' : '大床',
      freeCancellation: true,
      selected: false,
    }))

    // 如果没有找到对应的房间信息，返回默认房间信息
    if (rooms.length === 0) {
      rooms = [
        {
          id: '1',
          name: '标准双床房',
          description: '2张1.2米单人床',
          size: '35㎡',
          capacity: '2人住',
          floors: '5-15层',
          price: 936,
          imageUrl:
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=standard%20hotel%20room%20with%20two%20beds&image_size=square',
          breakfast: true,
          instantConfirm: true,
          bedType: '双床',
          freeCancellation: true,
          selected: true,
        },
        {
          id: '2',
          name: '标准大床房',
          description: '1张2米大床',
          size: '38㎡',
          capacity: '2人住',
          floors: '5-15层',
          price: 988,
          imageUrl:
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=standard%20hotel%20room%20with%20king%20bed&image_size=square',
          breakfast: true,
          instantConfirm: true,
          bedType: '大床',
          freeCancellation: true,
          selected: false,
        },
      ]
    }

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('获取酒店房间信息失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取酒店房间信息失败',
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
