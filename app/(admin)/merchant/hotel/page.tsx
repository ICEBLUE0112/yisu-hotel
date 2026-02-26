'use client'

import React, { useRef, useState } from 'react'
import {
  PageContainer,
  ProTable,
  ActionType,
  ProColumns,
  DrawerForm,
  ProFormText,
  ProFormDigit,
  ProFormRate,
  ProFormDatePicker,
  ProFormList,
  ProFormGroup,
  ProFormTextArea,
  ProFormSelect,
} from '@ant-design/pro-components'
import { message, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

// 定义表格数据类型
type HotelItem = {
  id: number
  title: string
  address: string
  price: number
  star: number
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'OFFLINE'
  rejectReason?: string
  tags?: string // 数据库中是 JSON 字符串
}

export default function MerchantHotelPage() {
  const [messageApi, contextHolder] = message.useMessage()
  const actionRef = useRef<ActionType>(undefined)

  // 控制编辑抽屉的显示与数据回显
  const [editVisible, setEditVisible] = useState(false)
  const [currentRow, setCurrentRow] = useState<HotelItem | null>(null)

  // 处理【新增酒店】表单提交
  const handleFinish = async (values: Record<string, unknown>) => {
    try {
      messageApi.loading({ content: '正在保存酒店信息...', key: 'save' })
      const userId = localStorage.getItem('userId')

      const response = await fetch('/api/hotel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, merchantId: Number(userId) }),
      })

      if (response.ok) {
        messageApi.success({ content: '录入成功！系统已提交审核。', key: 'save' })
        actionRef.current?.reload() // 提交成功后自动刷新表格数据
        return true
      } else {
        const errorData = await response.json()
        messageApi.error({ content: errorData.message || '保存失败', key: 'save' })
        return false
      }
    } catch {
      messageApi.error({ content: '网络错误，请重试！', key: 'save' })
      return false
    }
  }

  // 处理【修改酒店】表单提交
  const handleEditFinish = async (values: Record<string, unknown>) => {
    try {
      messageApi.loading({ content: '正在更新...', key: 'update' })
      const userId = localStorage.getItem('userId')

      const response = await fetch('/api/hotel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          id: currentRow?.id,
          merchantId: Number(userId),
        }),
      })

      if (response.ok) {
        messageApi.success({ content: '修改成功，已重新提交审核！', key: 'update' })
        setEditVisible(false) // 关闭抽屉
        actionRef.current?.reload() // 刷新表格
        return true
      } else {
        const errorData = await response.json()
        messageApi.error({ content: errorData.message || '更新失败', key: 'update' })
        return false
      }
    } catch {
      messageApi.error({ content: '网络错误，请重试！', key: 'update' })
      return false
    }
  }

  // 表格列定义
  const columns: ProColumns<HotelItem>[] = [
    { title: '酒店名称', dataIndex: 'title', width: '20%' },
    { title: '地址', dataIndex: 'address', width: '25%', search: false },
    { title: '起步价(元)', dataIndex: 'price', width: '10%', search: false },
    {
      title: '当前状态',
      dataIndex: 'status',
      width: '15%',
      valueEnum: {
        PENDING: { text: '审核中', status: 'Processing' },
        PUBLISHED: { text: '已发布 (线上可见)', status: 'Success' },
        REJECTED: { text: '被驳回', status: 'Error' },
        OFFLINE: { text: '已下线', status: 'Default' },
      },
    },
    {
      title: '审核反馈',
      dataIndex: 'rejectReason',
      search: false,
      render: (_, record) =>
        record.status === 'REJECTED' && record.rejectReason ? (
          <span className="text-red-500 text-sm">驳回原因：{record.rejectReason}</span>
        ) : (
          '-'
        ),
    },
    {
      title: '操作',
      valueType: 'option',
      width: '10%',
      render: (text, record) => [
        <a
          key="edit"
          className="text-blue-600 cursor-pointer"
          onClick={() => {
            // 将 JSON 字符串的 tags 转回数组，以便表单中的 Select 组件能正确回显
            const formattedRecord = {
              ...record,
              tags: record.tags && record.tags !== '[]' ? JSON.parse(record.tags) : [],
            }
            setCurrentRow(formattedRecord)
            setEditVisible(true)
          }}
        >
          修改信息
        </a>,
      ],
    },
  ]

  return (
    <PageContainer title="我的酒店管理" subTitle="管理您录入的酒店并查看审核状态">
      {contextHolder}

      {/* 1. 酒店状态列表 */}
      <ProTable<HotelItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        rowKey="id"
        request={async (params) => {
          // 获取当前登录的真实商户 ID 进行数据隔离
          const userId = localStorage.getItem('userId')
          const res = await fetch(`/api/merchant/hotel?merchantId=${userId}`)
          const result = await res.json()
          let filteredData = result.data || []
          if (params.status) {
            filteredData = filteredData.filter((item: HotelItem) => item.status === params.status)
          }
          return { data: filteredData, success: result.success, total: filteredData.length }
        }}
        search={false}
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [
          // 2. 新增酒店的抽屉表单
          <DrawerForm
            key="add"
            title="新增酒店录入"
            trigger={
              <Button type="primary">
                <PlusOutlined /> 新增酒店
              </Button>
            }
            onFinish={handleFinish}
            drawerProps={{ destroyOnClose: true }}
            initialValues={{
              star: 3,
              status: 'PENDING',
              rooms: [{ title: '标准双床房', price: 200, stock: 10 }],
            }}
          >
            <ProFormGroup title="酒店基础信息 (必填)">
              <ProFormText name="title" label="酒店名称" rules={[{ required: true }]} width="md" />
              <ProFormText
                name="address"
                label="详细地址"
                rules={[{ required: true }]}
                width="md"
              />
              <ProFormDatePicker
                name="openingTime"
                label="开业时间"
                rules={[{ required: true }]}
                width="sm"
              />
              <ProFormDigit
                name="price"
                label="起步价 (元)"
                rules={[{ required: true }]}
                width="sm"
                fieldProps={{ min: 0 }}
              />
            </ProFormGroup>

            <ProFormGroup>
              <ProFormRate name="star" label="酒店星级" rules={[{ required: true }]} />
            </ProFormGroup>

            <h3 className="text-base font-medium mt-6 mb-4">房型与库存管理 (必填)</h3>
            <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
              <ProFormList
                name="rooms"
                creatorButtonProps={{ position: 'bottom', creatorButtonText: '新增房型' }}
              >
                <ProFormGroup>
                  <ProFormText
                    name="title"
                    label="房型名称"
                    rules={[{ required: true }]}
                    width="sm"
                  />
                  <ProFormDigit
                    name="price"
                    label="单晚价格(元)"
                    rules={[{ required: true }]}
                    width="sm"
                    fieldProps={{ min: 0 }}
                  />
                  <ProFormDigit
                    name="stock"
                    label="每日库存(间)"
                    rules={[{ required: true }]}
                    width="sm"
                    fieldProps={{ min: 0 }}
                  />
                </ProFormGroup>
              </ProFormList>
            </div>

            <ProFormGroup title="附加营销信息 (选填)">
              <ProFormSelect
                name="tags"
                label="酒店标签 / 优惠活动"
                mode="tags"
                width="md"
                options={[
                  { label: '免费停车场', value: '免费停车场' },
                  { label: '含双早', value: '含双早' },
                  { label: '春节特惠', value: '春节特惠' },
                  { label: '亲子首选', value: '亲子首选' },
                ]}
              />
              <ProFormTextArea
                name="description"
                label="周边介绍"
                width="xl"
                fieldProps={{ rows: 4 }}
              />
            </ProFormGroup>
          </DrawerForm>,
        ]}
      />

      {/* 3. 修改酒店的专属抽屉表单（与新增表单类似，但绑定了 initialValues 用于回显） */}
      <DrawerForm
        title="修改酒店信息"
        open={editVisible}
        onOpenChange={setEditVisible}
        onFinish={handleEditFinish}
        drawerProps={{ destroyOnClose: true }} // 每次关闭销毁，保证回显数据是最新的
        initialValues={currentRow || {}}
      >
        <ProFormGroup title="酒店基础信息 (必填)">
          <ProFormText name="title" label="酒店名称" rules={[{ required: true }]} width="md" />
          <ProFormText name="address" label="详细地址" rules={[{ required: true }]} width="md" />
          <ProFormDatePicker
            name="openingTime"
            label="开业时间"
            rules={[{ required: true }]}
            width="sm"
          />
          <ProFormDigit
            name="price"
            label="起步价 (元)"
            rules={[{ required: true }]}
            width="sm"
            fieldProps={{ min: 0 }}
          />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormRate name="star" label="酒店星级" rules={[{ required: true }]} />
        </ProFormGroup>

        <h3 className="text-base font-medium mt-6 mb-4">房型与库存管理 (必填)</h3>
        <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
          <ProFormList
            name="rooms"
            creatorButtonProps={{ position: 'bottom', creatorButtonText: '新增房型' }}
          >
            <ProFormGroup>
              <ProFormText name="title" label="房型名称" rules={[{ required: true }]} width="sm" />
              <ProFormDigit
                name="price"
                label="单晚价格(元)"
                rules={[{ required: true }]}
                width="sm"
                fieldProps={{ min: 0 }}
              />
              <ProFormDigit
                name="stock"
                label="每日库存(间)"
                rules={[{ required: true }]}
                width="sm"
                fieldProps={{ min: 0 }}
              />
            </ProFormGroup>
          </ProFormList>
        </div>

        <ProFormGroup title="附加营销信息 (选填)">
          <ProFormSelect
            name="tags"
            label="酒店标签 / 优惠活动"
            mode="tags"
            width="md"
            options={[
              { label: '免费停车场', value: '免费停车场' },
              { label: '含双早', value: '含双早' },
              { label: '春节特惠', value: '春节特惠' },
              { label: '亲子首选', value: '亲子首选' },
            ]}
          />
          <ProFormTextArea
            name="description"
            label="周边介绍"
            width="xl"
            fieldProps={{ rows: 4 }}
          />
        </ProFormGroup>
      </DrawerForm>
    </PageContainer>
  )
}
