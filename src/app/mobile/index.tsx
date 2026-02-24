// src/app/mobile/index.tsx
'use client'
import React, { useState } from 'react'
import MobileNavbar from './MobileNavbar'
import LocationIcon from './components/LocationIcon'
import DateTimeSelector from './components/DateTimeSelector'

import dynamic from 'next/dynamic'

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
  const [defaultCities, setDefaultCities] = useState<{
    domestic: string
    overseas: string
    hourly: string
    homestay: string
  }>({
    domestic: '上海',
    overseas: '东京',
    hourly: '上海',
    homestay: '上海',
  })
  // 状态管理：是否显示城市选择器
  const [showCitySelector, setShowCitySelector] = useState<boolean>(false)
  // 状态管理：定位是否成功
  const [locationSuccess, setLocationSuccess] = useState<boolean>(false)
  // 状态管理：定位地址
  const [locationAddress, setLocationAddress] = useState<string>('重庆, 锦辉雅居附近')
  // 状态管理：位置显示文本
  const [positionText, setPositionText] = useState<string>('我的位置')
  // 状态管理：是否显示定位提醒弹窗
  const [showLocationAlert, setShowLocationAlert] = useState<boolean>(false)
  // 状态管理：定位提醒弹窗内容
  const [locationAlertMessage, setLocationAlertMessage] = useState<string>('')
  // 状态管理：日期选择
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

  // 处理日期变化
  const handleDateChange = (newCheckInDate: Date | null, newCheckOutDate: Date | null) => {
    setCheckInDate(newCheckInDate)
    setCheckOutDate(newCheckOutDate)
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
  }

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
          <CitySelector onSelectCity={handleCitySelect} onCancel={handleCancelCitySelect} />
        </div>
      )}
      {/* 轮播图 */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
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
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-white opacity-100"></div>
          <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
          <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
        </div>
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
              <button className="w-full" onClick={() => {}}>
                <DateTimeSelector
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  onDateChange={handleDateChange}
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
                  <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                    免费停车场
                  </span>
                  <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                    豪华酒店
                  </span>
                  <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                    上海虹桥国际机场
                  </span>
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
              <button className="w-full" onClick={() => {}}>
                <DateTimeSelector
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  onDateChange={handleDateChange}
                />
              </button>
            </div>

            {/* 人数选择 */}
            <div className="h-12 border-b border-gray-100 flex items-center">
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="font-medium">1间房 1成人 0儿童</span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>
              <div className="w-px h-6 bg-gray-200 mx-3"></div>
              <div className="text-gray-500 text-sm">价格/钻级</div>
            </div>

            {/* 海外酒店提示 */}
            <div className="h-12 border-b border-gray-100 flex items-center">
              <div className="w-full bg-blue-50 px-3 py-2 rounded">
                <span className="text-blue-600 text-sm">
                  海外酒店按人数收费，请准确选择成人和儿童数
                </span>
              </div>
            </div>

            {/* 筛选标签 */}
            <div className="h-12 border-b border-gray-100 flex items-center">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                  双床房
                </span>
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                  4.5分以上
                </span>
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                  乌节路
                </span>
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                  圣淘沙岛
                </span>
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                  含早餐
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
                  placeholder="关键词/位置"
                  className="w-full px-3 py-2 bg-gray-100 rounded text-sm border-0"
                />
              </div>
            </div>

            {/* 日期时间选择器 */}
            <div className="h-12 border-b border-gray-100 flex items-center justify-center">
              <button className="w-full" onClick={() => {}}>
                <DateTimeSelector
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  onDateChange={handleDateChange}
                />
              </button>
            </div>

            {/* 人数选择 */}
            <div className="h-12 border-b border-gray-100 flex items-center">
              <div className="font-medium">人/床/居数不限</div>
            </div>

            {/* 筛选标签 */}
            <div className="h-12 border-b border-gray-100 flex items-center">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                  今夜特价
                </span>
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                  春节特惠
                </span>
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                  积分当钱花
                </span>
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                  外滩
                </span>
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm">
                  浦东
                </span>
              </div>
            </div>
          </>
        )}

        {/* 查询按钮 */}
        <div className="py-4">
          <button className="w-full py-3 rounded-full font-medium text-lg bg-blue-600 text-white">
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

      {/* 底部导航栏 */}
      <MobileNavbar />
    </div>
  )
}

export default HomePage
