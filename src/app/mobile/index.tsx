// src/app/mobile/index.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react'
import LocationIcon from './components/LocationIcon'
import DateTimeSelector from './components/DateTimeSelector'

// 定义酒店接口
interface Hotel {
  id: string
  title: string
  score: number
  reviewCount: number
  favoriteCount: number
  location: string
  tags: string[]
  price: number
  originalPrice: number
  imageUrl: string
  hasVideo?: boolean
  isFeatured?: boolean
}

import dynamic from 'next/dynamic'
import Image from 'next/image'

// 禁用服务器端渲染
const CitySelector = dynamic(() => import('./components/CitySelector'), { ssr: false })

const HomePage: React.FC = () => {
  // 状态管理：当前激活的标签
  const [activeTab, setActiveTab] = useState<'domestic' | 'overseas' | 'hourly' | 'homestay'>(
    'domestic',
  )
  // 状态管理：当前选择的城市
  const [selectedCity, setSelectedCity] = useState<string>('上海')
  // 状态管理：各标签页的默认城市
  const [defaultCities] = useState<{
    domestic: string
    overseas: string
    hourly: string
    homestay: string
  }>({
    domestic: '上海',
    overseas: '曼谷',
    hourly: '上海',
    homestay: '上海',
  })
  // 状态管理：是否显示城市选择器
  const [showCitySelector, setShowCitySelector] = useState<boolean>(false)
  // 状态管理：定位是否成功
  const [locationSuccess, setLocationSuccess] = useState<boolean>(false)
  // 状态管理：定位地址
  const [locationAddress, setLocationAddress] = useState<string>('重庆xx区')
  // 状态管理：位置显示文本
  const [positionText, setPositionText] = useState<string>('上海')
  // 状态管理：是否显示定位提醒弹窗
  const [showLocationAlert, setShowLocationAlert] = useState<boolean>(false)
  // 状态管理：定位提醒弹窗内容
  const [locationAlertMessage, setLocationAlertMessage] = useState<string>('')
  // 状态管理：日期选择
  const [checkInDate, setCheckInDate] = useState<Date | null>(null)
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null)

  // 在客户端渲染时获取日期信息
  useEffect(() => {
    // 使用异步函数包装，避免同步调用 setState
    const loadDateInfo = async () => {
      // 尝试从URL参数中读取日期信息
      const urlParams = new URLSearchParams(window.location.search)
      const checkInParam = urlParams.get('checkIn')
      const checkOutParam = urlParams.get('checkOut')

      // 设置入住日期
      if (checkInParam) {
        const date = new Date(checkInParam)
        if (!isNaN(date.getTime())) {
          date.setHours(0, 0, 0, 0)
          setCheckInDate(date)
        }
      } else {
        // 默认使用今天
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        setCheckInDate(today)
      }

      // 设置离店日期
      if (checkOutParam) {
        const date = new Date(checkOutParam)
        if (!isNaN(date.getTime())) {
          date.setHours(0, 0, 0, 0)
          setCheckOutDate(date)
        }
      } else {
        // 默认使用明天
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        setCheckOutDate(tomorrow)
      }
    }

    loadDateInfo()
  }, [])

  // 监听URL变化，当返回前一页面时更新状态
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const checkInParam = urlParams.get('checkIn')
      const checkOutParam = urlParams.get('checkOut')
      const cityParam = urlParams.get('city')

      // 从localStorage中获取信息
      const storedCheckIn = localStorage.getItem('checkInDate')
      const storedCheckOut = localStorage.getItem('checkOutDate')
      const storedCity = localStorage.getItem('selectedCity')

      // 更新城市信息
      if (cityParam) {
        setSelectedCity(cityParam)
        setPositionText(cityParam)
        localStorage.setItem('selectedCity', cityParam)
      } else if (storedCity) {
        setSelectedCity(storedCity)
        setPositionText(storedCity)
      }

      // 更新入住日期
      if (checkInParam) {
        const date = new Date(checkInParam)
        if (!isNaN(date.getTime())) {
          date.setHours(0, 0, 0, 0)
          setCheckInDate(date)
          localStorage.setItem('checkInDate', checkInParam)
        }
      } else if (storedCheckIn) {
        const date = new Date(storedCheckIn)
        if (!isNaN(date.getTime())) {
          date.setHours(0, 0, 0, 0)
          setCheckInDate(date)
        }
      }

      // 更新离店日期
      if (checkOutParam) {
        const date = new Date(checkOutParam)
        if (!isNaN(date.getTime())) {
          date.setHours(0, 0, 0, 0)
          setCheckOutDate(date)
          localStorage.setItem('checkOutDate', checkOutParam)
        }
      } else if (storedCheckOut) {
        const date = new Date(storedCheckOut)
        if (!isNaN(date.getTime())) {
          date.setHours(0, 0, 0, 0)
          setCheckOutDate(date)
        }
      }
    }

    // 添加事件监听器
    window.addEventListener('popstate', handlePopState)

    // 清理事件监听器
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [selectedCity, positionText])
  // 状态管理：是否显示日期选择器
  const [showDateSelector, setShowDateSelector] = useState<boolean>(false)

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

  // 处理标签切换
  const handleTabChange = (tab: 'domestic' | 'overseas' | 'hourly' | 'homestay') => {
    setActiveTab(tab)
    // 切换标签页时，更新selectedCity为对应标签页的默认城市
    setSelectedCity(defaultCities[tab])
    // 重置定位状态
    setLocationSuccess(false)
    setPositionText(defaultCities[tab])
  }

  // 处理城市选择
  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    setShowCitySelector(false)
    // 当选择其他城市时，隐藏定位成功提示条
    setLocationSuccess(false)
    setPositionText(city)
    // 存储到localStorage
    localStorage.setItem('selectedCity', city)
  }

  // 状态管理：标签选择
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // 处理标签点击并跳转到酒店列表页面
  const handleTagClickAndSearch = (tag: string) => {
    // 更新标签状态
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(newTags)

    // 构建查询参数
    const urlParams = new URLSearchParams()
    urlParams.set('city', selectedCity)
    urlParams.set('checkIn', checkInDate?.toISOString() || new Date().toISOString())
    urlParams.set(
      'checkOut',
      checkOutDate?.toISOString() || new Date(new Date().getTime() + 86400000).toISOString(),
    )
    urlParams.set('tags', newTags.join(','))
    urlParams.set('roomCount', roomCount.toString())
    urlParams.set('adultCount', adultCount.toString())
    urlParams.set('childCount', childCount.toString())

    // 跳转到酒店列表页面
    setTimeout(() => {
      window.location.href = `/mobile/hotel-list?${urlParams.toString()}`
    }, 0)
  }

  // 状态管理：客房和入住人数
  const [roomCount, setRoomCount] = useState<number>(1)
  const [adultCount, setAdultCount] = useState<number>(1)
  const [childCount, setChildCount] = useState<number>(0)
  // 状态管理：人数选择器
  const [showRoomSelector, setShowRoomSelector] = useState<boolean>(false)

  // 状态管理：轮播图酒店数据
  const [carouselHotels, setCarouselHotels] = useState<Hotel[]>([])
  const [currentSlide, setCurrentSlide] = useState<number>(0)

  // 处理人数选择器完成按钮点击
  const handleRoomSelectorComplete = () => {
    setShowRoomSelector(false)
  }

  // 获取轮播图酒店数据
  const fetchCarouselHotels = useCallback(async () => {
    try {
      // 构建API请求URL
      const params = new URLSearchParams()
      params.append('city', selectedCity)
      params.append('limit', '10') // 获取10个酒店，然后随机选择3个

      const response = await fetch(`/api/hotels?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()

        if (data.success && data.data.length > 0) {
          // 随机选择3个酒店
          const shuffled = [...data.data].sort(() => 0.5 - Math.random())
          const selected = shuffled.slice(0, 3)
          setCarouselHotels(selected)
        }
      }
    } catch (err) {
      console.error('获取轮播图酒店数据出错:', err)
      // 出错时使用默认空数组
      setCarouselHotels([])
    }
  }, [selectedCity])

  // 组件挂载时和城市变化时获取轮播图酒店数据
  useEffect(() => {
    // 使用异步函数包装，避免同步调用 setState
    const loadCarouselHotels = async () => {
      await fetchCarouselHotels()
    }
    loadCarouselHotels()
  }, [fetchCarouselHotels])

  // 轮播图自动切换
  useEffect(() => {
    // 只有当轮播图有数据时才启动自动切换
    if (carouselHotels.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselHotels.length)
      }, 3000) // 每3秒切换一次

      // 组件卸载时清除定时器
      return () => clearInterval(interval)
    }
  }, [carouselHotels.length])

  // 打开城市选择器
  const handleOpenCitySelector = () => {
    setShowCitySelector(true)
  }

  // 取消城市选择
  const handleCancelCitySelect = () => {
    setShowCitySelector(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 max-w-md mx-auto">
      {/* 城市选择器 */}
      {showCitySelector && (
        <div className="fixed inset-0 z-50 bg-white">
          <CitySelector
            onSelectCity={handleCitySelect}
            onCancel={handleCancelCitySelect}
            selectedCity={selectedCity}
          />
        </div>
      )}
      {/* 轮播图 */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {carouselHotels.length > 0 ? (
          <div className="relative w-full h-full">
            {carouselHotels.map((hotel, index) => (
              <div
                key={hotel.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <a
                  href={`/mobile/hotel-detail/${hotel.id}?checkIn=${checkInDate?.toISOString() || new Date().toISOString()}&checkOut=${checkOutDate?.toISOString() || new Date(new Date().getTime() + 86400000).toISOString()}&roomCount=${roomCount}&adultCount=${adultCount}&childCount=${childCount}`}
                  className="block w-full h-full"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={
                        hotel.imageUrl || 'https://img95.699pic.com/photo/50048/1095.jpg_wh860.jpg'
                      }
                      alt={hotel.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </a>
              </div>
            ))}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5">
              {carouselHotels.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full bg-white ${
                    index === currentSlide ? 'opacity-100' : 'opacity-50'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                ></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={
                  activeTab === 'overseas'
                    ? 'https://th.bing.com/th/id/R.12bed6b5916796d3c10cc9515074c539?rik=08Gbh5CYGnCLzQ&riu=http%3a%2f%2fdimg04.c-ctrip.com%2fimages%2ffd%2fvacations%2fg2%2fM0B%2fD2%2f71%2fCghzgVSY6D-ABSCjAAfhod4N74w702.jpg&ehk=xjuD7UuHA%2bGHEaIFbTqMtSvuKGoOrPRIg%2btBgaf3adU%3d&risl=&pid=ImgRaw&r=0'
                    : activeTab === 'hourly'
                      ? 'https://www.bing.com/th/id/OIP.AksgwrrEt7b4N2F27rvyIgHaEl?w=202&h=128&c=8&rs=1&qlt=90&o=6&cb=defcachec1&dpr=2&pid=3.1&rm=2'
                      : activeTab === 'homestay'
                        ? 'https://img95.699pic.com/photo/50036/0204.jpg_wh860.jpg'
                        : 'https://img95.699pic.com/photo/50048/1095.jpg_wh860.jpg'
                }
                alt="酒店轮播图"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}
      </div>

      {/* 主要内容 */}
      <div className="px-4 py-3">
        {/* 分类标签 - Tab切换 */}
        <div className="flex items-center justify-between mb-4 overflow-x-auto">
          <div className="flex items-center space-x-6">
            <span
              className={`whitespace-nowrap pb-1 cursor-pointer ${activeTab === 'domestic' ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => handleTabChange('domestic')}
            >
              国内
            </span>
            <span
              className={`whitespace-nowrap pb-1 cursor-pointer ${activeTab === 'overseas' ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => handleTabChange('overseas')}
            >
              海外
            </span>
            <span
              className={`whitespace-nowrap pb-1 cursor-pointer ${activeTab === 'hourly' ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => handleTabChange('hourly')}
            >
              钟点房
            </span>
            <span
              className={`whitespace-nowrap pb-1 cursor-pointer ${activeTab === 'homestay' ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => handleTabChange('homestay')}
            >
              民宿
            </span>
          </div>
        </div>

        {/* 完整日期选择器 */}
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

        {/* 国内标签内容 */}
        {activeTab === 'domestic' && (
          <>
            {/* 定位成功提示条 - 只在定位成功后显示 */}
            {locationSuccess && (
              <div className="px-4 py-2 bg-blue-50 flex items-center mb-4">
                <svg
                  className="w-4 h-4 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-blue-600 text-sm">已定位到 {locationAddress}</span>
              </div>
            )}

            {/* 位置和搜索框 */}
            <div className="flex items-center h-12 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-gray-700">
                <button className="font-medium cursor-pointer" onClick={handleOpenCitySelector}>
                  {positionText === '我的位置' ? '我的位置' : selectedCity}
                </button>
                <span className="text-gray-400 text-xs">▼</span>
                <button
                  className="cursor-pointer"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          console.log('获取位置成功:', position)
                          const { latitude, longitude } = position.coords

                          // 使用高德地图逆地理编码API获取实际地址
                          const apiKey = '3d96555e2d9edb939b5a22b8e602198b'
                          const url = `https://restapi.amap.com/v3/geocode/regeo?key=${apiKey}&location=${longitude},${latitude}&extensions=base`

                          try {
                            const response = await fetch(url)
                            const data = await response.json()
                            if (data.status === '1' && data.regeocode) {
                              const address = data.regeocode.formatted_address
                              setLocationAddress(address)
                              console.log('获取地址成功:', address)

                              // 提取城市名字
                              let cityName = '未知城市'
                              if (data.regeocode.addressComponent) {
                                if (data.regeocode.addressComponent.city) {
                                  cityName = data.regeocode.addressComponent.city
                                } else if (data.regeocode.addressComponent.province) {
                                  cityName = data.regeocode.addressComponent.province
                                }
                              }
                              console.log('提取的城市名字:', cityName)

                              // 更新城市选择
                              setSelectedCity(cityName)
                              setPositionText('我的位置')
                            }
                          } catch (error) {
                            console.error('获取地址失败:', error)
                            // 即使获取地址失败，也要设置定位成功状态
                            setLocationSuccess(true)
                            setPositionText('我的位置')
                          }

                          setLocationSuccess(true)
                        },
                        (error) => {
                          console.error('获取位置失败:', error)
                          // 即使获取位置失败，也要设置定位成功状态
                          setLocationSuccess(true)
                          setPositionText('我的位置')
                        },
                      )
                    } else {
                      console.error('浏览器不支持地理位置')
                      // 即使浏览器不支持地理位置，也要设置定位成功状态
                      setLocationSuccess(true)
                      setPositionText('我的位置')
                    }
                  }}
                >
                  <LocationIcon className="w-8 h-8" />
                </button>
              </div>
              <div className="w-px h-6 bg-gray-200 mx-3"></div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="位置/品牌/酒店"
                  className="w-full px-3 py-2 bg-gray-100 rounded text-sm border-0"
                />
              </div>
            </div>

            {/* 日期时间选择器 */}
            <div className="h-12 border-b border-gray-100 flex items-center justify-center">
              <button className="w-full" onClick={() => setShowDateSelector(true)}>
                <DateTimeSelector
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  onDateChange={handleDateChange}
                  onOpenFullSelector={() => setShowDateSelector(true)}
                />
              </button>
            </div>

            {/* 筛选标签 */}
            <div>
              <div className="h-12 border-b border-gray-100 flex items-center">
                <div className="text-gray-500 text-sm">价格/星级</div>
              </div>
              <div className="h-12 border-b border-gray-100 flex items-center">
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm ${selectedTags.includes('免费停车') ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-100 border border-gray-200'}`}
                    onClick={() => handleTagClickAndSearch('免费停车')}
                  >
                    免费停车场
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm ${selectedTags.includes('亲子') ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-100 border border-gray-200'}`}
                    onClick={() => handleTagClickAndSearch('亲子')}
                  >
                    亲子酒店
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm ${selectedTags.includes('地铁周边') ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-100 border border-gray-200'}`}
                    onClick={() => handleTagClickAndSearch('地铁周边')}
                  >
                    地铁周边
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 海外标签内容 */}
        {activeTab === 'overseas' && (
          <>
            {/* 定位成功提示条 - 只在定位成功后显示 */}
            {locationSuccess && (
              <div className="px-4 py-2 bg-blue-50 flex items-center mb-4">
                <svg
                  className="w-4 h-4 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-blue-600 text-sm">已定位到 {locationAddress}</span>
              </div>
            )}

            {/* 位置和搜索框 */}
            <div className="flex items-center h-12 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-gray-700">
                <button className="font-medium cursor-pointer" onClick={handleOpenCitySelector}>
                  {positionText === '我的位置' ? '我的位置' : selectedCity}
                </button>
                <span className="text-gray-400 text-xs">▼</span>
                <button
                  className="cursor-pointer"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          console.log('获取位置成功:', position)
                          const { latitude, longitude } = position.coords

                          // 使用高德地图逆地理编码API获取实际地址
                          const apiKey = '3d96555e2d9edb939b5a22b8e602198b'
                          const url = `https://restapi.amap.com/v3/geocode/regeo?key=${apiKey}&location=${longitude},${latitude}&extensions=base`

                          try {
                            const response = await fetch(url)
                            const data = await response.json()
                            if (data.status === '1' && data.regeocode) {
                              const address = data.regeocode.formatted_address
                              setLocationAddress(address)
                              console.log('获取地址成功:', address)

                              // 检查是否在中国境内
                              const country = data.regeocode.addressComponent?.country || ''
                              if (country === '中国') {
                                // 在海外标签页定位到国内，显示提醒弹窗
                                setLocationAlertMessage(
                                  '当前定位在国内，海外标签页需要选择海外城市',
                                )
                                setShowLocationAlert(true)
                                // 不更新位置显示
                                return
                              }
                            }
                          } catch (error) {
                            console.error('获取地址失败:', error)
                          }

                          setLocationSuccess(true)
                          setPositionText('我的位置')
                        },
                        (error) => {
                          console.error('获取位置失败:', error)
                        },
                      )
                    } else {
                      console.error('浏览器不支持地理位置')
                    }
                  }}
                >
                  <LocationIcon className="w-8 h-8" />
                </button>
              </div>
              <div className="w-px h-6 bg-gray-200 mx-3"></div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="位置/品牌/酒店"
                  className="w-full px-3 py-2 bg-gray-100 rounded text-sm border-0"
                />
              </div>
            </div>

            {/* 日期时间选择器 */}
            <div className="h-12 border-b border-gray-100 flex items-center justify-center">
              <button className="w-full" onClick={() => setShowDateSelector(true)}>
                <DateTimeSelector
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  onDateChange={handleDateChange}
                  onOpenFullSelector={() => setShowDateSelector(true)}
                />
              </button>
            </div>

            {/* 人数选择 */}
            <div className="h-12 border-b border-gray-100 flex items-center">
              <div
                className="flex items-center space-x-2 text-gray-700 cursor-pointer"
                onClick={() => setShowRoomSelector(true)}
              >
                <span className="font-medium">
                  {roomCount}间房 {adultCount}成人 {childCount}儿童
                </span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>
              <div className="w-px h-6 bg-gray-200 mx-3"></div>
              <div className="text-gray-500 text-sm">价格</div>
            </div>

            {/* 海外酒店提示 */}
            <div className="h-12 border-b border-gray-100 flex items-center">
              <div className="w-full bg-blue-50 px-3 py-2 rounded">
                <span className="text-blue-600 text-sm">
                  海外酒店按人数收费，请准确选择成人和儿童数
                </span>
              </div>
            </div>
          </>
        )}

        {/* 钟点房标签内容 */}
        {activeTab === 'hourly' && (
          <>
            {/* 定位成功提示条 - 只在定位成功后显示 */}
            {locationSuccess && (
              <div className="px-4 py-2 bg-blue-50 flex items-center mb-4">
                <svg
                  className="w-4 h-4 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-blue-600 text-sm">已定位到 {locationAddress}</span>
              </div>
            )}

            {/* 位置和搜索框 */}
            <div className="flex items-center h-12 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-gray-700">
                <button className="font-medium cursor-pointer" onClick={handleOpenCitySelector}>
                  {positionText === '我的位置' ? '我的位置' : selectedCity}
                </button>
                <span className="text-gray-400 text-xs">▼</span>
                <button
                  className="cursor-pointer"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          console.log('获取位置成功:', position)
                          const { latitude, longitude } = position.coords

                          // 使用高德地图逆地理编码API获取实际地址
                          const apiKey = '3d96555e2d9edb939b5a22b8e602198b'
                          const url = `https://restapi.amap.com/v3/geocode/regeo?key=${apiKey}&location=${longitude},${latitude}&extensions=base`

                          try {
                            const response = await fetch(url)
                            const data = await response.json()
                            if (data.status === '1' && data.regeocode) {
                              const address = data.regeocode.formatted_address
                              setLocationAddress(address)
                              console.log('获取地址成功:', address)

                              // 提取城市名字
                              let cityName = '未知城市'
                              if (data.regeocode.addressComponent) {
                                if (data.regeocode.addressComponent.city) {
                                  cityName = data.regeocode.addressComponent.city
                                } else if (data.regeocode.addressComponent.province) {
                                  cityName = data.regeocode.addressComponent.province
                                }
                              }
                              console.log('提取的城市名字:', cityName)

                              // 更新城市选择
                              setSelectedCity(cityName)
                              setPositionText('我的位置')
                            }
                          } catch (error) {
                            console.error('获取地址失败:', error)
                            // 即使获取地址失败，也要设置定位成功状态
                            setLocationSuccess(true)
                            setPositionText('我的位置')
                          }

                          setLocationSuccess(true)
                        },
                        (error) => {
                          console.error('获取位置失败:', error)
                          // 即使获取位置失败，也要设置定位成功状态
                          setLocationSuccess(true)
                          setPositionText('我的位置')
                        },
                      )
                    } else {
                      console.error('浏览器不支持地理位置')
                      // 即使浏览器不支持地理位置，也要设置定位成功状态
                      setLocationSuccess(true)
                      setPositionText('我的位置')
                    }
                  }}
                >
                  <LocationIcon className="w-8 h-8" />
                </button>
              </div>
              <div className="w-px h-6 bg-gray-200 mx-3"></div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="位置/品牌/酒店"
                  className="w-full px-3 py-2 bg-gray-100 rounded text-sm border-0"
                />
              </div>
            </div>

            {/* 钟点房日期选择 */}
            <div className="h-12 border-b border-gray-100 flex items-center">
              <div className="font-medium">
                {checkInDate
                  ? `${checkInDate.getMonth() + 1}月${checkInDate.getDate()}日`
                  : '选择日期'}
                {checkInDate && checkInDate.toDateString() === new Date().toDateString()
                  ? '今天'
                  : ''}
              </div>
            </div>
          </>
        )}

        {/* 民宿标签内容 */}
        {activeTab === 'homestay' && (
          <>
            {/* 定位成功提示条 - 只在定位成功后显示 */}
            {locationSuccess && (
              <div className="px-4 py-2 bg-blue-50 flex items-center mb-4">
                <svg
                  className="w-4 h-4 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-blue-600 text-sm">已定位到 {locationAddress}</span>
              </div>
            )}

            {/* 位置和搜索框 */}
            <div className="flex items-center h-12 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-gray-700">
                <button className="font-medium cursor-pointer" onClick={handleOpenCitySelector}>
                  {positionText === '我的位置' ? '我的位置' : selectedCity}
                </button>
                <span className="text-gray-400 text-xs">▼</span>
                <button
                  className="cursor-pointer"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          console.log('获取位置成功:', position)
                          const { latitude, longitude } = position.coords

                          // 使用高德地图逆地理编码API获取实际地址
                          const apiKey = '3d96555e2d9edb939b5a22b8e602198b'
                          const url = `https://restapi.amap.com/v3/geocode/regeo?key=${apiKey}&location=${longitude},${latitude}&extensions=base`

                          try {
                            const response = await fetch(url)
                            const data = await response.json()
                            if (data.status === '1' && data.regeocode) {
                              const address = data.regeocode.formatted_address
                              setLocationAddress(address)
                              console.log('获取地址成功:', address)

                              // 提取城市名字
                              let cityName = '未知城市'
                              if (data.regeocode.addressComponent) {
                                if (data.regeocode.addressComponent.city) {
                                  cityName = data.regeocode.addressComponent.city
                                } else if (data.regeocode.addressComponent.province) {
                                  cityName = data.regeocode.addressComponent.province
                                }
                              }
                              console.log('提取的城市名字:', cityName)

                              // 更新城市选择
                              setSelectedCity(cityName)
                              setPositionText('我的位置')
                            }
                          } catch (error) {
                            console.error('获取地址失败:', error)
                            // 即使获取地址失败，也要设置定位成功状态
                            setLocationSuccess(true)
                            setPositionText('我的位置')
                          }

                          setLocationSuccess(true)
                        },
                        (error) => {
                          console.error('获取位置失败:', error)
                          // 即使获取位置失败，也要设置定位成功状态
                          setLocationSuccess(true)
                          setPositionText('我的位置')
                        },
                      )
                    } else {
                      console.error('浏览器不支持地理位置')
                      // 即使浏览器不支持地理位置，也要设置定位成功状态
                      setLocationSuccess(true)
                      setPositionText('我的位置')
                    }
                  }}
                >
                  <LocationIcon className="w-8 h-8" />
                </button>
              </div>
              <div className="w-px h-6 bg-gray-200 mx-3"></div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="关键词/位置"
                  className="w-full px-3 py-2 bg-gray-100 rounded text-sm border-0"
                />
              </div>
            </div>

            {/* 日期时间选择器 */}
            <div className="h-12 border-b border-gray-100 flex items-center justify-center">
              <button className="w-full" onClick={() => setShowDateSelector(true)}>
                <DateTimeSelector
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  onDateChange={handleDateChange}
                  onOpenFullSelector={() => setShowDateSelector(true)}
                />
              </button>
            </div>

            {/* 人数选择 */}
            <div className="h-12 border-b border-gray-100 flex items-center">
              <div
                className="flex items-center space-x-2 text-gray-700 cursor-pointer"
                onClick={() => setShowRoomSelector(true)}
              >
                <span className="font-medium">
                  {roomCount}间房 {adultCount}成人 {childCount}儿童
                </span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>
            </div>
          </>
        )}

        {/* 查询按钮 */}
        <div className="py-4">
          <button
            className="w-full py-3 rounded-full font-medium text-lg bg-blue-600 text-white"
            onClick={() => {
              // 构建查询参数
              const params = new URLSearchParams()
              // 添加城市参数
              const city = positionText === '我的位置' ? '上海' : selectedCity
              params.append('city', city)
              // 添加入住时间参数
              if (checkInDate) {
                params.append('checkIn', checkInDate.toISOString())
              }
              // 添加离店时间参数
              if (checkOutDate) {
                params.append('checkOut', checkOutDate.toISOString())
              }
              // 添加标签参数
              const tags = [...selectedTags]
              // 在民宿标签页，添加民宿标签
              if (activeTab === 'homestay' && !tags.includes('民宿')) {
                tags.push('民宿')
              }
              // 在海外标签页，添加海外标签
              if (activeTab === 'overseas' && !tags.includes('海外')) {
                tags.push('海外')
              }
              params.append('tags', tags.join(','))
              // 添加客房和入住人数参数
              params.append('roomCount', roomCount.toString())
              params.append('adultCount', adultCount.toString())
              params.append('childCount', childCount.toString())
              // 跳转到酒店列表页面
              setTimeout(() => {
                window.location.href = `/mobile/hotel-list?${params.toString()}`
              }, 0)
            }}
          >
            查询
          </button>
        </div>
      </div>

      {/* 定位提醒弹窗 */}
      {showLocationAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 max-w-xs w-full mx-4">
            <div className="text-center mb-4">
              <svg
                className="w-12 h-12 text-yellow-500 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900">定位提醒</h3>
            </div>
            <p className="text-gray-600 text-center mb-6">{locationAlertMessage}</p>
            <button
              className="w-full py-2 bg-blue-600 text-white rounded-md font-medium"
              onClick={() => setShowLocationAlert(false)}
            >
              确定
            </button>
          </div>
        </div>
      )}

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
                onClick={handleRoomSelectorComplete}
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部导航栏 */}
      {/* <MobileNavbar /> */}
    </div>
  )
}

export default HomePage
