// src/app/mobile/index.tsx
'use client'
import React, { useState, useEffect, useRef } from 'react'
import MobileNavbar from './MobileNavbar'
import LocationIcon from './components/LocationIcon'
import DateTimeSelector from './components/DateTimeSelector'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation' // 👉 新增引入

const CitySelector = dynamic(() => import('./components/CitySelector'), { ssr: false })

interface Hotel {
  id: number
  title: string
  address: string
  price: number
  score: number
  star: number
  tags: string
  images: string
}

const HomePage: React.FC = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'domestic' | 'overseas' | 'hourly' | 'homestay'>(
    'domestic',
  )
  const [selectedCity, setSelectedCity] = useState<string>('上海')
  const [defaultCities] = useState({
    domestic: '上海',
    overseas: '东京',
    hourly: '上海',
    homestay: '上海',
  })
  const [showCitySelector, setShowCitySelector] = useState<boolean>(false)

  const [locationSuccess, setLocationSuccess] = useState<boolean>(false)
  const [positionText, setPositionText] = useState<string>('我的位置')

  // --- 列表、分页与筛选状态 ---
  const [recommendedHotels, setRecommendedHotels] = useState<Hotel[]>([])
  const [isLoadingHotels, setIsLoadingHotels] = useState(false)

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const [filterStar, setFilterStar] = useState<number | null>(null)
  const [filterMaxPrice, setFilterMaxPrice] = useState<number | null>(null)

  // 👉 搜索框相关的双向绑定状态
  const [inputText, setInputText] = useState<string>('')
  const [appliedKeyword, setAppliedKeyword] = useState<string>('')

  // 当筛选条件、城市或【搜索词】改变时，重置分页和列表
  useEffect(() => {
    setPage(1)
    setRecommendedHotels([])
    setHasMore(false)
  }, [selectedCity, positionText, filterStar, filterMaxPrice, appliedKeyword])

  // 拉取酒店数据
  useEffect(() => {
    const fetchHotels = async () => {
      if (page === 1) setIsLoadingHotels(true)
      else setIsLoadingMore(true)

      try {
        const queryCity = positionText === '我的位置' ? selectedCity : positionText
        let url = `/api/public/hotel?city=${encodeURIComponent(queryCity)}&page=${page}&pageSize=5`

        if (filterStar) url += `&star=${filterStar}`
        if (filterMaxPrice) url += `&maxPrice=${filterMaxPrice}`
        // 👉 将关键词拼接到请求中
        if (appliedKeyword) url += `&keyword=${encodeURIComponent(appliedKeyword)}`

        const response = await fetch(url)
        const result = await response.json()

        if (result.success) {
          if (page === 1) {
            setRecommendedHotels(result.data || [])
          } else {
            setRecommendedHotels((prev) => [...prev, ...(result.data || [])])
          }
          setHasMore(result.hasMore)
        }
      } catch (error) {
        console.error('拉取酒店数据失败:', error)
      } finally {
        setIsLoadingHotels(false)
        setIsLoadingMore(false)
      }
    }

    fetchHotels()
  }, [page, selectedCity, positionText, filterStar, filterMaxPrice, appliedKeyword])

  // 触底加载更多
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingHotels && !isLoadingMore) {
          setPage((prevPage) => prevPage + 1)
        }
      },
      { threshold: 0.1 },
    )

    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoadingHotels, isLoadingMore])

  const handleTabChange = (tab: 'domestic' | 'overseas' | 'hourly' | 'homestay') => {
    setActiveTab(tab)
    setSelectedCity(defaultCities[tab])
    setLocationSuccess(false)
    setPositionText(defaultCities[tab])
    // 切换标签时顺便清空搜索词
    setInputText('')
    setAppliedKeyword('')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* 城市选择器 */}
      {showCitySelector && (
        <div className="fixed inset-0 z-50 bg-white">
          <CitySelector
            onSelectCity={(city) => {
              setSelectedCity(city)
              setShowCitySelector(false)
              setLocationSuccess(false)
              setPositionText(city)
            }}
            onCancel={() => setShowCitySelector(false)}
          />
        </div>
      )}

      {/* 轮播图 */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="https://img95.699pic.com/photo/50048/1095.jpg_wh860.jpg"
            alt="酒店轮播图"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="px-4 py-3">
        {/* 👉 分类标签，使用 as const 完美解决 any 报错 */}
        <div className="flex items-center space-x-6 mb-4 overflow-x-auto">
          {(['domestic', 'overseas', 'hourly', 'homestay'] as const).map((tab) => (
            <span
              key={tab}
              className={`whitespace-nowrap pb-1 cursor-pointer ${activeTab === tab ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab === 'domestic'
                ? '国内'
                : tab === 'overseas'
                  ? '海外'
                  : tab === 'hourly'
                    ? '钟点房'
                    : '民宿'}
            </span>
          ))}
        </div>

        {/* 定位与搜索框组合 */}
        <div className="flex items-center h-12 border-b border-gray-100 bg-white px-3 rounded-t-lg">
          <div className="flex items-center space-x-2 text-gray-700">
            <button
              className="font-medium cursor-pointer"
              onClick={() => setShowCitySelector(true)}
            >
              {positionText === '我的位置' ? '我的位置' : selectedCity}
            </button>
            <span className="text-gray-400 text-xs">▼</span>
            <button className="cursor-pointer">
              <LocationIcon className="w-6 h-6 text-blue-500" />
            </button>
          </div>
          <div className="w-px h-6 bg-gray-200 mx-3"></div>
          <div className="flex-1 relative">
            {/* 👉 这里正确绑定了 inputText 和 onChange 事件 */}
            <input
              type="text"
              placeholder="位置/品牌/酒店"
              className="w-full bg-transparent text-sm border-0 outline-none"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                // 增加用户体验：在手机键盘上点击“搜索/回车”也能触发查询
                if (e.key === 'Enter') {
                  setAppliedKeyword(inputText)
                }
              }}
            />
          </div>
        </div>

        <div className="h-12 border-b border-gray-100 bg-white px-3 flex items-center justify-center">
          <DateTimeSelector />
        </div>

        {/* 价格星级筛选器 */}
        <div className="bg-white px-3 py-3 rounded-b-lg shadow-sm mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStar(filterStar === 4 ? null : 4)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterStar === 4 ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
            >
              4星及以上
            </button>
            <button
              onClick={() => setFilterMaxPrice(filterMaxPrice === 300 ? null : 300)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterMaxPrice === 300 ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
            >
              300元以内
            </button>
            <button
              onClick={() => setFilterMaxPrice(filterMaxPrice === 500 ? null : 500)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterMaxPrice === 500 ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
            >
              500元以内
            </button>
          </div>
        </div>

        <div className="py-2">
          {/* 👉 查询按钮绑定了 onClick 事件 */}
          <button
            className="w-full py-3 rounded-full font-medium text-lg bg-blue-600 text-white shadow-md active:bg-blue-700 transition-colors"
            onClick={() => setAppliedKeyword(inputText)}
          >
            查询
          </button>
        </div>

        {/* 酒店列表渲染区 */}
        <div className="mt-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">为您推荐</h2>

          {isLoadingHotels && page === 1 ? (
            <div className="text-center text-gray-400 py-6">正在寻找好店...</div>
          ) : recommendedHotels.length > 0 ? (
            <div className="space-y-4">
              {recommendedHotels.map((hotel, index) => {
                let tagsArray: string[] = []
                try {
                  tagsArray = JSON.parse(hotel.tags || '[]')
                } catch (e) {}

                return (
                  <div
                    key={`${hotel.id}-${index}`}
                    className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col active:scale-[0.98] transition-transform"
                    onClick={() => router.push(`/mobile/hotel/${hotel.id}`)}
                  >
                    <img
                      src="https://img95.699pic.com/photo/50048/1095.jpg_wh860.jpg"
                      alt={hotel.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                        {hotel.title}
                      </h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-blue-600 font-bold text-sm">
                          {hotel.score || 4.5}分
                        </span>
                        <span className="text-gray-500 text-xs truncate">{hotel.address}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {tagsArray.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-end mt-3">
                        <div className="text-red-500 font-bold">
                          <span className="text-sm">¥</span>
                          <span className="text-xl">{hotel.price}</span>
                          <span className="text-xs text-gray-400 font-normal ml-1">起</span>
                        </div>
                        <button className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-full active:bg-blue-700">
                          去预订
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div ref={observerRef} className="py-4 text-center text-xs text-gray-400">
                {isLoadingMore ? '正在拼命加载中...' : hasMore ? '上滑加载更多' : '— 到底了 —'}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8 bg-white rounded-xl shadow-sm">
              <div className="mb-2 text-2xl">📭</div>
              暂无符合条件的酒店
            </div>
          )}
        </div>
      </div>

      <MobileNavbar />
    </div>
  )
}

export default HomePage
