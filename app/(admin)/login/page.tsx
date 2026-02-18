'use client'
import { LoginForm, ProFormText } from '@ant-design/pro-components'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { message, Tabs } from 'antd'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()

  interface LoginFormValues {
    username: string
    password: string
  }

  const handleSubmit = async (values: LoginFormValues) => {
    console.log('登录信息:', values)
    message.success('登录成功！(演示：直接跳转到商户页)')
    // 实际逻辑：根据接口返回的角色跳转不同页面
    router.push('/merchant/hotels')
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <LoginForm
          title="易宿酒店管理后台"
          subTitle="B端商户/管理员登录"
          onFinish={handleSubmit}
          submitter={{
            searchConfig: {
              submitText: '登录',
            },
          }}
        >
          <Tabs
            items={[
              {
                key: 'account',
                label: '账号密码登录',
              },
            ]}
          />
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className={'prefixIcon'} />,
            }}
            placeholder={'用户名: admin or merchant'}
            rules={[
              {
                required: true,
                message: '请输入用户名!',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            placeholder={'密码: 123456'}
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <Link href="/register">没有账号？去注册</Link>
          </div>
        </LoginForm>
      </div>
    </div>
  )
}
