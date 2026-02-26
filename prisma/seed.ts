// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. 创建一个商户
  const merchant = await prisma.user.upsert({
    where: { username: 'merchant_01' },
    update: {},
    create: {
      username: 'merchant_01',
      password: '123', // 实际项目中记得加密
      role: 'MERCHANT',
    },
  })

  // 2. 创建一个酒店
  await prisma.hotel.create({
    data: {
      title: '上海陆家嘴禧玥酒店',
      address: '上海浦东新区',
      price: 90000, // 900元，单位分
      merchantId: merchant.id,
      images: JSON.stringify(['https://your-image-url.com/1.jpg']),
      tags: JSON.stringify(['亲子', '地铁周边']),
      status: 'PUBLISHED',
      rooms: {
        create: [
          { title: '豪华大床房', price: 90000, stock: 5 },
          { title: '行政双床房', price: 120000, stock: 3 },
        ],
      },
    },
  })
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
