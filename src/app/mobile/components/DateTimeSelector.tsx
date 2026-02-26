import React, { useState, useRef, useEffect } from 'react'

interface DateTimeSelectorProps {
  checkInDate?: Date | null
  checkOutDate?: Date | null
  onDateChange?: (checkInDate: Date | null, checkOutDate: Date | null) => void
  mode?: 'summary' | 'full'
  onOpenFullSelector?: () => void
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  checkInDate: propsCheckInDate,
  checkOutDate: propsCheckOutDate,
  onDateChange,
  mode = 'summary',
  onOpenFullSelector,
}) => {
  // 使用props中的日期作为默认值，同时允许本地修改
  const [localCheckInDate, setLocalCheckInDate] = useState<Date | null>(() => {
    if (propsCheckInDate) {
      return propsCheckInDate
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [localCheckOutDate, setLocalCheckOutDate] = useState<Date | null>(() => {
    if (propsCheckOutDate) {
      return propsCheckOutDate
    }
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  })

  // 用于计算布局高度的ref
  const calendarContainerRef = useRef<HTMLDivElement>(null)
  const monthHeaderRef = useRef<HTMLHeadingElement>(null)

  // 动态计算的高度值
  const [rowHeight, setRowHeight] = useState<number>(48)
  const [headerHeight, setHeaderHeight] = useState<number>(44)

  // 获取当前应该使用的日期值（优先使用本地状态的值，这样可以确保选择过程的连续性）
  const getCurrentCheckInDate = () => {
    return localCheckInDate
  }

  const getCurrentCheckOutDate = () => {
    return localCheckOutDate
  }

  // 当props中的日期变化时，更新本地状态
  useEffect(() => {
    // 避免在useEffect中直接调用setState，使用setTimeout延迟执行
    const updateDates = () => {
      if (propsCheckInDate) {
        setLocalCheckInDate(propsCheckInDate)
      }
      if (propsCheckOutDate) {
        setLocalCheckOutDate(propsCheckOutDate)
      }
    }

    // 使用setTimeout延迟执行，避免级联渲染
    const timer = setTimeout(updateDates, 0)

    // 清理定时器
    return () => clearTimeout(timer)
  }, [propsCheckInDate, propsCheckOutDate])

  // 当日历显示时，计算实际的高度
  useEffect(() => {
    // 等待DOM渲染完成
    const timer = setTimeout(() => {
      // 计算月份标题的高度
      if (monthHeaderRef.current) {
        setHeaderHeight(monthHeaderRef.current.offsetHeight)
      }

      // 计算日历行的高度
      if (calendarContainerRef.current) {
        // 找到第一个日历行
        const firstRow = calendarContainerRef.current.querySelector('.grid.grid-cols-7 > div')
        if (firstRow) {
          // 计算一行的高度（假设所有行高度相同）
          const row = firstRow.parentElement
          if (row) {
            // 计算网格项的高度
            const gridItems = row.querySelectorAll('div')
            if (gridItems.length > 0) {
              const itemHeight = gridItems[0].offsetHeight
              setRowHeight(itemHeight)
            }
          }
        }
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // 当用户点击日期时，更新本地状态并通知父组件
  const handleDateClick = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    // 不能选择过去的日期
    if (date < today) return

    const currentCheckInDate = getCurrentCheckInDate()
    const currentCheckOutDate = getCurrentCheckOutDate()

    // 两步选择：先选入住，再选离店
    if (!currentCheckInDate) {
      // 第一步：选择入住日期
      setLocalCheckInDate(date)
      setLocalCheckOutDate(null)
      // 通知父组件日期变化
      if (onDateChange) {
        onDateChange(date, null)
      }
    } else if (!currentCheckOutDate) {
      // 第二步：选择离店日期，必须晚于入住日期
      if (date > currentCheckInDate) {
        setLocalCheckOutDate(date)
        // 通知父组件日期变化
        if (onDateChange) {
          onDateChange(currentCheckInDate, date)
        }
      } else {
        // 如果选择的日期早于或等于入住日期，则重新选择入住日期
        setLocalCheckInDate(date)
        setLocalCheckOutDate(null)
        // 通知父组件日期变化
        if (onDateChange) {
          onDateChange(date, null)
        }
      }
    } else {
      // 已完成选择，重新开始选择
      setLocalCheckInDate(date)
      setLocalCheckOutDate(null)
      // 通知父组件日期变化
      if (onDateChange) {
        onDateChange(date, null)
      }
    }
  }

  // 状态管理：当前显示的月份标签
  const [currentMonthYear, setCurrentMonthYear] = useState<number>(new Date().getFullYear())
  const [currentMonthMonth, setCurrentMonthMonth] = useState<number>(new Date().getMonth())

  // 状态管理：未来的月份
  const [futureMonths] = useState<{ year: number; month: number }[]>(() => {
    const months = []
    const now = new Date()
    // 生成当前月份及未来11个月
    for (let i = 0; i < 12; i++) {
      const date = new Date(now)
      date.setMonth(date.getMonth() + i)
      months.push({ year: date.getFullYear(), month: date.getMonth() })
    }
    return months
  })

  // 计算月份的行数（5行或6行）
  const getMonthRows = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const firstDayOfWeek = firstDay.getDay() // 0-6，0是星期日

    // 计算需要的行数
    const totalSlots = firstDayOfWeek + daysInMonth
    return Math.ceil(totalSlots / 7)
  }

  // 计算每个月份的高度和累积高度（使用useMemo自动重新计算）
  const monthHeights = React.useMemo(() => {
    const heights: number[] = []

    futureMonths.forEach(({ year, month }, index) => {
      const rows = getMonthRows(year, month)
      const hasHeader = index > 0 // 第一个月没有标题
      const height = rows * rowHeight + (hasHeader ? headerHeight : 0)
      heights.push(height)
    })

    return heights
  }, [rowHeight, headerHeight, futureMonths])

  // 计算累积高度数组
  const getCumulativeHeights = () => {
    const cumulative: number[] = []
    let sum = 0

    monthHeights.forEach((height) => {
      sum += height
      cumulative.push(sum)
    })

    return cumulative
  }

  // 处理滚动事件，更新当前显示的月份标签
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    const cumulativeHeights = getCumulativeHeights()

    // 使用二分查找确定当前滚动位置对应的月份
    let monthIndex = 0
    while (monthIndex < cumulativeHeights.length && scrollTop >= cumulativeHeights[monthIndex]) {
      monthIndex++
    }

    // 确保月份索引在有效范围内
    if (monthIndex >= 0 && monthIndex < futureMonths.length) {
      const { year, month } = futureMonths[monthIndex]
      setCurrentMonthYear(year)
      setCurrentMonthMonth(month)
    }
  }

  // 获取当前日期
  const today = new Date()

  // 生成日历数据
  const generateCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const calendar = []

    // 生成从当月第一天开始，到当月最后一天结束的所有日期
    const date = new Date(firstDay)
    while (date <= lastDay) {
      calendar.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }

    return calendar
  }

  // 格式化日期显示
  const formatDay = (date: Date) => {
    return date.getDate()
  }

  // 检查是否是今天
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  // 检查是否是入住日期
  const isCheckIn = (date: Date) => {
    const currentCheckInDate = getCurrentCheckInDate()
    return currentCheckInDate && date.toDateString() === currentCheckInDate.toDateString()
  }

  // 检查是否是离店日期
  const isCheckOut = (date: Date) => {
    const currentCheckOutDate = getCurrentCheckOutDate()
    return currentCheckOutDate && date.toDateString() === currentCheckOutDate.toDateString()
  }

  // 检查是否是入住和离店之间的日期
  const isBetweenDates = (date: Date) => {
    const currentCheckInDate = getCurrentCheckInDate()
    const currentCheckOutDate = getCurrentCheckOutDate()
    if (!currentCheckInDate || !currentCheckOutDate) return false
    const checkIn = new Date(currentCheckInDate)
    checkIn.setHours(0, 0, 0, 0)
    const checkOut = new Date(currentCheckOutDate)
    checkOut.setHours(0, 0, 0, 0)
    const current = new Date(date)
    current.setHours(0, 0, 0, 0)
    return current > checkIn && current < checkOut
  }

  // 格式化日期为 MM月DD日 格式
  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}月${day}日`
  }

  // 计算入住天数
  const getNights = () => {
    const currentCheckInDate = getCurrentCheckInDate()
    const currentCheckOutDate = getCurrentCheckOutDate()
    if (!currentCheckInDate || !currentCheckOutDate) return 0
    const diffTime = Math.abs(currentCheckOutDate.getTime() - currentCheckInDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // 检查是否已过0点
  const isPastMidnight = new Date().getHours() >= 0 && new Date().getHours() < 6

  return (
    <>
      {/* 摘要模式：显示日期信息，点击后打开完整的日历选择器 */}
      {mode === 'summary' && (
        <div className="w-full" onClick={onOpenFullSelector}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-medium">
                {getCurrentCheckInDate() ? formatDate(getCurrentCheckInDate()!) : '选择入住日期'}{' '}
                {getCurrentCheckInDate() && isToday(getCurrentCheckInDate()!) ? '今天' : ''}
              </span>
              <span className="text-gray-400">-</span>
              <span className="font-medium">
                {getCurrentCheckOutDate() ? formatDate(getCurrentCheckOutDate()!) : '选择离店日期'}{' '}
                {getCurrentCheckOutDate() && isToday(getCurrentCheckOutDate()!) ? '今天' : ''}
              </span>
            </div>
            <span className="text-gray-500">共{getNights()}晚</span>
          </div>
          {isPastMidnight && (
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full text-xs mt-1">
              <span className="text-yellow-500">🌙</span>
              <span className="text-gray-600">
                当前已过0点，如需今天凌晨6点前入住，请选择&nbsp;今天凌晨&nbsp;
              </span>
            </div>
          )}
        </div>
      )}

      {/* 完整模式：显示完整的日历选择器 */}
      {mode === 'full' && (
        <div className="w-full">
          {/* 星期标题 */}
          <div className="flex border-b border-gray-100">
            <div className="flex-1 py-2 text-center text-red-500 text-sm">日</div>
            <div className="flex-1 py-2 text-center text-gray-500 text-sm">一</div>
            <div className="flex-1 py-2 text-center text-gray-500 text-sm">二</div>
            <div className="flex-1 py-2 text-center text-gray-500 text-sm">三</div>
            <div className="flex-1 py-2 text-center text-gray-500 text-sm">四</div>
            <div className="flex-1 py-2 text-center text-gray-500 text-sm">五</div>
            <div className="flex-1 py-2 text-center text-red-500 text-sm">六</div>
          </div>

          {/* 固定月份标签 */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
            <h3 ref={monthHeaderRef} className="text-lg font-medium py-3 px-4">
              {currentMonthYear}年{currentMonthMonth + 1}月
            </h3>
          </div>

          {/* 日历网格 - 显示未来12个月的日历，支持上下滑动 */}
          <div
            ref={calendarContainerRef}
            className="flex-1 overflow-y-auto"
            onScroll={handleScroll}
          >
            {/* 选择离店日期提示 */}
            {getCurrentCheckInDate() && !getCurrentCheckOutDate() && (
              <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm z-10">
                请选择离店日期
              </div>
            )}

            {/* 显示未来月份 */}
            {futureMonths.map(({ year, month }, index) => {
              const calendar = generateCalendar(year, month)
              const isFirstMonth = index === 0

              return (
                <div key={`future-${year}-${month}`} className="mb-0">
                  {/* 月份标题 - 第一个月不显示，因为固定标签已经显示了 */}
                  {!isFirstMonth && (
                    <h3 className="py-3 px-4 border-b border-gray-100 text-sm text-gray-500">
                      {year}年{month + 1}月
                    </h3>
                  )}

                  {/* 日历日期网格 */}
                  <div className="grid grid-cols-7">
                    {/* 添加空白格子，直到当月第一天的星期几 */}
                    {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, index) => (
                      <div
                        key={`empty-${year}-${month}-${index}`}
                        className="flex flex-col items-center justify-center aspect-square border-b border-r border-gray-100"
                      >
                        {/* 空格子 */}
                      </div>
                    ))}

                    {/* 显示当月日期 */}
                    {calendar.map((date: Date, index: number) => {
                      const day = formatDay(date)
                      const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0))

                      return (
                        <div
                          key={`${year}-${month}-${index}`}
                          className={`flex flex-col items-center justify-center aspect-square border-b border-r border-gray-100`}
                        >
                          {/* 日期显示 */}
                          <span
                            className={`text-sm flex items-center justify-center w-full ${isPastDate ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            {day}
                          </span>

                          {/* 选择按钮 */}
                          <button
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm ${isPastDate ? 'text-gray-300 cursor-not-allowed' : isCheckIn(date) ? 'bg-blue-600 text-white' : isCheckOut(date) ? 'bg-blue-600 text-white' : isBetweenDates(date) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                            onClick={() => handleDateClick(date)}
                            disabled={isPastDate}
                          >
                            {isCheckIn(date) && '入住'}
                            {isCheckOut(date) && '离店'}
                            {!isCheckIn(date) && !isCheckOut(date) && !isBetweenDates(date) && ''}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

export default DateTimeSelector
