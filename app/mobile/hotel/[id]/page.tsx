'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// 定义数据类型
interface Room {
  id: number
  title: string
  price: number
  stock: number
}

interface HotelDetail {
  id: number
  title: string
  address: string
  description: string
  score: number
  star: number
  tags: string
  rooms: Room[] // 包含房型数组
}

export default function HotelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string

  const [hotel, setHotel] = useState<HotelDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hotelId) return

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/public/hotel/${hotelId}`)
        const result = await res.json()
        if (result.success) {
          setHotel(result.data)
        } else {
          alert(result.message || '获取详情失败')
        }
      } catch (error) {
        console.error('拉取详情错误:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [hotelId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        正在加载酒店信息...
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-gray-400 mb-4">找不到该酒店的信息</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm"
        >
          返回上一页
        </button>
      </div>
    )
  }

  // 解析标签
  let tagsArray: string[] = []
  try {
    tagsArray = JSON.parse(hotel.tags || '[]')
  } catch (e) {}

  return (
    <div className="min-h-screen bg-gray-100 pb-10 max-w-md mx-auto relative">
      {/* 顶部悬浮返回按钮 */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
      >
        ←
      </button>

      {/* 酒店顶部大图 (这里暂用网图代替) */}
      <div className="w-full h-64 bg-gray-200 relative">
        <img
          src="https://img95.699pic.com/photo/50048/1095.jpg_wh860.jpg"
          alt={hotel.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          查看图库
        </div>
      </div>

      {/* 酒店基础信息卡片 */}
      <div className="bg-white px-4 py-4 rounded-b-2xl shadow-sm mb-3 relative -mt-4 z-10">
        <h1 className="text-xl font-bold text-gray-900 leading-tight mb-2">{hotel.title}</h1>

        <div className="flex items-center space-x-2 mb-3">
          <span className="text-blue-600 font-bold text-lg">
            {hotel.score || 4.5} <span className="text-xs font-normal">分</span>
          </span>
          <span className="text-blue-600 text-xs bg-blue-50 px-1 py-0.5 rounded">棒极了</span>
          <span className="text-gray-400 text-sm pl-2">| {hotel.star}星级酒店</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {tagsArray.map((tag, i) => (
            <span
              key={i}
              className="text-xs border border-blue-200 text-blue-600 px-1.5 py-0.5 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-start justify-between bg-gray-50 p-2.5 rounded-lg">
          <div className="text-sm text-gray-700 pr-4">
            <span className="font-medium mr-1">📍 地址：</span>
            {hotel.address}
          </div>
          <div className="text-blue-500 text-xs font-medium whitespace-nowrap">地图/导航 &gt;</div>
        </div>
      </div>

      {/* 酒店介绍 */}
      {hotel.description && (
        <div className="bg-white px-4 py-4 mb-3 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-2">酒店介绍</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{hotel.description}</p>
        </div>
      )}

      {/* 👉 房型列表预订区 */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">房型预订</h2>

        {hotel.rooms && hotel.rooms.length > 0 ? (
          <div className="space-y-4">
            {hotel.rooms.map((room) => (
              <div
                key={room.id}
                className="flex border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                {/* 房型图片占位 */}
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 mr-3 overflow-hidden">
                  <img
                    src="https://th.bing.com/th/id/OIP.AksgwrrEt7b4N2F27rvyIgHaEl?w=202&h=128&c=8&rs=1&qlt=90&o=6&cb=defcachec1&dpr=2&pid=3.1&rm=2"
                    alt="room"
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>

                {/* 房型信息 */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{room.title}</h3>
                    <div className="text-xs text-gray-500 mt-1 space-x-2">
                      <span>大床/双床</span>
                      <span>2人入住</span>
                      <span>包含早餐</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    <div className="text-red-500 font-bold">
                      <span className="text-xs">¥</span>
                      <span className="text-xl">{room.price}</span>
                    </div>
                    {room.stock > 0 ? (
                      <div className="flex flex-col items-center">
                        <button
                          className="bg-orange-500 text-white text-sm font-medium px-5 py-1.5 rounded-md active:bg-orange-600"
                          onClick={() => alert(`准备预订：${room.title}\n功能开发中...`)}
                        >
                          预订
                        </button>
                        {room.stock < 5 && (
                          <span className="text-[10px] text-red-500 mt-0.5">
                            仅剩{room.stock}间
                          </span>
                        )}
                      </div>
                    ) : (
                      <button className="bg-gray-300 text-white text-sm font-medium px-5 py-1.5 rounded-md cursor-not-allowed">
                        满房
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-6 text-sm">该酒店暂未录入具体房型</div>
        )}
      </div>
    </div>
  )
}
