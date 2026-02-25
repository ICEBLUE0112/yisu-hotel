import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // 获取前端传过来的表单数据
    const body = await request.json()
    const { username, password, role } = body

    if (!username || !password) {
      return NextResponse.json({ message: '账号和密码不能为空' }, { status: 400 })
    }

    // 1. 检查数据库中是否已经存在该用户名
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json({ message: '该用户名已被注册，请更换一个' }, { status: 400 })
    }

    // 2. 将新用户保存到数据库中
    // 注意：在真实的商业项目中，这里的 password 必须经过加密（如 bcrypt）后才能存入数据库！
    // 为了当前大作业快速跑通，我们暂时直接存入。
    const newUser = await prisma.user.create({
      data: {
        username,
        password,
        role: role || 'MERCHANT',
      },
    })

    return NextResponse.json(
      { message: '注册成功', user: { id: newUser.id, username: newUser.username } },
      { status: 201 },
    )
  } catch (error) {
    console.error('注册接口报错:', error)
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 })
  }
}
