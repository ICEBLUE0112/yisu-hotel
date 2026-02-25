'use client'

import React, { useState, useEffect, useCallback } from 'react'
import HotelCard from './components/HotelCard'
import DateTimeSelector from './components/DateTimeSelector'
import dynamic from 'next/dynamic'

// 禁用服务器端渲染
const CitySelector = dynamic(() => import('./components/CitySelector'), { ssr: false })

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
}

const HotelListPage: React.FC = () => {
  // 状态管理
  const [city, setCity] = useState<string>('上海')
  const [positionText, setPositionText] = useState<string>('上海')
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
  // 城市选择器状态
  const [showCitySelector, setShowCitySelector] = useState<boolean>(false)
  // 标签选择状态
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // 从URL参数和localStorage中获取城市和日期信息
  useEffect(() => {
    // 从URL参数中获取信息
    const urlParams = new URLSearchParams(window.location.search)
    const cityParam = urlParams.get('city')
    const checkInParam = urlParams.get('checkIn')
    const checkOutParam = urlParams.get('checkOut')
    const tagsParam = urlParams.get('tags')
    const roomCountParam = urlParams.get('roomCount')
    const adultCountParam = urlParams.get('adultCount')
    const childCountParam = urlParams.get('childCount')

    // 从localStorage中获取信息
    const storedCity = localStorage.getItem('selectedCity')
    const storedCheckIn = localStorage.getItem('checkInDate')
    const storedCheckOut = localStorage.getItem('checkOutDate')

    // 更新城市信息
    if (cityParam) {
      setCity(cityParam)
      setPositionText(cityParam)
      localStorage.setItem('selectedCity', cityParam)
    } else if (storedCity) {
      setCity(storedCity)
      setPositionText(storedCity)
    }

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

    // 更新标签信息
    if (tagsParam) {
      setSelectedTags(tagsParam.split(','))
    }

    // 更新客房和入住人数信息
    if (roomCountParam) {
      setRoomCount(parseInt(roomCountParam))
    }
    if (adultCountParam) {
      setAdultCount(parseInt(adultCountParam))
    }
    if (childCountParam) {
      setChildCount(parseInt(childCountParam))
    }
  }, [])

  // 监听URL变化，当返回前一页面时更新状态
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const cityParam = urlParams.get('city')
      const checkInParam = urlParams.get('checkIn')
      const checkOutParam = urlParams.get('checkOut')
      const tagsParam = urlParams.get('tags')

      // 更新城市信息
      if (cityParam) {
        setCity(cityParam)
        setPositionText(cityParam)
      }

      // 更新入住日期
      if (checkInParam) {
        setCheckInDate(new Date(checkInParam))
      }

      // 更新离店日期
      if (checkOutParam) {
        setCheckOutDate(new Date(checkOutParam))
      }

      // 更新标签信息
      if (tagsParam) {
        setSelectedTags(tagsParam.split(','))
      }
    }

    // 添加事件监听器
    window.addEventListener('popstate', handlePopState)

    // 清理事件监听器
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // 处理打开城市选择器
  const handleOpenCitySelector = () => {
    setShowCitySelector(true)
  }

  // 处理城市选择
  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity)
    setPositionText(selectedCity)
    setShowCitySelector(false)

    // 更新URL参数并重新获取酒店数据
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.set('city', selectedCity)
    window.history.replaceState(null, '', `?${urlParams.toString()}`)

    // 存储到localStorage
    localStorage.setItem('selectedCity', selectedCity)

    // 重新获取酒店数据
    fetchHotels()
  }
  const [roomCount, setRoomCount] = useState<number>(1)
  const [adultCount, setAdultCount] = useState<number>(1)
  const [childCount, setChildCount] = useState<number>(0)
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  // 酒店数据状态
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 筛选和排序状态
  const [sortBy, setSortBy] = useState<string>('rating') // popularity, distance, price, rating

  // 日期选择器状态
  const [showDateSelector, setShowDateSelector] = useState<boolean>(false)
  // 客房和入住人数选择器状态
  const [showRoomSelector, setShowRoomSelector] = useState<boolean>(false)

  // 处理标签选择
  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }

  // 处理排序方式变更
  const handleSortChange = (sortType: string) => {
    setSortBy(sortType)
  }

  // 处理日期变化
  const handleDateChange = (newCheckInDate: Date | null, newCheckOutDate: Date | null) => {
    setCheckInDate(newCheckInDate)
    setCheckOutDate(newCheckOutDate)

    // 更新URL参数
    if (newCheckInDate && newCheckOutDate) {
      const urlParams = new URLSearchParams(window.location.search)
      urlParams.set('checkIn', newCheckInDate.toISOString())
      urlParams.set('checkOut', newCheckOutDate.toISOString())
      window.history.replaceState(null, '', `?${urlParams.toString()}`)
    }

    // 存储到localStorage
    if (newCheckInDate) {
      localStorage.setItem('checkInDate', newCheckInDate.toISOString())
    }
    if (newCheckOutDate) {
      localStorage.setItem('checkOutDate', newCheckOutDate.toISOString())
    }
  }

  // 获取酒店数据
  const fetchHotels = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // 构建API请求URL
      const params = new URLSearchParams()
      params.append('city', city)
      params.append('keyword', searchKeyword)
      params.append('sortBy', sortBy)
      params.append('tags', selectedTags.join(','))

      // 添加日期参数
      if (checkInDate) {
        params.append('checkIn', checkInDate.toISOString())
      }
      if (checkOutDate) {
        params.append('checkOut', checkOutDate.toISOString())
      }

      const response = await fetch(`/api/hotels?${params.toString()}`)

      if (!response.ok) {
        throw new Error('获取酒店数据失败')
      }

      const data = await response.json()

      if (data.success) {
        // 清理酒店数据中的图片URL
        let cleanedHotels = data.data.map((hotel: Hotel) => ({
          ...hotel,
          imageUrl: 'https://pic4.zhimg.com/v2-b5c43c5a19dde02ad0ce5fb3f407b64f_r.jpg',
        }))

        // 过滤酒店数据，只保留包含所有选中标签的酒店
        if (selectedTags.length > 0) {
          cleanedHotels = cleanedHotels.filter((hotel: Hotel) => {
            return selectedTags.every((tag) => hotel.tags.includes(tag))
          })
        }

        setHotels(cleanedHotels)
      } else {
        throw new Error(data.message || '获取酒店数据失败')
      }
    } catch (err) {
      console.error('获取酒店数据出错:', err)
      setError('获取酒店数据失败，请稍后重试')

      // 使用模拟数据作为 fallback
      let mockHotels = [
        {
          id: '1',
          title: '南兴花园智能影院酒店(海旅免税城店)',
          score: 4.7,
          reviewCount: 2923,
          favoriteCount: 8331,
          location: '近三亚千古情 三亚海旅免税城',
          tags: ['免费停车', '地铁周边', '购物便利', '智能客控'],
          price: 318,
          originalPrice: 652,
          imageUrl:
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20with%20swimming%20pool%20and%20tropical%20garden&image_size=square',
          hasVideo: false,
          isFeatured: true,
        },
        {
          id: '2',
          title: '三亚椰景蓝岸大酒店(大东海广场店)',
          score: 4.2,
          reviewCount: 4585,
          favoriteCount: 21000,
          location: '近大东海·第一农贸市场',
          tags: ['免费停车', '亲子酒店', '购物便利', '管家服务'],
          price: 289,
          originalPrice: 438,
          imageUrl:
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beach%20hotel%20with%20ocean%20view&image_size=square',
          hasVideo: false,
        },
        {
          id: '3',
          title: '三亚哈曼度假酒店',
          score: 4.6,
          reviewCount: 12000,
          favoriteCount: 252000,
          location: '近大东海·1号港湾城(大菠萝)',
          tags: ['亲子酒店', '购物便利', '地铁周边', '高空无边泳池'],
          price: 858,
          originalPrice: 1218,
          imageUrl:
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20resort%20hotel%20with%20infinity%20pool&image_size=square',
          hasVideo: false,
        },
        {
          id: '4',
          title: '三亚湾9号city sea海景民宿(长廊店)',
          score: 4.1,
          reviewCount: 1449,
          favoriteCount: 79000,
          location: '近三亚湾·椰梦长廊',
          tags: ['免费停车', '地铁周边', '购物便利', '家庭房'],
          price: 268,
          originalPrice: 398,
          imageUrl:
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=seaview%20homestay%20with%20modern%20design&image_size=square',
        },
        {
          id: '5',
          title: '三亚亚特兰蒂斯酒店',
          score: 4.8,
          reviewCount: 15000,
          favoriteCount: 350000,
          location: '近海棠湾·亚特兰蒂斯水世界',
          tags: ['亲子酒店', '购物便利', '地铁周边', '水族馆'],
          price: 1988,
          originalPrice: 2888,
          imageUrl:
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=atlantis%20hotel%20with%20aquarium%20and%20water%20park&image_size=square',
          hasVideo: false,
          isFeatured: true,
        },
      ]

      // 过滤模拟数据，只保留包含所有选中标签的酒店
      if (selectedTags.length > 0) {
        mockHotels = mockHotels.filter((hotel: Hotel) => {
          return selectedTags.every((tag) => hotel.tags.includes(tag))
        })
      }

      setHotels(mockHotels)
    } finally {
      setLoading(false)
    }
  }, [city, searchKeyword, sortBy, selectedTags, checkInDate, checkOutDate])

  // 组件挂载时获取酒店数据
  useEffect(() => {
    fetchHotels()
  }, [fetchHotels])

  return (
    <div className="min-h-screen bg-white">
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

      {/* 城市选择器 */}
      {showCitySelector && (
        <CitySelector
          onSelectCity={handleCitySelect}
          onCancel={() => setShowCitySelector(false)}
          selectedCity={city}
        />
      )}
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        {/* 返回按钮和城市选择 */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button className="p-2" onClick={() => window.history.back()}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
            <div className="flex items-center cursor-pointer" onClick={handleOpenCitySelector}>
              <span className="font-medium">{positionText}</span>
              <span className="text-gray-400 text-xs ml-1">▼</span>
            </div>
          </div>

          {/* 日期和入住信息 */}
          <div className="flex items-center space-x-4">
            <div className="text-sm cursor-pointer" onClick={() => setShowDateSelector(true)}>
              {checkInDate && checkOutDate ? (
                <>
                  {checkInDate.getMonth() + 1}/{checkInDate.getDate()} -
                  {checkOutDate.getMonth() + 1}/{checkOutDate.getDate()}
                </>
              ) : (
                '选择日期'
              )}
            </div>
            <div className="text-sm cursor-pointer" onClick={() => setShowRoomSelector(true)}>
              {roomCount}间房 {adultCount}成人 {childCount}儿童
            </div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="px-4 pb-3">
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
            <svg
              className="w-4 h-4 text-gray-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <input
              type="text"
              placeholder="位置/品牌/酒店"
              className="flex-1 bg-transparent border-0 text-sm focus:outline-none"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 筛选标签 */}
      <div className="sticky top-[90px] z-40 bg-white border-b border-gray-100">
        <div className="flex items-center px-4 py-3 overflow-x-auto whitespace-nowrap">
          {['地铁周边', '亲子', '购物便利', '免费停车'].map((tag) => (
            <button
              key={tag}
              className={`px-3 py-1.5 rounded-full text-sm mr-2 ${
                selectedTags.includes(tag)
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-gray-100 border border-gray-200'
              }`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
          {/* 只在所选城市是海外时显示海外标签 */}
          {selectedTags.includes('海外') && (
            <button
              key="海外"
              className={`px-3 py-1.5 rounded-full text-sm mr-2 ${
                selectedTags.includes('海外')
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-gray-100 border border-gray-200'
              }`}
              onClick={() => handleTagClick('海外')}
            >
              海外
            </button>
          )}
        </div>
      </div>

      {/* 排序和筛选 */}
      <div className="sticky top-[140px] z-30 bg-white border-b border-gray-100">
        <div className="flex items-center px-4 py-2">
          <button
            className={`flex items-center mr-6 ${sortBy === 'rating' ? 'text-blue-600' : 'text-gray-700'}`}
            onClick={() => handleSortChange('rating')}
          >
            <span className="text-sm">评分排序</span>
            <span className="text-gray-400 text-xs ml-1">▼</span>
          </button>
          <button
            className={`flex items-center mr-6 ${sortBy === 'distance' ? 'text-blue-600' : 'text-gray-700'}`}
            onClick={() => handleSortChange('distance')}
          >
            {/* <span className="text-sm">位置距离</span>
            <span className="text-gray-400 text-xs ml-1">▼</span> */}
          </button>
          <button
            className={`flex items-center mr-6 ${sortBy === 'price' ? 'text-blue-600' : 'text-gray-700'}`}
            onClick={() => handleSortChange('price')}
          >
            <span className="text-sm">价格排序</span>
            <span className="text-gray-400 text-xs ml-1">▼</span>
          </button>
          <button
            className={`flex items-center ${sortBy === 'filter' ? 'text-blue-600' : 'text-gray-700'}`}
            onClick={() => handleSortChange('filter')}
          ></button>
        </div>
      </div>

      {/* 选择客房和入住人数弹窗 */}
      {showRoomSelector && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* 弹窗内容 */}
          <div className="bg-white rounded-t-2xl w-full flex flex-col">
            {/* 顶部栏 */}
            <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100">
              <button
                className="w-8 h-8 flex items-center justify-center"
                onClick={() => setShowRoomSelector(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
              <h2 className="text-lg font-medium">选择客房和入住人数</h2>
              <div className="w-8"></div> {/* 占位 */}
            </div>

            {/* 内容区 */}
            <div className="bg-white p-4 overflow-y-auto">
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="text-gray-500 text-sm">入住人数较多时，试试增加间数</div>
                </div>
              </div>

              {/* 间数 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">间数</div>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    onClick={() => setRoomCount(Math.max(1, roomCount - 1))}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18 12H6"
                      ></path>
                    </svg>
                  </button>
                  <div className="text-lg font-medium">{roomCount}</div>
                  <button
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    onClick={() => setRoomCount(roomCount + 1)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* 成人数 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">成人数</div>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18 12H6"
                      ></path>
                    </svg>
                  </button>
                  <div className="text-lg font-medium">{adultCount}</div>
                  <button
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    onClick={() => setAdultCount(adultCount + 1)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* 儿童数 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">儿童数</div>
                  <div className="text-gray-500 text-sm">0-17岁</div>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    onClick={() => setChildCount(Math.max(0, childCount - 1))}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18 12H6"
                      ></path>
                    </svg>
                  </button>
                  <div className="text-lg font-medium">{childCount}</div>
                  <button
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    onClick={() => setChildCount(childCount + 1)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* 底部完成按钮 */}
            <div className="bg-white p-4 border-t border-gray-100">
              <button
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
                onClick={() => {
                  setShowRoomSelector(false)
                  // 更新URL参数
                  const urlParams = new URLSearchParams(window.location.search)
                  urlParams.set('roomCount', roomCount.toString())
                  urlParams.set('adultCount', adultCount.toString())
                  urlParams.set('childCount', childCount.toString())
                  window.history.replaceState(null, '', `?${urlParams.toString()}`)
                }}
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 酒店列表 */}
      <div className="pb-20" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* 加载状态 */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && !loading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
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
            <p className="mt-4 text-gray-500">{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm"
              onClick={fetchHotels}
            >
              重试
            </button>
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && hotels.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <p className="mt-4 text-gray-500">未找到符合条件的酒店</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm"
              onClick={fetchHotels}
            >
              重置筛选
            </button>
          </div>
        )}

        {/* 酒店列表 */}
        {!loading &&
          !error &&
          hotels.length > 0 &&
          hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              id={hotel.id}
              title={hotel.title}
              score={hotel.score}
              reviewCount={hotel.reviewCount}
              favoriteCount={hotel.favoriteCount}
              location={hotel.location}
              tags={hotel.tags}
              price={hotel.price}
              originalPrice={hotel.originalPrice}
              imageUrl={hotel.imageUrl}
              hasVideo={hotel.hasVideo}
              isFeatured={hotel.isFeatured}
            />
          ))}
      </div>
    </div>
  )
}

export default HotelListPage
