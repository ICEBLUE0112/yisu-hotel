'use client'

import React, { useState, useEffect } from 'react'
import { Popup, Calendar } from 'antd-mobile'
import dayjs from 'dayjs'

const DateTimeSelector: React.FC = () => {
  // 1. 真实生效的日期（展示在页面上的）
  const [dates, setDates] = useState<[Date, Date]>([
    new Date(),
    new Date(new Date().getTime() + 86400000),
  ])

  const [visible, setVisible] = useState(false)

  // 👉 2. 新增：弹窗内操作的临时日期
  const [tempDates, setTempDates] = useState<[Date | null, Date | null]>([dates[0], dates[1]])

  // 👉 3. 每次打开弹窗时，将临时日期重置为当前已生效的日期
  useEffect(() => {
    if (visible) {
      // 将同步 setState 改为异步调度，避免级联渲染
      queueMicrotask(() => setTempDates([dates[0], dates[1]]))
    }
  }, [visible, dates])

  const startDate = dates[0]
  const endDate = dates[1]

  const formatDisplayDate = (date: Date) => {
    const d = dayjs(date)
    const today = dayjs().startOf('day')
    const tomorrow = dayjs().add(1, 'day').startOf('day')

    let suffix = ''
    if (d.isSame(today, 'day')) {
      suffix = ' 今天'
    } else if (d.isSame(tomorrow, 'day')) {
      suffix = ' 明天'
    } else {
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      suffix = ` ${weekDays[d.day()]}`
    }

    return `${d.format('MM月DD日')}${suffix}`
  }

  const nights = dayjs(endDate).diff(dayjs(startDate), 'day')

  const today = new Date()
  const isPastMidnight = today.getHours() >= 0 && today.getHours() < 6

  // 👉 4. 确认按钮的点击逻辑
  const handleConfirm = () => {
    if (tempDates[0] && tempDates[1]) {
      setDates([tempDates[0] as Date, tempDates[1] as Date])
      setVisible(false) // 只有点击确认才关闭弹窗
    }
  }

  return (
    <div className="w-full">
      {/* 触发区域：点击打开弹窗 */}
      <div
        className="flex items-center justify-between cursor-pointer active:opacity-70 transition-opacity py-1"
        onClick={() => setVisible(true)}
      >
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-900">{formatDisplayDate(startDate)}</span>
          <span className="text-gray-400 text-sm border-b border-gray-300 w-4 text-center pb-1"></span>
          <span className="font-medium text-gray-900">{formatDisplayDate(endDate)}</span>
        </div>
        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          共{nights}晚
        </span>
      </div>

      {/* 凌晨提示 */}
      {isPastMidnight && (
        <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1.5 rounded-lg text-xs mt-2 border border-yellow-100">
          <span className="text-yellow-500">🌙</span>
          <span className="text-yellow-700">
            当前已过0点，如需今天凌晨6点前入住，请选择 <span className="font-bold">今天</span>
          </span>
        </div>
      )}

      {/* antd-mobile 底部日历弹窗 */}
      <Popup
        visible={visible}
        onMaskClick={() => setVisible(false)}
        position="bottom"
        bodyStyle={{
          height: '80vh', // 稍微加高一点以容纳底部的按钮
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          display: 'flex',
          flexDirection: 'column', // 👉 使用 flex 布局让按钮固定在底部
        }}
      >
        <div className="px-4 py-3 text-center text-lg font-bold text-gray-800 border-b border-gray-100 flex-shrink-0">
          选择入住/离店日期
        </div>

        {/* 日历滚动区 */}
        <div className="flex-1 overflow-y-auto pb-4">
          <Calendar
            selectionMode="range"
            value={[tempDates[0] as Date, tempDates[1] as Date]}
            onChange={(val) => {
              if (val) {
                // 仅更新临时状态，不关闭弹窗
                setTempDates([val[0] || null, val[1] || null])
              }
            }}
            renderLabel={(date) => {
              if (tempDates[0] && dayjs(date).isSame(tempDates[0], 'day')) {
                return <span className="text-white text-[10px] leading-tight mt-0.5">入住</span>
              }
              if (tempDates[1] && dayjs(date).isSame(tempDates[1], 'day')) {
                return <span className="text-white text-[10px] leading-tight mt-0.5">离店</span>
              }
              return null
            }}
          />
        </div>

        {/* 👉 5. 底部固定确认按钮 */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            className={`w-full py-3 rounded-full font-medium text-lg text-white transition-colors ${
              tempDates[0] && tempDates[1]
                ? 'bg-blue-600 active:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            onClick={handleConfirm}
            disabled={!tempDates[0] || !tempDates[1]} // 如果没有选齐两个日期，按钮置灰不可点击
          >
            确定{' '}
            {tempDates[0] && tempDates[1]
              ? `(共 ${dayjs(tempDates[1]).diff(dayjs(tempDates[0]), 'day')} 晚)`
              : ''}
          </button>
        </div>
      </Popup>
    </div>
  )
}

export default DateTimeSelector
