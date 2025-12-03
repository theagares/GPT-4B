import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './AddEventPage.css'

// 아이콘 이미지 URL
const imgVector = "https://www.figma.com/api/mcp/asset/db824051-d071-4c9e-8840-c8a9b8da272b"
const imgVector1 = "https://www.figma.com/api/mcp/asset/d9e6a3bb-fb3e-42dd-b262-1e478ad0bda1"
const imgButton = "https://www.figma.com/api/mcp/asset/b1c95ac0-e7f1-4a27-91f0-452379c5df52"
const imgBackIcon = "https://www.figma.com/api/mcp/asset/ee258417-6b3f-4f61-b06d-4c34a0ab3bbf"

// 드롭다운 아이콘 SVG 컴포넌트
function DropdownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="#6a7282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const WEEKDAYS_KR = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

const CATEGORIES = [
  { id: '미팅', label: '미팅', color: '#584cdc' },
  { id: '업무', label: '업무', color: '#2b7fff' },
  { id: '개인', label: '개인', color: '#00c950' },
  { id: '기타', label: '기타', color: '#9ca3af' }
]

function AddEventPage() {
  const navigate = useNavigate()
  const categoryDropdownRef = useRef(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    participant: '',
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 10, minute: 0 },
    memo: ''
  })

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // 이전 달의 마지막 날들
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: prevMonthDays - i, isCurrentMonth: false })
    }
    
    // 현재 달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, isCurrentMonth: true })
    }
    
    // 다음 달의 첫 날들
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: i, isCurrentMonth: false })
    }
    
    return days
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (day) => {
    if (day.isCurrentMonth) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date)
      setSelectedDate(newDate)
    }
  }

  const isSelectedDate = (day) => {
    if (!day.isCurrentMonth) return false
    return selectedDate.getDate() === day.date &&
           selectedDate.getMonth() === currentDate.getMonth() &&
           selectedDate.getFullYear() === currentDate.getFullYear()
  }

  const formatDateForDisplay = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekday = WEEKDAYS_KR[date.getDay()]
    return `${year}년 ${month}월 ${day}일 ${weekday}`
  }

  const formatTimeForDisplay = (startTime, endTime) => {
    const formatTime = (time) => {
      const period = time.hour < 12 ? '오전' : '오후'
      const hour = time.hour > 12 ? time.hour - 12 : (time.hour === 0 ? 12 : time.hour)
      return `${period} ${hour}시${time.minute > 0 ? ` ${time.minute}분` : ''}`
    }
    return `${formatTime(startTime)}~${formatTime(endTime)}`
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTimeChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: parseInt(value) || 0
      }
    }))
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setShowCategoryDropdown(false)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('일정 제목을 입력해주세요.')
      return
    }

    try {
      // TODO: 백엔드 API로 이벤트 생성
      // const eventData = {
      //   summary: formData.title,
      //   start: {
      //     dateTime: new Date(
      //       selectedDate.getFullYear(),
      //       selectedDate.getMonth(),
      //       selectedDate.getDate(),
      //       formData.startTime.hour,
      //       formData.startTime.minute
      //     ).toISOString()
      //   },
      //   end: {
      //     dateTime: new Date(
      //       selectedDate.getFullYear(),
      //       selectedDate.getMonth(),
      //       selectedDate.getDate(),
      //       formData.endTime.hour,
      //       formData.endTime.minute
      //     ).toISOString()
      //   },
      //   colorId: selectedCategory.id === '미팅' ? '1' : selectedCategory.id === '업무' ? '2' : selectedCategory.id === '개인' ? '3' : '4',
      //   extendedProperties: {
      //     private: {
      //       participant: formData.participant,
      //       memo: formData.memo
      //     }
      //   }
      // }
      // const response = await fetch('/api/calendar/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventData)
      // })

      // 임시: localStorage에 저장
      const newEvent = {
        id: `event_${Date.now()}`,
        title: formData.title,
        participant: formData.participant,
        startDate: new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          formData.startTime.hour,
          formData.startTime.minute
        ),
        endDate: new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          formData.endTime.hour,
          formData.endTime.minute
        ),
        category: selectedCategory.id,
        color: selectedCategory.color,
        memo: formData.memo
      }

      const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
      storedEvents.push({
        ...newEvent,
        startDate: newEvent.startDate.toISOString(),
        endDate: newEvent.endDate.toISOString()
      })
      localStorage.setItem('calendarEvents', JSON.stringify(storedEvents))

      navigate('/calendar')
    } catch (err) {
      console.error('이벤트 생성 실패:', err)
      alert('일정 추가에 실패했습니다.')
    }
  }

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false)
      }
    }

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCategoryDropdown])

  const handleBack = () => {
    navigate('/calendar')
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      navigate('/calendar')
    }
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className="add-event-page-overlay" onClick={handleOverlayClick}>
      <div className="add-event-page">
      {/* 뒤로가기 버튼 */}
      <button className="back-button" onClick={handleBack}>
        <img src={imgBackIcon} alt="뒤로" className="back-icon" />
        <span>뒤로</span>
      </button>

      {/* 캘린더 컴포넌트 */}
      <div className="calendar-component">
        <div className="calendar-header-nav">
          <button className="nav-arrow" onClick={handlePrevMonth}>
            <div className="arrow-icon">
              <img src={imgVector1} alt="이전" className="arrow-img" />
            </div>
          </button>
          <p className="calendar-month">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
          <button className="nav-arrow" onClick={handleNextMonth}>
            <div className="arrow-icon arrow-right">
              <img src={imgVector} alt="다음" className="arrow-img" />
            </div>
          </button>
        </div>

        <div className="calendar-days-header">
          {DAYS.map((day, index) => (
            <div key={index} className="day-header">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days-grid">
          {days.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${!day.isCurrentMonth ? 'inactive' : ''} ${isSelectedDate(day) ? 'active' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <span className="day-number">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 일정 제목 및 카테고리 */}
      <div className="event-header-section">
        <input
          type="text"
          className="event-title-input"
          placeholder={`${selectedDate.getDate()}일`}
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
        />
        <div className="category-dropdown-wrapper" ref={categoryDropdownRef}>
          <button
            className="category-button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <div className="category-dot" style={{ backgroundColor: selectedCategory.color }}></div>
            <span>{selectedCategory.label}</span>
            <DropdownIcon />
          </button>
          {showCategoryDropdown && (
            <div className="category-dropdown">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  className="category-option"
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="category-dot" style={{ backgroundColor: category.color }}></div>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 참여자 추가 */}
      <div className="participant-section">
        <input
          type="text"
          className="participant-input"
          placeholder="참여자 추가"
          value={formData.participant}
          onChange={(e) => handleInputChange('participant', e.target.value)}
        />
        <button className="participant-button">
          <img src={imgButton} alt="참여자 추가" />
        </button>
      </div>

      {/* 날짜/시간 표시 */}
      <div className="datetime-section">
        <div className="date-display">
          {formatDateForDisplay(selectedDate)}
        </div>
        <button
          className="time-display"
          onClick={() => setShowTimePicker(!showTimePicker)}
        >
          {formatTimeForDisplay(formData.startTime, formData.endTime)}
        </button>
      </div>

      {/* 시간 선택기 */}
      {showTimePicker && (
        <div className="time-picker-modal">
          <div className="time-picker-content">
            <h3>시작 시간</h3>
            <div className="time-inputs">
              <input
                type="number"
                min="0"
                max="23"
                value={formData.startTime.hour}
                onChange={(e) => handleTimeChange('startTime', 'hour', e.target.value)}
                className="time-input"
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.startTime.minute}
                onChange={(e) => handleTimeChange('startTime', 'minute', e.target.value)}
                className="time-input"
              />
            </div>
            <h3>종료 시간</h3>
            <div className="time-inputs">
              <input
                type="number"
                min="0"
                max="23"
                value={formData.endTime.hour}
                onChange={(e) => handleTimeChange('endTime', 'hour', e.target.value)}
                className="time-input"
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.endTime.minute}
                onChange={(e) => handleTimeChange('endTime', 'minute', e.target.value)}
                className="time-input"
              />
            </div>
            <button
              className="time-picker-close"
              onClick={() => setShowTimePicker(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 메모 입력 */}
      <div className="memo-section">
        <textarea
          className="memo-input"
          placeholder="메모, URL 또는 첨부 파일 추가"
          value={formData.memo}
          onChange={(e) => handleInputChange('memo', e.target.value)}
        />
      </div>

      {/* 추가 버튼 */}
      <button className="add-button" onClick={handleSave}>
        추가
      </button>
      </div>
    </div>
  )
}

export default AddEventPage


