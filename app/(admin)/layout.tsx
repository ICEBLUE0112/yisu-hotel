'use client'

import React, { useEffect, useState } from 'react'
import { ProLayout } from '@ant-design/pro-components'
import { usePathname, useRouter } from 'next/navigation'
import { Dropdown } from 'antd'
import { HomeOutlined, CheckCircleOutlined, LogoutOutlined } from '@ant-design/icons'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // 状态：保存当前登录的用户名和角色
  const [username, setUsername] = useState<string>('加载中...')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false) // 解决 Next.js SSR 渲染闪烁问题

  useEffect(() => {
    // 如果是登录页，不需要进行权限校验
    if (pathname === '/login') {
      // 登录页不需要权限校验，直接标记为 ready，避免在 effect 中同步调用 setState
      queueMicrotask(() => setIsReady(true))
      return
    }

    // 1. 获取本地缓存的用户信息
    const role = localStorage.getItem('userRole')
    const name = localStorage.getItem('username')

    // 2. 登录拦截：如果没有角色信息，说明没登录，踢回登录页
    if (!role) {
      router.replace('/login')
      return
    }

    queueMicrotask(() => setUserRole(role))
    queueMicrotask(() => name && setUsername(name))

    // 3. 越权拦截：防止商户访问 /admin，防止管理员访问 /merchant
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      router.replace('/login')
      return
    }
    if (pathname.startsWith('/merchant') && role !== 'MERCHANT') {
      router.replace('/login')
      return
    }

    queueMicrotask(() => setIsReady(true))
  }, [pathname, router])

  // 登录页直接返回纯净界面
  if (pathname === '/login') {
    return <>{children}</>
  }

  // 还没挂载完或者正在拦截中，暂时不渲染页面内容（避免闪现违规页面）
  if (!isReady) return null

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <ProLayout
        title="易宿管理后台"
        logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
        layout="mix"
        location={{ pathname }}
        // 顶部头像配置
        avatarProps={{
          src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
          size: 'small',
          title: username, // 👉 动态显示真实的用户名
          render: (props, dom) => {
            return (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: '退出登录',
                      onClick: () => {
                        // 👉 新增：退出时清除本地缓存
                        localStorage.removeItem('userRole')
                        localStorage.removeItem('username')
                        router.push('/login')
                      },
                    },
                  ],
                }}
              >
                <div className="cursor-pointer">{dom}</div>
              </Dropdown>
            )
          },
        }}
        // 👉 动态菜单配置：根据角色返回不同的菜单项
        menu={{
          request: async () => {
            const menus = []

            if (userRole === 'MERCHANT') {
              menus.push({
                path: '/merchant/hotel',
                name: '我的酒店管理',
                icon: <HomeOutlined />,
              })
            }

            if (userRole === 'ADMIN') {
              menus.push({
                path: '/admin/hotel',
                name: '酒店审核管理',
                icon: <CheckCircleOutlined />,
              })
            }

            return menus
          },
        }}
        menuItemRender={(item, dom) => (
          <div onClick={() => item.path && router.push(item.path)}>{dom}</div>
        )}
      >
        <div style={{ minHeight: 'calc(100vh - 120px)' }}>{children}</div>
      </ProLayout>
    </div>
  )
}
