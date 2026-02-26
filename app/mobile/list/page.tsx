'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Hotel {
  id: number
  title: string
  address: string
  price: number
  score: number
  star: number
  tags: string
}

function HotelListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 从 URL 读取首页传过来的查询参数
  const queryCity = searchParams.get('city') || '上海'
  const queryKeyword = searchParams.get('keyword') || ''

  // 列表、分页与筛选状态
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const [filterStar, setFilterStar] = useState<number | null>(null)
  const [filterMaxPrice, setFilterMaxPrice] = useState<number | null>(null)

  // 当筛选条件改变时，重置分页和列表
  useEffect(() => {
    setPage(1)
    setHotels([])
    setHasMore(false)
  }, [filterStar, filterMaxPrice, queryCity, queryKeyword])

  // 拉取酒店数据
  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoading(true)
      try {
        let url = `/api/public/hotel?city=${encodeURIComponent(queryCity)}&page=${page}&pageSize=5`
        if (filterStar) url += `&star=${filterStar}`
        if (filterMaxPrice) url += `&maxPrice=${filterMaxPrice}`
        if (queryKeyword) url += `&keyword=${encodeURIComponent(queryKeyword)}`

        const response = await fetch(url)
        const result = await response.json()

        if (result.success) {
          if (page === 1) {
            setHotels(result.data || [])
          } else {
            setHotels((prev) => [...prev, ...(result.data || [])])
          }
          setHasMore(result.hasMore)
        }
      } catch (error) {
        console.error('拉取酒店列表失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotels()
  }, [page, queryCity, queryKeyword, filterStar, filterMaxPrice])

  // 触底加载更多
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 0.1 },
    )
    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoading])

  return (
    <div className="min-h-screen bg-gray-50 pb-10 max-w-md mx-auto">
      {/* 👉 1. 顶部核心条件筛选头 (严格对照PDF要求) */}
      <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-20">
        <button onClick={() => router.back()} className="text-gray-500 mr-3 text-lg">
          ←
        </button>
        <div
          className="flex-1 bg-gray-100 rounded-full px-4 py-1.5 flex flex-col justify-center cursor-pointer"
          onClick={() => router.back()}
        >
          <div className="flex items-center text-sm font-bold text-gray-800">
            <span>{queryCity}</span>
            {queryKeyword && <span className="ml-2 text-blue-600 truncate">{queryKeyword}</span>}
          </div>
          <div className="text-[10px] text-gray-500">
            01月09日 - 01月10日 · 共1晚 (点击重新搜索)
          </div>
        </div>
      </div>

      {/* 👉 2. 详细筛选区域 (综合排序/价格/星级) */}
      <div className="bg-white px-4 py-3 shadow-sm mb-3 flex flex-wrap gap-2 sticky top-[60px] z-10">
        <button
          onClick={() => setFilterStar(filterStar === 4 ? null : 4)}
          className={`px-4 py-1.5 text-xs rounded border transition-colors ${filterStar === 4 ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
        >
          4星及以上
        </button>
        <button
          onClick={() => setFilterMaxPrice(filterMaxPrice === 300 ? null : 300)}
          className={`px-4 py-1.5 text-xs rounded border transition-colors ${filterMaxPrice === 300 ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
        >
          300元以内
        </button>
        <button
          onClick={() => setFilterMaxPrice(filterMaxPrice === 500 ? null : 500)}
          className={`px-4 py-1.5 text-xs rounded border transition-colors ${filterMaxPrice === 500 ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
        >
          500元以内
        </button>
      </div>

      {/* 👉 3. 酒店列表 */}
      <div className="px-4">
        {isLoading && page === 1 ? (
          <div className="text-center text-gray-400 py-10">正在为您寻找好店...</div>
        ) : hotels.length > 0 ? (
          <div className="space-y-4">
            {hotels.map((hotel, index) => {
              let tagsArray: string[] = []
              try {
                tagsArray = JSON.parse(hotel.tags || '[]')
              } catch (e) {}

              return (
                <div
                  key={`${hotel.id}-${index}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col active:scale-[0.98] transition-transform cursor-pointer"
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
                          className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded"
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
              {isLoading ? '加载中...' : hasMore ? '上滑加载更多' : '— 到底了 —'}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 bg-white rounded-xl shadow-sm">
            <div className="mb-2 text-2xl">📭</div>暂无符合条件的酒店
          </div>
        )}
      </div>
    </div>
  )
}

// Next.js 要求使用 useSearchParams 的组件必须包裹在 Suspense 中
export default function HotelListPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen flex justify-center items-center">加载中...</div>}
    >
      <HotelListContent />
    </Suspense>
  )
}
