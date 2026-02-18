'use client'
import React from 'react'
import { ProLayout } from '@ant-design/pro-components'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogoutOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // 简单的路由判断，实际项目中应根据用户角色动态生成菜单
  // 这里为了静态演示，混合了商户和管理员的菜单
  const route = {
    path: '/',
    routes: [
      {
        path: '/merchant/hotels',
        name: '酒店管理 (商户)',
        icon: 'Hp',
      },
      {
        path: '/admin/audit',
        name: '审核管理 (管理员)',
        icon: 'Audit',
      },
    ],
  }

  // 登录/注册页面不显示 Layout
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>
  }

  return (
    <ProLayout
      title="易宿酒店管理系统"
      logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
      location={{ pathname }}
      route={route}
      menuItemRender={(item, dom) => <Link href={item.path || '/'}>{dom}</Link>}
      avatarProps={{
        src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        title: '测试用户',
        render: (props, dom) => {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: '退出登录',
                    onClick: () => router.push('/login'),
                  },
                ],
              }}
            >
              {dom}
            </Dropdown>
          )
        },
      }}
    >
      {children}
    </ProLayout>
  )
}
