'use client'

import React, { useState } from 'react'
import { LoginForm, ProFormText, ProFormRadio } from '@ant-design/pro-components'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { message, Tabs } from 'antd'
import { useRouter } from 'next/navigation'

type LoginType = 'login' | 'register'

export default function AdminLoginPage() {
  const [loginType, setLoginType] = useState<LoginType>('login')
  const router = useRouter()

  // 👉 新增：使用 useMessage 钩子获取 messageApi 和 contextHolder
  const [messageApi, contextHolder] = message.useMessage()

  const handleSubmit = async (values: {
    username: string
    password: string
    confirmPassword?: string
    role?: 'merchant' | 'admin'
  }) => {
    try {
      // 在 app/(admin)/login/page.tsx 的 handleSubmit 中修改：

      if (loginType === 'login') {
        // === 真实的登录请求逻辑 ===
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: values.username,
            password: values.password,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          messageApi.success('登录成功！正在为您跳转...')

          // 👉 新增：将用户信息存入本地浏览器缓存
          localStorage.setItem('userRole', data.user.role.toUpperCase()) // 统一转成大写方便判断
          localStorage.setItem('username', data.user.username)
          localStorage.setItem('userId', data.user.id.toString())

          setTimeout(() => {
            if (data.user.role.toUpperCase() === 'ADMIN') {
              router.push('/admin/hotel')
            } else {
              router.push('/merchant/hotel')
            }
          }, 1000)
        } else {
          messageApi.error(data.message || '登录失败，请检查账号密码')
        }
      } else {
        if (values.password !== values.confirmPassword) {
          // 👉 修改：将 message.error 改为 messageApi.error
          messageApi.error('两次输入的密码不一致！')
          return
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: values.username,
            password: values.password,
            role: values.role,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          messageApi.success('注册成功，请登录！')
          setLoginType('login')
        } else {
          messageApi.error(data.message || '注册失败')
        }
      }
    } catch {
      messageApi.error(`${loginType === 'login' ? '登录' : '注册'}请求失败，请检查网络！`)
    }
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* 👉 我们在这里完全自定义居中的头部信息 */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        {/* 使用本地的地球图标，严格居中并控制大小 */}
        <img
          src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
          alt="Yisu Logo"
          className="h-14 w-14 mb-4"
        />
        <h2 className="text-center text-3xl font-extrabold text-gray-900">易宿酒店管理平台</h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          致力于提供高效、便捷的酒店预订与管理服务
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 overflow-hidden">
          <LoginForm
            // 👉 删除了自带的 logo, title, subTitle，使用我们上方自定义的排版
            contentStyle={{ width: '100%', minWidth: '100%' }}
            submitter={{
              searchConfig: {
                submitText: loginType === 'login' ? '登录' : '注册',
              },
            }}
            onFinish={handleSubmit}
          >
            <Tabs
              activeKey={loginType}
              onChange={(key) => setLoginType(key as LoginType)}
              centered
              items={[
                { key: 'login', label: '账户登录' },
                { key: 'register', label: '新用户注册' },
              ]}
            />

            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={'prefixIcon'} />,
              }}
              placeholder="请输入用户名/账号"
              rules={[{ required: true, message: '请输入用户名!' }]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={'prefixIcon'} />,
              }}
              placeholder="请输入密码"
              rules={[{ required: true, message: '请输入密码！' }]}
            />

            {loginType === 'register' && (
              <>
                <ProFormText.Password
                  name="confirmPassword"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className={'prefixIcon'} />,
                  }}
                  placeholder="请确认密码"
                  rules={[{ required: true, message: '请再次输入密码！' }]}
                />
                <ProFormRadio.Group
                  name="role"
                  label="选择您的角色"
                  initialValue="merchant"
                  options={[
                    { label: '酒店商户', value: 'merchant' },
                    { label: '系统管理员', value: 'admin' },
                  ]}
                  rules={[{ required: true, message: '请选择您的角色！' }]}
                />
              </>
            )}
          </LoginForm>
        </div>
      </div>
    </div>
  )
}
