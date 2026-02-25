import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ message: '账号和密码不能为空' }, { status: 400 })
    }

    // 去数据库查询该用户
    const user = await prisma.user.findUnique({
      where: { username },
    })

    // 校验账号是否存在以及密码是否正确
    if (!user || user.password !== password) {
      return NextResponse.json({ message: '账号或密码错误' }, { status: 401 })
    }

    // 登录成功，返回不包含密码的用户信息（包含 role）
    return NextResponse.json(
      {
        message: '登录成功',
        user: {
          id: user.id,
          username: user.username,
          role: user.role, // 这里是关键：将数据库中的角色返回给前端
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('登录接口报错:', error)
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 })
  }
}
