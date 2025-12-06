import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { calendarAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './AddEventPage.css'

// 뒤로가기 아이콘 SVG 컴포넌트
function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 이전 달 화살표 아이콘 SVG 컴포넌트
function PrevArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 다음 달 화살표 아이콘 SVG 컴포넌트
function NextArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 참여자 추가 아이콘 SVG 컴포넌트
function AddParticipantIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

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
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 10, minute: 0 },
    memo: '',
    notification: ''
  })
  const [participants, setParticipants] = useState([])
  const [participantInput, setParticipantInput] = useState('')
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  const handleAddParticipant = () => {
    if (participantInput.trim() && !participants.includes(participantInput.trim())) {
      setParticipants([...participants, participantInput.trim()])
      setParticipantInput('')
    }
  }

  const handleRemoveParticipant = (index) => {
    setParticipants(participants.filter((_, i) => i !== index))
  }

  const handleParticipantKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddParticipant()
    }
  }

  // 로컬 시간을 MySQL DATETIME 형식으로 변환하는 함수 (YYYY-MM-DD HH:mm:ss)
  const toMySQLDateTime = (date) => {
    if (!date) return null
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const handleSave = async () => {
    if (isSaving) {
      return // 이미 저장 중이면 중복 호출 방지
    }

    if (!formData.title.trim()) {
      alert('일정 제목을 입력해주세요.')
      return
    }

    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.')
      navigate('/login')
      return
    }

    setIsSaving(true)
    try {
      const startDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        formData.startTime.hour,
        formData.startTime.minute,
        0,
        0
      )
      const endDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        formData.endTime.hour,
        formData.endTime.minute,
        0,
        0
      )

      const eventData = {
        title: formData.title,
        startDate: toMySQLDateTime(startDate),
        endDate: toMySQLDateTime(endDate),
        category: selectedCategory.id,
        color: selectedCategory.color,
        participants: participants,
        memo: formData.memo || null,
        notification: formData.notification || null
      }

      const response = await calendarAPI.createEvent(eventData)

      if (response.data && response.data.success) {
        // 일정 추가 후 일정 상세 페이지로 이동
        const createdEventId = response.data.data.id || response.data.data.eventId
        if (createdEventId) {
          navigate(`/calendar/event/${createdEventId}`)
        } else {
          navigate('/calendar')
        }
      } else {
        throw new Error('Failed to create event')
      }
    } catch (err) {
      console.error('이벤트 생성 실패:', err)
      alert('일정 추가에 실패했습니다.')
    } finally {
      setIsSaving(false)
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
        <div className="back-icon">
          <BackIcon />
        </div>
        <span>뒤로</span>
      </button>

      {/* 캘린더 컴포넌트 */}
      <div className="calendar-component">
        <div className="calendar-header-nav">
          <button className="nav-arrow" onClick={handlePrevMonth}>
            <div className="arrow-icon">
              <PrevArrowIcon />
            </div>
          </button>
          <p className="calendar-month">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
          <button className="nav-arrow" onClick={handleNextMonth}>
            <div className="arrow-icon arrow-right">
              <NextArrowIcon />
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
      <div className="participant-section-wrapper">
        <label className="participant-label">참여자</label>
        <div className="participant-section">
          <input
            type="text"
            className="participant-input"
            placeholder="참여자 추가"
            value={participantInput}
            onChange={(e) => setParticipantInput(e.target.value)}
            onKeyPress={handleParticipantKeyPress}
          />
          <button 
            className={`participant-button ${participantInput.trim() ? 'active' : ''}`}
            onClick={handleAddParticipant}
            disabled={!participantInput.trim()}
            type="button"
          >
            <AddParticipantIcon />
          </button>
        </div>
        {participants.length > 0 && (
          <div className="participants-list">
            {participants.map((participant, index) => (
              <div key={index} className="participant-tag">
                <span>{participant}</span>
                <button 
                  className="participant-remove"
                  onClick={() => handleRemoveParticipant(index)}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
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

      {/* 알림 설정 */}
      <div className="notification-section">
        <div className="notification-label">알림</div>
        <div className="notification-dropdown-wrapper">
          <button
            className="notification-button"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            type="button"
          >
            <span>{formData.notification || '없음'}</span>
            <DropdownIcon />
          </button>
          {showNotificationDropdown && (
            <div className="notification-dropdown">
              {['없음', '5분 전', '10분 전', '15분 전', '30분 전', '1시간 전', '2시간 전', '1일 전', '2일 전', '1주 전'].map((option) => (
                <button
                  key={option}
                  className={`notification-option ${formData.notification === option ? 'selected' : ''}`}
                  onClick={() => {
                    handleInputChange('notification', option === '없음' ? '' : option)
                    setShowNotificationDropdown(false)
                  }}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 추가 버튼 */}
      <button 
        className="add-button" 
        onClick={handleSave}
        disabled={isSaving || !formData.title.trim()}
      >
        {isSaving ? '저장 중...' : '추가'}
      </button>
      </div>
    </div>
  )
}

export default AddEventPage
