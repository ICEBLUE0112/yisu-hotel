'use client'

import React, { useState, useEffect, useCallback } from 'react'
import SafeImage from '../../components/SafeImage'
import DateTimeSelector from '../../components/DateTimeSelector'

interface Hotel {
  id: string
  title: string
  score: number
  reviewCount: number
  favoriteCount: number
  location: string
  tags: string[]
  price: number
  originalPrice?: number
  imageUrl: string
  hasVideo?: boolean
  isFeatured?: boolean
  description?: string
  facilities?: string[]
  address?: string
  distance?: string
  openingYear?: string
  style?: string
  features?: string[]
}

interface Room {
  id: string
  name: string
  description: string
  size: string
  capacity: string
  floors: string
  price: number
  imageUrl: string
  breakfast: boolean
  instantConfirm: boolean
  bedType: '大床' | '双床'
  freeCancellation: boolean
  selected: boolean
}

const HotelDetailPage: React.FC = () => {
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkInDate, setCheckInDate] = useState<Date | null>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  })
  const [showDateSelector, setShowDateSelector] = useState(false)

  // 从URL参数和localStorage中获取日期信息
  useEffect(() => {
    // 从URL参数中获取信息
    const urlParams = new URLSearchParams(window.location.search)
    const checkInParam = urlParams.get('checkIn')
    const checkOutParam = urlParams.get('checkOut')

    // 从localStorage中获取信息
    const storedCheckIn = localStorage.getItem('checkInDate')
    const storedCheckOut = localStorage.getItem('checkOutDate')

    // 更新入住日期
    if (checkInParam) {
      setCheckInDate(new Date(checkInParam))
      localStorage.setItem('checkInDate', checkInParam)
    } else if (storedCheckIn) {
      setCheckInDate(new Date(storedCheckIn))
    }

    // 更新离店日期
    if (checkOutParam) {
      setCheckOutDate(new Date(checkOutParam))
      localStorage.setItem('checkOutDate', checkOutParam)
    } else if (storedCheckOut) {
      setCheckOutDate(new Date(storedCheckOut))
    }
  }, [])

  // 监听URL变化和localStorage变化，当返回前一页面或其他页面修改日期时更新状态
  useEffect(() => {
    // 处理URL变化
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const checkInParam = urlParams.get('checkIn')
      const checkOutParam = urlParams.get('checkOut')

      // 从localStorage中获取信息
      const storedCheckIn = localStorage.getItem('checkInDate')
      const storedCheckOut = localStorage.getItem('checkOutDate')

      // 更新入住日期
      if (checkInParam) {
        setCheckInDate(new Date(checkInParam))
        localStorage.setItem('checkInDate', checkInParam)
      } else if (storedCheckIn) {
        setCheckInDate(new Date(storedCheckIn))
      }

      // 更新离店日期
      if (checkOutParam) {
        setCheckOutDate(new Date(checkOutParam))
        localStorage.setItem('checkOutDate', checkOutParam)
      } else if (storedCheckOut) {
        setCheckOutDate(new Date(storedCheckOut))
      }
    }

    // 处理localStorage变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'checkInDate' && e.newValue) {
        setCheckInDate(new Date(e.newValue))
      } else if (e.key === 'checkOutDate' && e.newValue) {
        setCheckOutDate(new Date(e.newValue))
      }
    }

    // 添加事件监听器
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('storage', handleStorageChange)

    // 清理事件监听器
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // 从URL中获取酒店ID
  const getHotelId = useCallback(() => {
    const pathname = window.location.pathname
    const parts = pathname.split('/')
    return parts[parts.length - 1]
  }, [])

  // 初始化数据
  useEffect(() => {
    // 设置加载状态
    setLoading(true)
    setError(null)

    // 从URL中获取酒店ID
    const hotelId = getHotelId()

    // 调用API获取酒店详情
    const fetchData = async () => {
      try {
        // 调用API获取酒店详情
        const hotelResponse = await fetch(`/api/hotels/${hotelId}`)

        if (!hotelResponse.ok) {
          throw new Error('酒店不存在')
        }

        const hotelData = await hotelResponse.json()

        // 检查酒店数据是否存在
        if (hotelData) {
          setHotel(hotelData)

          // 调用API获取房间信息
          const roomsResponse = await fetch(`/api/hotels/${hotelId}/rooms`)
          const roomsData = await roomsResponse.json()
          setRooms(roomsData || [])
        } else {
          setError('酒店不存在')
        }
      } catch (error) {
        setError('获取酒店详情失败')
        console.error('获取酒店详情失败:', error)
      } finally {
        setLoading(false)
      }
    }

    // 调用获取数据的函数
    fetchData()
  }, [getHotelId])

  // 格式化日期
  const formatDate = (date: Date | null) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  }

  // 格式化星期
  const formatWeekday = (date: Date | null) => {
    if (!date) return ''
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()]
  }

  // 处理日期变化
  const handleDateChange = (newCheckInDate: Date | null, newCheckOutDate: Date | null) => {
    setCheckInDate(newCheckInDate)
    setCheckOutDate(newCheckOutDate)

    // 存储到localStorage
    if (newCheckInDate) {
      localStorage.setItem('checkInDate', newCheckInDate.toISOString())
    }
    if (newCheckOutDate) {
      localStorage.setItem('checkOutDate', newCheckOutDate.toISOString())
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <p className="mt-4 text-gray-500">{error || '酒店不存在'}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm"
            onClick={() => window.history.back()}
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 日期选择器 */}
      {showDateSelector && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* 顶部导航栏 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button className="p-2" onClick={() => setShowDateSelector(false)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
            <h2 className="text-lg font-medium">选择日期</h2>
            <div className="w-8"></div> {/* 占位 */}
          </div>

          {/* 日历选择器 */}
          <div className="flex-1 overflow-y-auto">
            <DateTimeSelector
              mode="full"
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              onDateChange={handleDateChange}
            />
          </div>

          {/* 底部完成按钮 */}
          <div className="p-4 pb-16 border-t border-gray-100 bg-white">
            <button
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
              onClick={() => {
                if (checkInDate && checkOutDate) {
                  setShowDateSelector(false)
                }
              }}
              disabled={!checkInDate || !checkOutDate}
            >
              完成
              {checkInDate && checkOutDate
                ? `（${Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))}晚）`
                : ''}
            </button>
          </div>
        </div>
      )}
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => window.history.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>
          <h1 className="text-sm font-medium flex-1 text-center">{hotel.title}</h1>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* 酒店图片 */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        <SafeImage
          src={hotel.imageUrl}
          alt={hotel.title}
          width={1200}
          height={600}
          className="w-full h-full object-cover"
        />
        {hotel.hasVideo && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 酒店信息 */}
      <div className="bg-white mt-2 px-4 py-4">
        {/* 酒店名称和评分 */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-medium text-lg">{hotel.title}</h2>
            <p className="text-xs text-gray-500 mt-1">{hotel.description}</p>
          </div>
        </div>

        {/* 酒店标签 */}
        <div className="flex flex-wrap gap-2 mt-3">
          {hotel.features?.map((feature, index) => (
            <div key={index} className="flex items-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              {feature}
            </div>
          ))}
        </div>

        {/* 酒店评分和位置 */}
        <div className="mt-3">
          <div className="flex items-center">
            <span className="text-blue-600 font-medium">{hotel.score}</span>
            <span className="text-xs text-gray-500 ml-1">超棒</span>
            <span className="text-xs text-gray-400 ml-2">{hotel.reviewCount}条</span>
            <span className="text-xs text-gray-400 ml-2">{hotel.distance}</span>
          </div>
          <div className="flex items-center mt-2">
            <svg
              className="w-3 h-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
            <span className="text-xs text-gray-500 ml-1">{hotel.address || hotel.location}</span>
          </div>
        </div>
      </div>

      {/* 日期选择 */}
      <div className="bg-white mt-2 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <span className="text-sm">{formatDate(checkInDate)}</span>
              <span className="text-xs text-gray-500 ml-2">{formatWeekday(checkInDate)}</span>
              <span className="text-xs text-gray-500 ml-2">1晚</span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-sm">{formatDate(checkOutDate)}</span>
              <span className="text-xs text-gray-500 ml-2">{formatWeekday(checkOutDate)}</span>
            </div>
          </div>
          <button className="text-blue-600 text-sm" onClick={() => setShowDateSelector(true)}>
            更改 &gt;
          </button>
        </div>
        <div className="mt-2 text-xs text-orange-500">
          当前已过0点，如果今天凌晨6点前入住，请选择&quot;今天凌晨&quot;
        </div>
      </div>

      {/* 房间列表 */}
      <div className="bg-white mt-2 pb-20">
        {rooms.map((room) => (
          <div key={room.id} className="px-4 py-4 border-b border-gray-100">
            <div className="flex">
              {/* 房间图片 */}
              <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                <SafeImage
                  src={room.imageUrl}
                  alt={room.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 房间信息 */}
              <div className="flex-1 ml-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{room.name}</h3>
                  <button className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {room.description} {room.size} {room.capacity} {room.floors}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="text-red-500 font-medium">¥{room.price}</span>
                    <span className="text-xs text-gray-400 ml-1">起</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 z-30">
        <div className="flex items-center justify-center">
          <button className="flex flex-col items-center">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              ></path>
            </svg>
            <span className="text-xs text-gray-500 mt-1">问酒店</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default HotelDetailPage
