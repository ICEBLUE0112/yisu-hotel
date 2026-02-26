import React from 'react'
import NextImage from 'next/image'

interface SafeImageProps {
  src: string | undefined
  alt: string
  width: number
  height: number
  className?: string
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, width, height, className }) => {
  // 默认图片URL
  const defaultImageUrl =
    'https://cn.bing.com/images/search?view=detailV2&ccid=VWtseIkF&id=396ECEB0EEED71FD2EC9F74C9DB6A2B0E0932B69&thid=OIP.VWtseIkF1KVYAuSO09PD_QHaEl&mediaurl=https%3a%2f%2fwww.hilton.com.cn%2ffile%2fimages%2f20250110%2f202501101549098350PvLTD7.jpg&exph=742&expw=1200&q=%e9%87%8d%e5%ba%86%e9%85%92%e5%ba%97%e5%9b%be%e7%89%87&FORM=IRPRST&ck=B92DEA309A7B01249CD7DF82A48ACB9A&selectedIndex=15&itb=0'

  // 检查图片地址是否有效
  const getValidImageUrl = (url: string | undefined): string => {
    // 如果没有图片地址，使用默认图片
    if (!url) {
      return defaultImageUrl
    }

    // 如果图片地址包含 'your-image-url.com'，使用默认图片
    if (url.includes('your-image-url.com')) {
      return defaultImageUrl
    }

    // 否则使用提供的图片地址
    return url
  }

  return (
    <NextImage
      src={getValidImageUrl(src)}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  )
}

export default SafeImage
