'use client'
import { LoginForm, ProFormText, ProFormSelect } from '@ant-design/pro-components'
import { UserOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons'
import { message } from 'antd'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  interface RegisterFormValues {
    username: string
    password: string
    role: 'MERCHANT' | 'ADMIN'
  }

  const handleSubmit = async (values: RegisterFormValues) => {
    console.log('注册信息:', values)
    message.success('注册成功！请登录')
    router.push('/login')
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-center text-2xl font-bold mb-6 text-gray-800">注册新账户</h2>
        <LoginForm
          submitter={{
            searchConfig: {
              submitText: '注册',
            },
          }}
          onFinish={handleSubmit}
        >
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder={'设置用户名'}
            rules={[{ required: true, message: '请输入用户名' }]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={'设置密码'}
            rules={[{ required: true, message: '请输入密码' }]}
          />
          <ProFormSelect
            name="role"
            fieldProps={{
              size: 'large',
            }}
            options={[
              { value: 'MERCHANT', label: '我是商户 (主要用于发布酒店)' },
              { value: 'ADMIN', label: '我是管理员 (主要用于审核)' },
            ]}
            placeholder="请选择您的角色"
            rules={[{ required: true, message: '请选择角色' }]}
          />

          <div className="mb-6 text-right">
            <Link href="/login">已有账号？去登录</Link>
          </div>
        </LoginForm>
      </div>
    </div>
  )
}
