import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { calendarAPI, cardAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import BottomNavigation from '../components/BottomNavigation'
import './AddEventPage.css'

// 드롭다운 아이콘 SVG 컴포넌트
function DropdownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="#6a7282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 사람 모양 선형 SVG 아이콘 컴포넌트
function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 뒤로가기 아이콘 SVG 컴포넌트
function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

// hex 색상을 rgba로 변환하는 함수 (opacity 적용)
function hexToRgba(hex, opacity = 0.05) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function AddEventPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const categoryDropdownRef = useRef(null)
  const participantDropdownRef = useRef(null)
  
  // location.state에서 전달된 날짜가 있으면 사용, 없으면 오늘 날짜
  const initialSelectedDate = location.state?.selectedDate 
    ? new Date(location.state.selectedDate) 
    : new Date()
  
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate)
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [participants, setParticipants] = useState([])
  const [participantInput, setParticipantInput] = useState('')
  
  // 참석자 자동완성 관련 state
  const [contactSuggestions, setContactSuggestions] = useState([])
  const [showContactSuggestions, setShowContactSuggestions] = useState(false)
  const [linkedCardIds, setLinkedCardIds] = useState([])
  
  const [formData, setFormData] = useState({
    title: '',
    participant: '',
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 10, minute: 0 },
    memo: '',
    notification: '1일 전'
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleBack = () => {
    navigate('/calendar', { state: { selectedDate: selectedDate } })
  }

  // 관계 그래프에서 "약속잡기"로 넘어온 경우 - 참석자 자동 추가
  useEffect(() => {
    if (location.state?.scheduleWith) {
      const { cardId, name, company } = location.state.scheduleWith
      
      // 참석자에 명함 추가
      setParticipants([{
        id: cardId,
        name: name,
        company: company,
        isFromCard: true
      }])
      setLinkedCardIds([cardId])
    }
  }, [location.state?.scheduleWith])

  // 참석자 자동완성 검색 (명함에서 검색)
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

  // 참석자 입력 변경 시 자동완성 검색
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
    // 이미 추가된 참석자인지 확인
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
      // 명함에 없는 직접 입력 참석자
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
    
    // 명함에서 온 참석자면 linkedCardIds에서도 제거
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

  // 참석자 드롭다운 외부 클릭 시 닫기
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
        // 캘린더 페이지로 돌아가기
        navigate('/calendar', { state: { selectedDate: selectedDate, refreshEvents: true } })
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

  return (
    <div className="add-event-page">
      {/* 헤더 */}
      <div className="add-event-header">
        <button className="back-button" onClick={handleBack}>
          <span className="back-icon">
            <BackIcon />
          </span>
        </button>
        <div className="add-event-header-content">
          <h2 className="page-title">일정 추가</h2>
        </div>
        <div style={{ width: '24px' }}></div> {/* Placeholder for right alignment */}
      </div>

      {/* 폼 컨텐츠 */}
      <div className="add-event-content">
        {/* 일정 제목 및 카테고리 */}
        <div className="event-header-section">
          <div className="title-input-wrapper">
            <input
              type="text"
              className="event-title-input"
              placeholder="일정 제목"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              style={{ 
                borderBottomColor: selectedCategory.color,
                '--category-bg-color': hexToRgba(selectedCategory.color, 0.05)
              }}
            />
          </div>
          <div className="category-options-wrapper">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={`category-option-button ${selectedCategory.id === category.id ? 'selected' : ''}`}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="category-dot" style={{ backgroundColor: category.color }} />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 참석자 추가 */}
        <div className="participant-section-wrapper" ref={participantDropdownRef}>
          <label className="participant-label">참석자</label>
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
              title="명함에 없는 참석자 직접 추가"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
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
          <label className="datetime-label">일시</label>
          <div className="datetime-section">
            <button
              className="date-display date-picker-button"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              {formatDateForDisplay(selectedDate)}
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
                    value={selectedDate.getFullYear()}
                    onChange={(e) => {
                      const newDate = new Date(selectedDate)
                      newDate.setFullYear(parseInt(e.target.value, 10) || 2025)
                      setSelectedDate(newDate)
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
                    value={selectedDate.getMonth() + 1}
                    onChange={(e) => {
                      const newDate = new Date(selectedDate)
                      newDate.setMonth((parseInt(e.target.value, 10) || 1) - 1)
                      setSelectedDate(newDate)
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
                    value={selectedDate.getDate()}
                    onChange={(e) => {
                      const newDate = new Date(selectedDate)
                      newDate.setDate(parseInt(e.target.value, 10) || 1)
                      setSelectedDate(newDate)
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
            placeholder="이 일정에 대한 메모 추가"
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
              <span>{formData.notification || '1일 전'}</span>
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
          style={{
            background: formData.title.trim() && !isSaving && !isEndTimeInvalid() 
              ? selectedCategory.color 
              : '#e5e7eb'
          }}
        >
          {isSaving ? '저장 중...' : '추가'}
        </button>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default AddEventPage
