// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. 创建一个商户
  const merchant = await prisma.user.upsert({
    where: { username: 'merchant_02' },
    update: {},
    create: {
      username: 'merchant_02',
      password: '123', // 实际项目中记得加密
      role: 'MERCHANT',
    },
  })

  // 2. 创建多个酒店
  await prisma.hotel.createMany({
    data: [
      {
        title: 'Sniff·思耐酒店（重庆观音桥步行街观音桥地铁站店）',
        address: '重庆两江新区观音桥街道建新东路15号七环大厦',
        price: 300,
        score: 4.5,
        star: 4,
        merchantId: merchant.id,
        images: 'https://dimg04.c-ctrip.com/images/0202s1200093m0gu9B280_W_1280_853_R5_Q70.jpg',
        tags: '地铁周边,近观音桥,免费停车',
        status: 'PUBLISHED',
      },
      {
        title: '重庆NASITING·纳斯汀酒店（解放碑洪崖洞店）',
        address: '重庆渝中区解放碑街道民族路101号商务楼第十三层',
        price: 472,
        score: 4.8,
        star: 5,
        merchantId: merchant.id,
        images: 'https://dimg04.c-ctrip.com/images/1mc4r12000qfzd58aCE9E_W_1280_853_R5_Q70.jpg',
        tags: '商务出行,高空观景,健身中心,免费WiFi',
        status: 'PUBLISHED',
      },
      {
        title: '重庆解放碑八一广场亚朵酒店',
        address: '重庆渝中区较场口85号',
        price: 499,
        score: 4.7,
        star: 5,
        merchantId: merchant.id,
        images: 'https://dimg04.c-ctrip.com/images/0206w1200098pclpwDCCD_W_1280_853_R5_Q70.jpg',
        tags: '近解放碑步行街,洪崖洞,亲子',
        status: 'PUBLISHED',
      },
      {
        title: '重庆江岛假日高空酒店（解放碑洪崖洞店）',
        address: '重庆渝中区新华路222号申基金融广场1楼',
        price: 719, // 1000元，单位分
        score: 4.8,
        star: 5,
        merchantId: merchant.id,
        images: 'https://dimg04.c-ctrip.com/images/1mc2r12000eranpuu60D4_W_1280_853_R5_Q70.jpg',
        tags: '近解放碑步行街,购物便利,健身中心,免费WiFi',
        status: 'PUBLISHED',
      },
      {
        title: '重庆SKLP新光里城际酒店',
        address: '重庆两江新区嘉州路90号',
        price: 450,
        score: 4.9,
        star: 4,
        merchantId: merchant.id,
        images: 'https://dimg04.c-ctrip.com/images/1mc0412000qw1emiuFDA8_W_1280_853_R5_Q70.jpg',
        tags: '亲子,地铁周边,旅游出行,免费停车',
        status: 'PUBLISHED',
      },
    ],
  })

  // 3. 为每个酒店创建房间
  const hotels = await prisma.hotel.findMany({})
  for (const hotel of hotels) {
    await prisma.room.createMany({
      data: [
        {
          title: '豪华大床房',
          price: hotel.price,
          stock: 5,
          hotelId: hotel.id,
        },
        {
          title: '行政双床房',
          price: Math.floor(hotel.price * 1.2),
          stock: 3,
          hotelId: hotel.id,
        },
      ],
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
