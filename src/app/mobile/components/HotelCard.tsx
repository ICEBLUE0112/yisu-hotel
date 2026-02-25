import React from 'react'
import SafeImage from './SafeImage'

interface HotelCardProps {
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

const HotelCard: React.FC<HotelCardProps> = ({
  id,
  title,
  score,
  reviewCount,
  favoriteCount,
  location,
  tags,
  price,
  originalPrice,
  imageUrl,
  hasVideo = false,
  isFeatured = false,
}) => {
  // 清理图片URL的函数
  const getCleanImageUrl = (url: string | undefined): string => {
    // 直接返回默认图片URL，避免处理复杂的URL格式
    return 'https://pic4.zhimg.com/v2-b5c43c5a19dde02ad0ce5fb3f407b64f_r.jpg'
  }
  return (
    <div
      className="px-4 py-3 border-b border-gray-100 cursor-pointer active:bg-gray-50"
      onClick={() => {
        // 获取当前URL中的查询参数
        const currentSearch = window.location.search
        // 跳转到酒店详情页面，带上当前的查询参数（包括日期信息）
        window.location.href = `/mobile/hotel-detail/${id}${currentSearch}`
      }}
    >
      <div className="flex">
        {/* 酒店图片 */}
        <div className="w-32 h-24 rounded-md overflow-hidden flex-shrink-0 relative">
          <SafeImage
            src={imageUrl}
            alt={title}
            width={128}
            height={96}
            className="w-full h-full object-cover"
          />
          {hasVideo && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
          {isFeatured && (
            <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-br">
              特惠精选
            </div>
          )}
        </div>

        {/* 酒店信息 */}
        <div className="flex-1 ml-3">
          {/* 酒店名称 */}
          <h3 className="font-medium text-sm line-clamp-2">{title}</h3>

          {/* 评分和评论 */}
          <div className="flex items-center mt-1">
            <span className="text-yellow-500 text-xs font-medium">{score}</span>
            <span className="text-xs text-gray-500 ml-1">
              {score >= 4.8 ? '超棒' : score >= 4.5 ? '很好' : score >= 4.0 ? '不错' : '一般'}
            </span>
            <span className="text-xs text-gray-400 ml-2">
              {reviewCount}点评·{favoriteCount}收藏
            </span>
          </div>

          {/* 位置 */}
          <div className="text-xs text-gray-500 mt-1 line-clamp-1">{location}</div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>

          {/* 价格 */}
          <div className="flex items-center mt-1">
            <span className="text-red-500 font-medium text-sm">¥{price}</span>
            <span className="text-gray-400 text-xs ml-1">起</span>
            {originalPrice && (
              <span className="text-gray-400 text-xs line-through ml-2">¥{originalPrice}</span>
            )}
            <span className="ml-auto flex items-center">
              <span className="text-xs text-blue-500">新客体验钻石</span>
              <span className="text-xs text-gray-400 ml-1">4项优惠</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HotelCard
