'use client'

import React, { useRef, useState } from 'react'
import {
  PageContainer,
  ProTable,
  ActionType,
  ProColumns,
  ModalForm,
  ProFormTextArea,
} from '@ant-design/pro-components'
import { message, Button, Space, Popconfirm, Tag } from 'antd'

// 定义酒店数据类型
type HotelItem = {
  id: number
  title: string
  address: string
  price: number
  star: number
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'OFFLINE'
  rejectReason?: string
  merchant?: { username: string }
}

export default function AdminHotelListPage() {
  const [messageApi, contextHolder] = message.useMessage()
  const actionRef = useRef<ActionType | undefined>(undefined)

  // 控制驳回弹窗
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<HotelItem | null>(null)

  // 统一的状态更新请求函数
  const handleUpdateStatus = async (id: number, status: string, rejectReason?: string) => {
    try {
      const res = await fetch('/api/admin/hotel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, rejectReason }),
      })
      const data = await res.json()
      if (data.success) {
        messageApi.success('操作成功！')
        actionRef.current?.reload() // 刷新表格
        return true
      } else {
        messageApi.error(data.message || '操作失败')
        return false
      }
    } catch {
      messageApi.error('网络错误，请重试')
      return false
    }
  }

  // 表格列定义
  const columns: ProColumns<HotelItem>[] = [
    {
      title: '酒店名称',
      dataIndex: 'title',
      width: '15%',
    },
    {
      title: '提交商户',
      dataIndex: ['merchant', 'username'],
      width: '10%',
      search: false,
    },
    {
      title: '起步价(元)',
      dataIndex: 'price',
      width: '10%',
      search: false,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      width: '15%',
      // 使用 valueEnum 自动渲染带颜色的状态徽标和筛选下拉框
      valueEnum: {
        PENDING: { text: '审核中', status: 'Processing' },
        PUBLISHED: { text: '已发布', status: 'Success' },
        REJECTED: { text: '审核不通过', status: 'Error' },
        OFFLINE: { text: '已下线', status: 'Default' },
      },
    },
    {
      title: '驳回原因',
      dataIndex: 'rejectReason',
      search: false,
      render: (_, record) =>
        record.status === 'REJECTED' && record.rejectReason ? (
          <span className="text-red-500">{record.rejectReason}</span>
        ) : (
          '-'
        ),
    },
    {
      title: '操作',
      valueType: 'option',
      width: '20%',
      render: (text, record) => {
        // 根据不同状态渲染不同的操作按钮
        return (
          <Space>
            {record.status === 'PENDING' && (
              <>
                <Popconfirm
                  title="确认审核通过？"
                  onConfirm={() => handleUpdateStatus(record.id, 'PUBLISHED')}
                >
                  <Button type="link" size="small" className="text-green-600">
                    通过
                  </Button>
                </Popconfirm>
                <Button
                  type="link"
                  size="small"
                  danger
                  onClick={() => {
                    setCurrentRecord(record)
                    setRejectModalVisible(true)
                  }}
                >
                  驳回
                </Button>
              </>
            )}

            {record.status === 'PUBLISHED' && (
              <Popconfirm
                title="确定要下线该酒店吗？"
                description="下线后用户端将无法搜到该酒店"
                onConfirm={() => handleUpdateStatus(record.id, 'OFFLINE')}
              >
                <Button type="link" size="small" danger>
                  强制下线
                </Button>
              </Popconfirm>
            )}

            {/* 满足PDF要求：下线不是虚拟删除，可以被恢复 */}
            {record.status === 'OFFLINE' && (
              <Popconfirm
                title="确认恢复上线？"
                onConfirm={() => handleUpdateStatus(record.id, 'PUBLISHED')}
              >
                <Button type="link" size="small" className="text-blue-600">
                  恢复上线
                </Button>
              </Popconfirm>
            )}

            {record.status === 'REJECTED' && <Tag color="red">需商户修改</Tag>}
          </Space>
        )
      },
    },
  ]

  return (
    <PageContainer title="酒店信息审核管理" subTitle="审核商户提交的酒店，管理上下线状态">
      {contextHolder}
      <ProTable<HotelItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        rowKey="id"
        // 从后端接口获取数据
        request={async (params) => {
          const res = await fetch('/api/admin/hotel')
          const result = await res.json()

          let filteredData = result.data || []

          // 1. 筛选审核状态 (精确匹配)
          if (params.status) {
            filteredData = filteredData.filter((item: HotelItem) => item.status === params.status)
          }

          // 👉 2. 新增：筛选酒店名称 (模糊匹配)
          if (params.title) {
            filteredData = filteredData.filter((item: HotelItem) =>
              item.title.toLowerCase().includes(params.title.toLowerCase()),
            )
          }

          return {
            data: filteredData,
            success: result.success,
            total: filteredData.length,
          }
        }}
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
        }}
      />

      {/* 驳回原因填写的弹窗 */}
      <ModalForm
        title="填写审核不通过原因"
        open={rejectModalVisible}
        onOpenChange={setRejectModalVisible}
        onFinish={async (values) => {
          if (currentRecord) {
            const success = await handleUpdateStatus(
              currentRecord.id,
              'REJECTED',
              values.rejectReason,
            )
            if (success) {
              setRejectModalVisible(false)
              setCurrentRecord(null)
            }
          }
        }}
      >
        <ProFormTextArea
          name="rejectReason"
          label="驳回原因"
          placeholder="请详细说明不通过的原因，以便商户修改..."
          rules={[{ required: true, message: '必须填写驳回原因' }]}
        />
      </ModalForm>
    </PageContainer>
  )
}
