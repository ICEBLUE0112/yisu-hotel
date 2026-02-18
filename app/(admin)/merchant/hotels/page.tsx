'use client'
import React, { useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import {
  ProTable,
  ModalForm,
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components'
import { Button, message } from 'antd'

// 定义酒店数据类型
type HotelItem = {
  id: number
  title: string
  address: string
  price: number
  star: number
  status: string
  createdAt: string
}

// 模拟数据
const mockData: HotelItem[] = [
  {
    id: 1,
    title: '上海陆家嘴禧玥酒店',
    address: '上海浦东新区',
    price: 900,
    star: 5,
    status: 'PUBLISHED', // 已发布
    createdAt: '2026-02-15 10:00:00',
  },
  {
    id: 2,
    title: '北京王府井希尔顿',
    address: '北京东城区',
    price: 1200,
    star: 5,
    status: 'PENDING', // 审核中
    createdAt: '2026-02-16 12:00:00',
  },
  {
    id: 3,
    title: '某快捷酒店',
    address: '上海徐汇区',
    price: 200,
    star: 3,
    status: 'REJECTED', // 审核不通过
    createdAt: '2026-02-17 09:00:00',
  },
]

export default function MerchantHotelsPage() {
  const actionRef = React.useRef<ActionType>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const columns: ProColumns<HotelItem>[] = [
    {
      title: '酒店名称',
      dataIndex: 'title',
      copyable: true,
      ellipsis: true,
      formItemProps: {
        rules: [{ required: true, message: '此项为必填项' }],
      },
    },
    {
      title: '地址',
      dataIndex: 'address',
      ellipsis: true,
      search: false,
    },
    {
      title: '星级',
      dataIndex: 'star',
      valueType: 'rate',
      search: false,
    },
    {
      title: '起步价 (元)',
      dataIndex: 'price',
      valueType: 'money',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        PENDING: { text: '审核中', status: 'Processing' },
        PUBLISHED: { text: '已发布', status: 'Success' },
        REJECTED: { text: '未通过', status: 'Error' },
        OFFLINE: { text: '已下线', status: 'Default' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      editable: false,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          type="link"
          key="editable"
          onClick={() => {
            setModalVisible(true)
            // 这里记得把当前行数据 record 填入表单，现在你还没做这一步
          }}
          size="small"
          style={{ padding: 0 }}
        >
          编辑
        </Button>,
        record.status === 'PUBLISHED' && (
          <a key="offline" className="text-red-500">
            申请下线
          </a>
        ),
      ],
    },
  ]

  return (
    <>
      <ProTable<HotelItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async () => {
          // 模拟请求
          return {
            data: mockData,
            success: true,
            total: mockData.length,
          }
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        headerTitle="我的酒店列表"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setModalVisible(true)}
          >
            录入新酒店
          </Button>,
        ]}
      />

      <ModalForm
        title="录入新酒店"
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={async (values) => {
          message.success('提交成功')
          console.log(values)
          return true
        }}
      >
        <ProFormText
          width="md"
          name="title"
          label="酒店名称"
          placeholder="请输入酒店名称"
          rules={[{ required: true, message: '这是必填项' }]}
        />
        <ProFormText width="md" name="address" label="酒店地址" placeholder="请输入地址" />
        <ProFormDigit width="sm" name="price" label="起步价" placeholder="请输入价格" min={0} />
        <ProFormSelect
          width="xs"
          options={[
            { value: 3, label: '3星' },
            { value: 4, label: '4星' },
            { value: 5, label: '5星' },
          ]}
          name="star"
          label="星级"
        />
        <ProFormTextArea name="description" label="酒店描述" placeholder="请输入酒店简介" />
      </ModalForm>
    </>
  )
}
