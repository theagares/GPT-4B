import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import './CalendarPage.css'

const imgGpt4B1 = "https://www.figma.com/api/mcp/asset/a3f2241c-a552-4bd3-b5e3-fa9bb210880a"
const imgIcon = "https://www.figma.com/api/mcp/asset/8c0e2d4e-0d4b-4f42-bb90-de66d03a6b27"
const imgButton = "https://www.figma.com/api/mcp/asset/b1c95ac0-e7f1-4a27-91f0-452379c5df52"
const imgBackIcon = "https://www.figma.com/api/mcp/asset/ee258417-6b3f-4f61-b06d-4c34a0ab3bbf"

const WEEKDAYS_KR = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

const CATEGORIES = [
  { id: '미팅', label: '미팅', color: '#584cdc' },
  { id: '업무', label: '업무', color: '#2b7fff' },
  { id: '개인', label: '개인', color: '#00c950' },
  { id: '기타', label: '기타', color: '#9ca3af' }
]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// 구글 캘린더 색상 ID를 UI 색상으로 매핑
// 구글 캘린더 colorId: 1-11 (기본 색상), 여기서는 카테고리별 색상으로 매핑
const COLOR_MAP = {
  '미팅': '#ad46ff',
  '업무': '#2b7fff',
  '개인': '#00c950',
  '기타': '#9ca3af'
}

// 구글 캘린더 colorId를 카테고리로 변환 (기본값)
const getCategoryFromColorId = (colorId) => {
  // 구글 캘린더 colorId에 따라 카테고리 매핑
  // 실제로는 이벤트의 description이나 extendedProperties에서 카테고리를 가져올 수 있음
  const categoryMap = {
    '1': '미팅',   // 라벨 1
    '2': '업무',   // 라벨 2
    '3': '개인',   // 라벨 3
    '4': '기타',   // 라벨 4
  }
  return categoryMap[colorId] || '기타'
}

// ISO 8601 날짜 문자열을 Date 객체로 변환
const parseISODate = (dateString) => {
  if (!dateString) return null
  // dateTime 형식 (2021-09-19T10:00:00+09:00) 또는 date 형식 (2021-09-19)
  return new Date(dateString)
}

// Date 객체를 YYYY-MM-DD 형식으로 변환
const formatDateToISO = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Date 객체를 시간 문자열로 변환 (HH:MM)
const formatTime = (date) => {
  if (!date) return ''
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function CalendarPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const categoryDropdownRef = useRef(null)
  const isAddEventPage = location.pathname === '/calendar/add'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([]) // 구글 캘린더 이벤트 배열
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [modalPosition, setModalPosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const modalRef = useRef(null)
  const [participants, setParticipants] = useState([])
  const [participantInput, setParticipantInput] = useState('')
  const [modalSelectedDate, setModalSelectedDate] = useState(new Date())
  
  const [formData, setFormData] = useState({
    title: '',
    participant: '',
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 10, minute: 0 },
    memo: '',
    notification: ''
  })

  // 구글 캘린더 API에서 이벤트를 가져오는 함수 (백엔드 연동 시 사용)
  // TODO: 백엔드 API 엔드포인트로 변경
  const fetchCalendarEvents = async (startDate, endDate) => {
    setLoading(true)
    setError(null)
    
    try {
      // 백엔드 API 호출 예시
      // const response = await fetch(`/api/calendar/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
      // const data = await response.json()
      // return data.events || []
      
      // 임시: 샘플 데이터 (구글 캘린더 형식)
      // 실제 백엔드 연동 시에는 이 부분을 API 호출로 대체
      const today = new Date()
      const todayStr = formatDateToISO(today)
      const todayISO = `${todayStr}T`
      
      const sampleEvents = [
        {
          id: 'event1',
          summary: 'A사 미팅',
          start: { dateTime: `${todayISO}10:00:00+09:00` },
          end: { dateTime: `${todayISO}11:00:00+09:00` },
          colorId: '1',
          description: '미팅',
          location: '',
          extendedProperties: {
            private: {
              participant: '지문호',
              memo: '첫 번째 미팅입니다. 모두 참석 부탁드립니다.'
            }
          }
        },
        {
          id: 'event2',
          summary: '프로젝트 마감',
          start: { dateTime: `${todayISO}15:00:00+09:00` },
          end: { dateTime: `${todayISO}16:00:00+09:00` },
          colorId: '2',
          description: '업무',
          location: '',
          extendedProperties: {
            private: {
              participant: '',
              memo: ''
            }
          }
        },
        {
          id: 'event3',
          summary: '점심 약속',
          start: { dateTime: `${todayISO}12:30:00+09:00` },
          end: { dateTime: `${todayISO}13:30:00+09:00` },
          colorId: '3',
          description: '개인',
          location: '',
          extendedProperties: {
            private: {
              participant: '',
              memo: ''
            }
          }
        }
      ]
      
      // 현재 월의 이벤트만 반환 (실제로는 API에서 startDate와 endDate로 필터링)
      return sampleEvents
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // 구글 캘린더 이벤트를 UI 형식으로 변환
  const transformGoogleEvent = (googleEvent) => {
    const startDate = parseISODate(googleEvent.start?.dateTime || googleEvent.start?.date)
    const category = googleEvent.description || getCategoryFromColorId(googleEvent.colorId)
    const color = COLOR_MAP[category] || COLOR_MAP['기타']
    const extendedProps = googleEvent.extendedProperties?.private || {}
    
    return {
      id: googleEvent.id,
      title: googleEvent.summary || '제목 없음',
      time: formatTime(startDate),
      startDate: startDate,
      endDate: parseISODate(googleEvent.end?.dateTime || googleEvent.end?.date),
      category: category,
      color: color,
      description: googleEvent.description,
      location: googleEvent.location,
      participant: extendedProps.participant || '',
      memo: extendedProps.memo || '',
      // 원본 구글 캘린더 이벤트 데이터 보관 (필요시 사용)
      rawEvent: googleEvent
    }
  }

  // 이벤트를 날짜별로 그룹화
  const eventsByDate = useMemo(() => {
    const grouped = {}
    events.forEach(event => {
      const dateKey = formatDateToISO(event.startDate)
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    
    // 각 날짜의 이벤트를 시간순으로 정렬
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return a.startDate.getTime() - b.startDate.getTime()
      })
    })
    
    return grouped
  }, [events])

  // 현재 월이 변경될 때 이벤트 로드
  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    fetchCalendarEvents(startDate, endDate).then(googleEvents => {
      const transformedEvents = googleEvents.map(transformGoogleEvent)
      
      // localStorage에서 저장된 이벤트도 불러오기
      try {
        const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
        const storedTransformed = storedEvents
          .filter(e => {
            const eventDate = new Date(e.startDate)
            return eventDate >= startDate && eventDate <= endDate
          })
          .map(e => ({
            id: e.id,
            title: e.title,
            time: formatTime(new Date(e.startDate)),
            startDate: new Date(e.startDate),
            endDate: new Date(e.endDate),
            category: e.category,
            color: e.color,
            description: e.category,
            location: '',
            participant: e.participant || '',
            memo: e.memo || ''
          }))
        
        setEvents([...transformedEvents, ...storedTransformed])
      } catch (err) {
        console.error('저장된 이벤트 로드 실패:', err)
        setEvents(transformedEvents)
      }
    })
  }, [currentDate])

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
    
    // 다음 달의 첫 날들 (캘린더를 채우기 위해)
    const remainingDays = 42 - days.length // 6주 * 7일
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
      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date))
    }
  }

  const isSelectedDate = (day) => {
    if (!day.isCurrentMonth) return false
    return selectedDate.getDate() === day.date &&
           selectedDate.getMonth() === currentDate.getMonth() &&
           selectedDate.getFullYear() === currentDate.getFullYear()
  }

  const hasEventsForDay = (day) => {
    if (!day.isCurrentMonth) return false
    
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date)
    const dayDateStr = formatDateToISO(dayDate)
    
    return events.some(event => {
      const eventDate = formatDateToISO(event.startDate)
      return eventDate === dayDateStr
    })
  }

  const getEventsForDate = (date) => {
    const dateStr = formatDateToISO(date)
    return eventsByDate[dateStr] || []
  }

  const formatDateForEventList = (date) => {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  // 일정 추가 핸들러
  const handleAddSchedule = () => {
    setModalSelectedDate(selectedDate)
    setParticipants([])
    setParticipantInput('')
    setShowAddEventModal(true)
  }

  const handleCloseModal = () => {
    setShowAddEventModal(false)
    // 폼 데이터 초기화
    setFormData({
      title: '',
      participant: '',
      startTime: { hour: 9, minute: 0 },
      endTime: { hour: 10, minute: 0 },
      memo: '',
      notification: ''
    })
    setSelectedCategory(CATEGORIES[0])
    setParticipants([])
    setParticipantInput('')
    setModalSelectedDate(selectedDate)
    setModalPosition(0)
  }

  const handleAddParticipant = () => {
    if (participantInput.trim()) {
      setParticipants([...participants, participantInput.trim()])
      setParticipantInput('')
    }
  }

  const handleRemoveParticipant = (index) => {
    setParticipants(participants.filter((_, i) => i !== index))
  }

  const handleParticipantKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddParticipant()
    }
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
      // eslint-disable-next-line no-alert
      alert('일정 제목을 입력해주세요.')
      return
    }

    try {
      const newEvent = {
        id: `event_${Date.now()}`,
        title: formData.title,
        participant: participants.join(', '),
        startDate: new Date(
          modalSelectedDate.getFullYear(),
          modalSelectedDate.getMonth(),
          modalSelectedDate.getDate(),
          formData.startTime.hour,
          formData.startTime.minute
        ),
        endDate: new Date(
          modalSelectedDate.getFullYear(),
          modalSelectedDate.getMonth(),
          modalSelectedDate.getDate(),
          formData.endTime.hour,
          formData.endTime.minute
        ),
        category: selectedCategory.id,
        color: selectedCategory.color,
        memo: formData.memo,
        notification: formData.notification
      }

      const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
      storedEvents.push({
        ...newEvent,
        startDate: newEvent.startDate.toISOString(),
        endDate: newEvent.endDate.toISOString()
      })
      localStorage.setItem('calendarEvents', JSON.stringify(storedEvents))

      // 이벤트 목록 새로고침
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)
      
      fetchCalendarEvents(startDate, endDate).then(googleEvents => {
        const transformedEvents = googleEvents.map(transformGoogleEvent)
        
        try {
          const stored = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
          const storedTransformed = stored
            .filter(e => {
              const eventDate = new Date(e.startDate)
              return eventDate >= startDate && eventDate <= endDate
            })
            .map(e => ({
              id: e.id,
              title: e.title,
              time: formatTime(new Date(e.startDate)),
              startDate: new Date(e.startDate),
              endDate: new Date(e.endDate),
              category: e.category,
              color: e.color,
              description: e.category,
              location: '',
              participant: e.participant || '',
              memo: e.memo || ''
            }))
            
          setEvents([...transformedEvents, ...storedTransformed])
        } catch (err) {
          console.error('저장된 이벤트 로드 실패:', err)
          setEvents(transformedEvents)
        }
      })

      handleCloseModal()
    } catch (err) {
      console.error('이벤트 생성 실패:', err)
      // eslint-disable-next-line no-alert
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

  // 모달 드래그 핸들러
  const handleModalMouseDown = (e) => {
    // 드래그 핸들만 클릭 가능하도록
    if (e.target.closest('.modal-drag-handle')) {
      setIsDragging(true)
      setDragStartY(e.clientY - modalPosition)
      e.preventDefault()
    }
  }

  const handleModalTouchStart = (e) => {
    if (e.target.closest('.modal-drag-handle')) {
      setIsDragging(true)
      setDragStartY(e.touches[0].clientY - modalPosition)
      e.preventDefault()
    }
  }

  useEffect(() => {
    if (!isDragging) return

    let lastPosition = modalPosition
    
    const handleModalMouseMove = (e) => {
      const newPosition = e.clientY - dragStartY
      // 위로는 드래그할 수 없게 (0 이상만 허용, 아래로만 드래그 가능)
      lastPosition = Math.max(0, newPosition)
      setModalPosition(lastPosition)
    }

    const handleModalTouchMove = (e) => {
      e.preventDefault()
      const newPosition = e.touches[0].clientY - dragStartY
      // 위로는 드래그할 수 없게 (0 이상만 허용, 아래로만 드래그 가능)
      lastPosition = Math.max(0, newPosition)
      setModalPosition(lastPosition)
    }

    const handleModalMouseUp = () => {
      setIsDragging(false)
      // 드래그 핸들이 화면 밖으로 나가면(아래로 충분히 내려가면) 모달 닫기
      if (lastPosition > window.innerHeight * 0.4) {
        handleCloseModal()
      }
      // 그 외에는 현재 위치에 고정
    }

    const handleModalTouchEnd = () => {
      setIsDragging(false)
      if (lastPosition > window.innerHeight * 0.3) {
        handleCloseModal()
      }
      // 그 외에는 현재 위치에 고정
    }

    document.addEventListener('mousemove', handleModalMouseMove)
    document.addEventListener('mouseup', handleModalMouseUp)
    document.addEventListener('touchmove', handleModalTouchMove, { passive: false })
    document.addEventListener('touchend', handleModalTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleModalMouseMove)
      document.removeEventListener('mouseup', handleModalMouseUp)
      document.removeEventListener('touchmove', handleModalTouchMove)
      document.removeEventListener('touchend', handleModalTouchEnd)
    }
  }, [isDragging, dragStartY, modalPosition])

  const days = getDaysInMonth(currentDate)
  const currentEvents = getEventsForDate(selectedDate)

  return (
    <div className="calendar-page">
      <div className="logo-header">
        <img src={imgGpt4B1} alt="GPT-4b Logo" className="calendar-logo" />
      </div>

      <div className="calendar-component">
        <div className="calendar-header-nav">
          <button className="nav-arrow" onClick={handlePrevMonth}>
            <span className="arrow-text">&lt;</span>
          </button>
          <p className="calendar-month">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
          <button className="nav-arrow" onClick={handleNextMonth}>
            <span className="arrow-text">&gt;</span>
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
              className={`calendar-day ${!day.isCurrentMonth ? 'inactive' : ''} ${isSelectedDate(day) ? 'active' : ''} ${hasEventsForDay(day) ? 'has-events' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <span className="day-number">{day.date}</span>
              {hasEventsForDay(day) && <span className="event-dot" />}
            </div>
          ))}
        </div>
      </div>

      <div className="add-schedule-header">
        <button className="add-schedule-btn" onClick={handleAddSchedule}>
          <span className="add-schedule-plus">+</span>
          <span className="add-schedule-text">일정 추가</span>
        </button>
      </div>

      <div className="events-section">
        <div className="events-header">
          <h3 className="events-title">{formatDateForEventList(selectedDate)} 일정</h3>
        </div>
        <div className="events-list">
          {loading ? (
            <div className="no-events">일정을 불러오는 중...</div>
          ) : error ? (
            <div className="no-events error">일정을 불러오는 중 오류가 발생했습니다: {error}</div>
          ) : currentEvents.length > 0 ? (
            currentEvents.map((event) => (
              <div 
                key={event.id} 
                className="event-item"
                onClick={() => navigate(`/calendar/event/${event.id}`)}
              >
                <div className="event-content">
                  <div className="event-time">{event.time}</div>
                  <div className="event-color-bar" style={{ backgroundColor: event.color }} />
                  <div className="event-details">
                    <div className="event-title">{event.title}</div>
                    <div className="event-badge" style={{ backgroundColor: event.color }}>
                      {event.category}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">등록된 일정이 없습니다.</div>
          )}
        </div>
      </div>

      {/* 일정 추가 모달 */}
      {showAddEventModal && (
        <div className="add-event-modal-overlay" onClick={handleCloseModal}>
          <div 
            className="add-event-modal" 
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleModalMouseDown}
            onTouchStart={handleModalTouchStart}
            style={{ 
              transform: `translateY(${modalPosition}px)`,
              height: '70vh',
              maxHeight: 'calc(100vh - 83px)'
            }}
          >
            {/* 드래그 핸들 */}
            <div className="modal-drag-handle" />

            {/* 일정 제목 및 카테고리 */}
            <div className="event-header-section">
              <label className="event-title-label">일정 제목</label>
              <div className="title-input-wrapper">
                <input
                  type="text"
                  className="event-title-input"
                  placeholder={`A사 미팅`}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
                <div className="category-dropdown-wrapper" ref={categoryDropdownRef}>
                  <button
                    className="category-button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <div className="category-dot" style={{ backgroundColor: selectedCategory.color }} />
                    <span>{selectedCategory.label}</span>
                    <img src={imgIcon} alt="드롭다운" className="dropdown-icon" />
                  </button>
                  {showCategoryDropdown && (
                    <div className="category-dropdown">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.id}
                          className="category-option"
                          onClick={() => handleCategorySelect(category)}
                        >
                          <div className="category-dot" style={{ backgroundColor: category.color }} />
                          <span>{category.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
            {participants.length > 0 && (
              <div className="participants-list">
                {participants.map((participant, index) => (
                  <div key={index} className="participant-tag">
                    <span>{participant}</span>
                    <button 
                      className="participant-remove"
                      onClick={() => handleRemoveParticipant(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 날짜/시간 표시 */}
            <div className="datetime-section">
              <button
                className="date-display date-picker-button"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                {formatDateForDisplay(modalSelectedDate)}
              </button>
              <button
                className="time-display"
                onClick={() => setShowTimePicker(!showTimePicker)}
              >
                {formatTimeForDisplay(formData.startTime, formData.endTime)}
              </button>
            </div>

            {/* 날짜 선택기 */}
            {showDatePicker && (
              <div className="date-picker-modal">
                <div className="date-picker-content">
                  <h3>날짜 선택</h3>
                  <div className="date-picker-inputs">
                    <div className="date-input-group">
                      <label>년</label>
                      <input
                        type="number"
                        min="2020"
                        max="2100"
                        value={modalSelectedDate.getFullYear()}
                        onChange={(e) => {
                          const newDate = new Date(modalSelectedDate)
                          newDate.setFullYear(parseInt(e.target.value, 10) || 2025)
                          setModalSelectedDate(newDate)
                        }}
                        className="date-input"
                      />
                    </div>
                    <div className="date-input-group">
                      <label>월</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={modalSelectedDate.getMonth() + 1}
                        onChange={(e) => {
                          const newDate = new Date(modalSelectedDate)
                          newDate.setMonth((parseInt(e.target.value, 10) || 1) - 1)
                          setModalSelectedDate(newDate)
                        }}
                        className="date-input"
                      />
                    </div>
                    <div className="date-input-group">
                      <label>일</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={modalSelectedDate.getDate()}
                        onChange={(e) => {
                          const newDate = new Date(modalSelectedDate)
                          newDate.setDate(parseInt(e.target.value, 10) || 1)
                          setModalSelectedDate(newDate)
                        }}
                        className="date-input"
                      />
                    </div>
                  </div>
                  <button
                    className="date-picker-close"
                    onClick={() => setShowDatePicker(false)}
                  >
                    확인
                  </button>
                </div>
              </div>
            )}

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
              <label className="memo-label">메모</label>
              <textarea
                className="memo-input"
                placeholder="메모, URL 또는 첨부 파일 추가"
                value={formData.memo}
                onChange={(e) => handleInputChange('memo', e.target.value)}
              />
            </div>

            {/* 알림 설정 */}
            <div className="notification-section">
              <label className="notification-label">알림</label>
              <div className="notification-edit-wrapper">
                <button 
                  className="notification-button"
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                >
                  <span>{formData.notification || '없음'}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="#6a7282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showNotificationDropdown && (
                  <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                      <h4>이벤트 시간</h4>
                    </div>
                    <div className="notification-options">
                      {['없음', '5분 전', '10분 전', '15분 전', '30분 전', '1시간 전', '2시간 전', '1일 전', '2일 전', '1주 전'].map((option) => (
                        <button
                          key={option}
                          className={`notification-option ${formData.notification === option ? 'selected' : ''}`}
                          onClick={() => {
                            handleInputChange('notification', option === '없음' ? '' : option)
                            setShowNotificationDropdown(false)
                          }}
                        >
                          {option}
                          {formData.notification === option && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 추가 버튼 */}
            <button 
              className={`add-button ${formData.title.trim() ? 'add-button-active' : ''}`}
              onClick={handleSave}
              disabled={!formData.title.trim()}
            >
              추가
            </button>
          </div>
        </div>
      )}

      {!isAddEventPage && <BottomNavigation />}
    </div>
  )
}

export default CalendarPage


