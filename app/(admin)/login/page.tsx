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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* 👉 新增：必须把 contextHolder 放在组件渲染树中，这样弹窗才能正常挂载并获取上下文 */}
      {contextHolder}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">易宿酒店管理平台</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm
            logo="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
            title="易宿 (Yisu Hotel)"
            subTitle="致力于提供高效、便捷的酒店预订与管理服务"
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
