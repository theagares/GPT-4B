import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { calendarAPI, cardAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './CalendarPage.css'

// 드롭다운 아이콘 SVG 컴포넌트
function DropdownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="#6a7282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 사람 모양 선형 SVG 아이콘 컴포넌트
function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const WEEKDAYS_KR = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

const CATEGORIES = [
  { id: '미팅', label: '미팅', color: '#584cdc' },
  { id: '업무', label: '업무', color: '#3b82f6' },
  { id: '개인', label: '개인', color: '#10b981' },
  { id: '기타', label: '기타', color: '#6b7280' }
]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// 구글 캘린더 색상 ID를 UI 색상으로 매핑
// 구글 캘린더 colorId: 1-11 (기본 색상), 여기서는 카테고리별 색상으로 매핑
const COLOR_MAP = {
  '미팅': '#584cdc',
  '업무': '#3b82f6',
  '개인': '#10b981',
  '기타': '#6b7280'
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

  // location.state에서 전달된 날짜가 있으면 사용, 없으면 오늘 날짜
  const initialSelectedDate = location.state?.selectedDate
    ? new Date(location.state.selectedDate)
    : new Date()
  const initialCurrentDate = location.state?.selectedDate
    ? new Date(location.state.selectedDate)
    : new Date()

  const [currentDate, setCurrentDate] = useState(initialCurrentDate)
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate)
  const [events, setEvents] = useState([]) // 구글 캘린더 이벤트 배열
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
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

  // 참여자 자동완성 관련 state
  const [contactSuggestions, setContactSuggestions] = useState([])
  const [showContactSuggestions, setShowContactSuggestions] = useState(false)
  const [linkedCardIds, setLinkedCardIds] = useState([])
  const participantDropdownRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    participant: '',
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 10, minute: 0 },
    memo: '',
    notification: ''
  })

  // DB에서 모든 이벤트를 가져오는 함수 (날짜 필터 없음)
  const fetchCalendarEvents = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!isAuthenticated()) {
        setLoading(false)
        return []
      }

      // DB에서 모든 이벤트 가져오기 (날짜 필터 없음)
      const response = await calendarAPI.getEvents()

      if (response.data.success) {
        return response.data.data || []
      }

      return []
    } catch (err) {
      console.error('Failed to fetch events:', err)
      setError(err.response?.data?.message || err.message || '이벤트를 불러오는데 실패했습니다.')
      return []
    } finally {
      setLoading(false)
    }
  }

  // DB 이벤트를 UI 형식으로 변환
  const transformDBEvent = (dbEvent) => {
    const startDate = new Date(dbEvent.startDate)
    const endDate = new Date(dbEvent.endDate)
    const category = dbEvent.category || '기타'
    const color = dbEvent.color || COLOR_MAP[category] || COLOR_MAP['기타']

    // participants가 문자열인 경우 배열로 변환
    let participant = ''
    if (dbEvent.participants) {
      if (typeof dbEvent.participants === 'string') {
        const participants = dbEvent.participants.split(', ').filter(p => p)
        participant = participants.join(', ')
      } else if (Array.isArray(dbEvent.participants)) {
        participant = dbEvent.participants.join(', ')
      }
    }

    return {
      id: String(dbEvent.id),
      title: dbEvent.title || '제목 없음',
      time: formatTime(startDate),
      startDate: startDate,
      endDate: endDate,
      category: category,
      color: color,
      description: dbEvent.description || category,
      location: dbEvent.location || '',
      participant: participant,
      memo: dbEvent.memo || '',
      notification: dbEvent.notification || '',
      // 원본 DB 이벤트 데이터 보관 (필요시 사용)
      rawEvent: dbEvent
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
    if (!isAuthenticated()) {
      setEvents([])
      return
    }

    // 모든 일정 가져오기
    fetchCalendarEvents().then(dbEvents => {
      // 중복 제거: id 기준으로 중복 제거
      const uniqueEvents = dbEvents.reduce((acc, event) => {
        const existingIndex = acc.findIndex(e => e.id === event.id)
        if (existingIndex === -1) {
          acc.push(event)
        }
        return acc
      }, [])

      const transformedEvents = uniqueEvents.map(transformDBEvent)
      setEvents(transformedEvents)
    })
  }, [currentDate])

  // location.state에서 전달된 날짜가 변경되면 업데이트
  useEffect(() => {
    if (location.state?.selectedDate) {
      const newDate = new Date(location.state.selectedDate)
      setSelectedDate(newDate)
      setCurrentDate(newDate)
    }
  }, [location.state?.selectedDate])

  // location.state에서 refreshEvents가 true이면 이벤트 새로고침
  useEffect(() => {
    if (location.state?.refreshEvents && isAuthenticated()) {
      // 모든 일정 가져오기
      fetchCalendarEvents().then(dbEvents => {
        const uniqueEvents = dbEvents.reduce((acc, event) => {
          const existingIndex = acc.findIndex(e => e.id === event.id)
          if (existingIndex === -1) {
            acc.push(event)
          }
          return acc
        }, [])

        const transformedEvents = uniqueEvents.map(transformDBEvent)
        setEvents(transformedEvents)
      })

      // state 초기화
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state?.refreshEvents])

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
    navigate('/calendar/add', { state: { selectedDate: selectedDate } })
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
    setLinkedCardIds([])
    setContactSuggestions([])
    setShowContactSuggestions(false)
    setModalSelectedDate(selectedDate)
    setModalPosition(0)
  }

  // 참여자 자동완성 검색 (명함에서 검색)
  const fetchContactSuggestions = useCallback(async (searchText) => {
    if (!searchText.trim() || !isAuthenticated()) {
      setContactSuggestions([])
      setShowContactSuggestions(false)
      return
    }

    try {
      // 명함 목록에서 검색
      const response = await cardAPI.getAll({ search: searchText, limit: 10 })
      if (response.data.success) {
        const contacts = (response.data.data || []).map(card => ({
          id: card.id,
          name: card.name,
          company: card.company,
          position: card.position,
          displayText: `${card.name}${card.company ? ` (${card.company})` : ''}${card.position ? ` - ${card.position}` : ''}`
        }))
        setContactSuggestions(contacts)
        setShowContactSuggestions(contacts.length > 0)
      }
    } catch (err) {
      console.error('Failed to fetch contact suggestions:', err)
      setContactSuggestions([])
    }
  }, [])

  // 참여자 입력 변경 시 자동완성 검색
  const handleParticipantInputChange = (e) => {
    const value = e.target.value
    setParticipantInput(value)

    // 1글자 이상 입력 시 검색
    if (value.trim().length >= 1) {
      fetchContactSuggestions(value)
    } else {
      setContactSuggestions([])
      setShowContactSuggestions(false)
    }
  }

  // 자동완성 항목 선택
  const handleSelectContact = (contact) => {
    // 이미 추가된 참여자인지 확인
    const alreadyAdded = participants.some(p => p.id === contact.id)
    if (!alreadyAdded) {
      setParticipants([...participants, {
        id: contact.id,
        name: contact.name,
        company: contact.company,
        position: contact.position,
        isFromCard: true
      }])
      setLinkedCardIds([...linkedCardIds, contact.id])
    }
    setParticipantInput('')
    setContactSuggestions([])
    setShowContactSuggestions(false)
  }

  const handleAddParticipant = () => {
    if (participantInput.trim()) {
      // 명함에 없는 직접 입력 참여자
      setParticipants([...participants, {
        name: participantInput.trim(),
        isFromCard: false
      }])
      setParticipantInput('')
      setContactSuggestions([])
      setShowContactSuggestions(false)
    }
  }

  const handleRemoveParticipant = (index) => {
    const removedParticipant = participants[index]
    setParticipants(participants.filter((_, i) => i !== index))

    // 명함에서 온 참여자면 linkedCardIds에서도 제거
    if (removedParticipant.isFromCard && removedParticipant.id) {
      setLinkedCardIds(linkedCardIds.filter(id => id !== removedParticipant.id))
    }
  }

  const handleParticipantKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // 자동완성 목록이 있으면 첫 번째 항목 선택
      if (showContactSuggestions && contactSuggestions.length > 0) {
        handleSelectContact(contactSuggestions[0])
      } else {
        handleAddParticipant()
      }
    }
  }

  // 참여자 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutsideParticipant = (event) => {
      if (participantDropdownRef.current && !participantDropdownRef.current.contains(event.target)) {
        setShowContactSuggestions(false)
      }
    }

    if (showContactSuggestions) {
      document.addEventListener('mousedown', handleClickOutsideParticipant)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideParticipant)
    }
  }, [showContactSuggestions])

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
    let inputValue = String(value)
    // "0"으로 시작하는 두 자리 이상 숫자(예: "01", "05", "07")인 경우 첫 번째 "0" 제거
    // 단, "00"은 그대로 유지
    if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
      inputValue = inputValue.substring(1)
    }
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: parseInt(inputValue) || 0
      }
    }))
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setShowCategoryDropdown(false)
  }

  // 시간 검증 함수: 종료 시간이 시작 시간보다 같거나 빠른지 확인
  const isEndTimeInvalid = () => {
    const startMinutes = formData.startTime.hour * 60 + formData.startTime.minute
    const endMinutes = formData.endTime.hour * 60 + formData.endTime.minute
    return endMinutes <= startMinutes
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
      // eslint-disable-next-line no-alert
      alert('일정 제목을 입력해주세요.')
      return
    }

    if (!isAuthenticated()) {
      // eslint-disable-next-line no-alert
      alert('로그인이 필요합니다.')
      return
    }

    setIsSaving(true)
    try {
      const startDate = new Date(
        modalSelectedDate.getFullYear(),
        modalSelectedDate.getMonth(),
        modalSelectedDate.getDate(),
        formData.startTime.hour,
        formData.startTime.minute,
        0,
        0
      )
      const endDate = new Date(
        modalSelectedDate.getFullYear(),
        modalSelectedDate.getMonth(),
        modalSelectedDate.getDate(),
        formData.endTime.hour,
        formData.endTime.minute,
        0,
        0
      )

      // participants 배열에서 이름만 추출
      const participantNames = participants.map(p => typeof p === 'string' ? p : p.name)

      const eventData = {
        title: formData.title,
        startDate: toMySQLDateTime(startDate),
        endDate: toMySQLDateTime(endDate),
        category: selectedCategory.id,
        color: selectedCategory.color,
        description: selectedCategory.id,
        location: '',
        participants: participantNames,
        memo: formData.memo || '',
        notification: formData.notification || '',
        linkedCardIds: linkedCardIds.length > 0 ? linkedCardIds : null
      }

      // DB에 이벤트 저장
      const response = await calendarAPI.createEvent(eventData)

      if (response.data && response.data.success) {
        // 모달 먼저 닫기
        handleCloseModal()

        // 이벤트 목록 새로고침 (약간의 지연을 두어 DB 반영 시간 확보)
        setTimeout(async () => {
          // 모든 일정 가져오기
          const dbEvents = await fetchCalendarEvents()
          // 중복 제거: id 기준으로 중복 제거
          const uniqueEvents = dbEvents.reduce((acc, event) => {
            const existingIndex = acc.findIndex(e => e.id === event.id)
            if (existingIndex === -1) {
              acc.push(event)
            }
            return acc
          }, [])

          const transformedEvents = uniqueEvents.map(transformDBEvent)
          setEvents(transformedEvents)
        }, 200)
      }
    } catch (err) {
      console.error('이벤트 생성 실패:', err)
      // eslint-disable-next-line no-alert
      alert('일정 추가에 실패했습니다: ' + (err.response?.data?.message || err.message))
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
      {/* Header */}
      <div className="calendar-page-header">
        <div className="calendar-page-header-content">
          <p className="calendar-page-header-title">캘린더</p>
          <p className="calendar-page-header-subtitle">일정을 추가하고 수정하며 스케줄을 관리하세요</p>
        </div>
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
            <div className="participant-section-wrapper" ref={participantDropdownRef}>
              <label className="participant-label">참여자</label>
              <div className="participant-section">
                <input
                  type="text"
                  className="participant-input"
                  placeholder="이름으로 명함 검색 또는 직접 입력"
                  value={participantInput}
                  onChange={handleParticipantInputChange}
                  onKeyPress={handleParticipantKeyPress}
                  onFocus={() => {
                    if (participantInput.trim().length >= 1) {
                      fetchContactSuggestions(participantInput)
                    }
                  }}
                />
                <button
                  className={`participant-button ${participantInput.trim() ? 'active' : ''}`}
                  onClick={handleAddParticipant}
                  disabled={!participantInput.trim()}
                  title="명함에 없는 참여자 직접 추가"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              {/* 자동완성 드롭다운 */}
              {showContactSuggestions && contactSuggestions.length > 0 && (
                <div className="contact-suggestions-dropdown">
                  {contactSuggestions.map((contact) => (
                    <button
                      key={contact.id}
                      className="contact-suggestion-item"
                      onClick={() => handleSelectContact(contact)}
                    >
                      <div className="contact-suggestion-name">{contact.name}</div>
                      <div className="contact-suggestion-info">
                        {contact.company && <span>{contact.company}</span>}
                        {contact.position && <span> · {contact.position}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {participants.length > 0 && (
              <div className="participants-list">
                {participants.map((participant, index) => (
                  <div key={index} className={`participant-tag ${participant.isFromCard ? 'from-card' : ''}`}>
                    <span>{typeof participant === 'string' ? participant : participant.name}</span>
                    {participant.isFromCard && (
                      <span className="participant-card-badge" title="명함에서 추가됨">
                        <PersonIcon />
                      </span>
                    )}
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
            <div className="datetime-section-wrapper">
              <label className="datetime-label">날짜/시간</label>
              <div className="datetime-section">
                <button
                  className="date-display date-picker-button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  {formatDateForDisplay(modalSelectedDate)}
                </button>
                <button
                  className="time-display time-picker-button"
                  onClick={() => setShowTimePicker(!showTimePicker)}
                >
                  {formatTimeForDisplay(formData.startTime, formData.endTime)}
                </button>
              </div>
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
              <div className="calendar-time-picker-modal">
                <div className="calendar-time-picker-content">
                  <h3>시작 시간</h3>
                  <div className="calendar-time-inputs">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={formData.startTime.hour}
                      onInput={(e) => {
                        let inputValue = e.target.value
                        if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
                          inputValue = inputValue.substring(1)
                          e.target.value = inputValue
                        }
                      }}
                      onChange={(e) => handleTimeChange('startTime', 'hour', e.target.value)}
                      className="calendar-time-input"
                    />
                    <span>:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={formData.startTime.minute}
                      onInput={(e) => {
                        let inputValue = e.target.value
                        if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
                          inputValue = inputValue.substring(1)
                          e.target.value = inputValue
                        }
                      }}
                      onChange={(e) => handleTimeChange('startTime', 'minute', e.target.value)}
                      className="calendar-time-input"
                    />
                  </div>
                  <h3>종료 시간</h3>
                  <div className="calendar-time-inputs">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={formData.endTime.hour}
                      onInput={(e) => {
                        let inputValue = e.target.value
                        if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
                          inputValue = inputValue.substring(1)
                          e.target.value = inputValue
                        }
                      }}
                      onChange={(e) => handleTimeChange('endTime', 'hour', e.target.value)}
                      className={`calendar-time-input ${isEndTimeInvalid() ? 'calendar-time-input-error' : ''}`}
                    />
                    <span>:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={formData.endTime.minute}
                      onInput={(e) => {
                        let inputValue = e.target.value
                        if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
                          inputValue = inputValue.substring(1)
                          e.target.value = inputValue
                        }
                      }}
                      onChange={(e) => handleTimeChange('endTime', 'minute', e.target.value)}
                      className={`calendar-time-input ${isEndTimeInvalid() ? 'calendar-time-input-error' : ''}`}
                    />
                  </div>
                  {isEndTimeInvalid() && (
                    <p className="calendar-time-error-message">종료 시간은 시작 시간보다 늦어야 합니다.</p>
                  )}
                  <button
                    className="calendar-time-picker-close"
                    onClick={() => setShowTimePicker(false)}
                    disabled={isEndTimeInvalid()}
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
                  className={`notification-button ${showNotificationDropdown ? 'dropdown-open' : ''}`}
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
              className={`add-button ${formData.title.trim() && !isSaving && !isEndTimeInvalid() ? 'add-button-active' : ''}`}
              onClick={handleSave}
              disabled={!formData.title.trim() || isSaving || isEndTimeInvalid()}
            >
              {isSaving ? '저장 중...' : '추가'}
            </button>
          </div>
        </div>
      )}

      {!isAddEventPage && <BottomNavigation />}
    </div>
  )
}

export default CalendarPage


