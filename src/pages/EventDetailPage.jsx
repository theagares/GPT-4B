import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { calendarAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './EventDetailPage.css'

// 뒤로가기 아이콘 SVG 컴포넌트 (main 디자인)
function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 참석자(사람) 아이콘 SVG 컴포넌트 (main 디자인)
function PersonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 날짜 포맷팅 함수

const formatDateForDisplay = (date) => {

  if (!date) return ''

  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

  const year = date.getFullYear()

  const month = date.getMonth() + 1

  const day = date.getDate()

  const weekday = weekdays[date.getDay()]

  return `${year}년 ${month}월 ${day}일 ${weekday}`

}

const formatTimeForDisplay = (date) => {

  if (!date) return ''

  const hours = date.getHours()

  const minutes = date.getMinutes()

  const period = hours < 12 ? '오전' : '오후'

  const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)

  return `${period} ${displayHours}시${minutes > 0 ? ` ${minutes}분` : ''}`

}

const formatTimeShort = (date) => {

  if (!date) return ''

  const hours = date.getHours()

  const minutes = date.getMinutes()

  const period = hours < 12 ? '오전' : '오후'

  const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)

  return `${period} ${displayHours}시`

}

function EventDetailPage() {

  const navigate = useNavigate()

  const { eventId } = useParams()

  const [isEditing, setIsEditing] = useState(false)

  const [event, setEvent] = useState(null)

  const [loading, setLoading] = useState(true)

  

  // 편집 폼 상태

  const [formData, setFormData] = useState({

    title: '',

    participant: '',

    startDate: null,

    endDate: null,

    memo: '',

    notification: ''

  })

  const [showDatePicker, setShowDatePicker] = useState(false)

  const [showTimePicker, setShowTimePicker] = useState(false)

  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)

  const [participantInput, setParticipantInput] = useState('')

  // 이벤트 데이터 로드 (peter - API 연동)
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setLoading(false)
        return
      }

      try {
        if (isAuthenticated()) {
          // DB에서 이벤트 가져오기
          const response = await calendarAPI.getEvents()
          
          if (response.data && response.data.success) {
            const events = response.data.data || []
            const foundEvent = events.find(e => String(e.id) === String(eventId))
            
            if (foundEvent) {
              const eventData = {
                ...foundEvent,
                startDate: new Date(foundEvent.startDate),
                endDate: new Date(foundEvent.endDate),
                participants: typeof foundEvent.participants === 'string' 
                  ? foundEvent.participants.split(', ').filter(p => p)
                  : (foundEvent.participants || [])
              }
              
              setEvent(eventData)
              setFormData({
                title: eventData.title || '',
                participant: eventData.participants && eventData.participants.length > 0 
                  ? eventData.participants.join(', ')
                  : '',
                startDate: eventData.startDate,
                endDate: eventData.endDate,
                memo: eventData.memo || '',
                notification: eventData.notification || ''
              })
              setLoading(false)
              return
            }
          }
        }

        // DB에서 찾지 못한 경우 localStorage에서 찾기 (fallback)
        const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
        const foundEvent = storedEvents.find(e => String(e.id) === String(eventId))

        if (foundEvent) {
          const eventData = {
            ...foundEvent,
            startDate: new Date(foundEvent.startDate),
            endDate: new Date(foundEvent.endDate)
          }
          setEvent(eventData)
          setFormData({
            title: eventData.title,
            participant: eventData.participant || '',
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            memo: eventData.memo || '',
            notification: eventData.notification || ''
          })
          setLoading(false)
        } else {
          // 이벤트를 찾을 수 없으면 에러 표시
          setLoading(false)
          console.error('Event not found:', eventId)
        }
      } catch (err) {
        console.error('이벤트 로드 실패:', err)
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const handleBack = () => {

    navigate('/calendar')

  }

  const handleEdit = () => {

    setIsEditing(true)

    setShowDatePicker(false)

    setShowTimePicker(false)

    setShowNotificationDropdown(false)

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

    try {
      // 참가자를 배열로 변환
      const participants = formData.participant 
        ? formData.participant.split(',').map(p => p.trim()).filter(p => p)
        : []

      const startDate = formData.startDate || event.startDate
      const endDate = formData.endDate || event.endDate

      // DB에 업데이트 (인증된 사용자인 경우) - peter API 연동
      if (isAuthenticated() && event && event.id) {
        const eventData = {
          title: formData.title,
          startDate: toMySQLDateTime(startDate),
          endDate: toMySQLDateTime(endDate),
          category: event.category || '미팅',
          color: event.color || '#4A90E2',
          description: event.description || event.category || '미팅',
          location: event.location || '',
          participants: participants,
          memo: formData.memo || '',
          notification: formData.notification || ''
        }

        const response = await calendarAPI.updateEvent(event.id, eventData)

        if (response.data && response.data.success) {
          // 업데이트된 이벤트 데이터로 상태 업데이트
          const updatedEvent = {
            ...event,
            ...response.data.data,
            title: formData.title,
            participants: participants,
            memo: formData.memo,
            notification: formData.notification,
            startDate: new Date(response.data.data.startDate),
            endDate: new Date(response.data.data.endDate)
          }

          setEvent(updatedEvent)
          setIsEditing(false)
          setShowNotificationDropdown(false)
          
          // 편집 모드 종료 후 일정 상세 페이지에 머물기 (캘린더로 이동하지 않음)
          return
        } else {
          throw new Error('일정 업데이트에 실패했습니다.')
        }
      }

      // 인증되지 않았거나 DB에 없는 경우 localStorage에 저장 (fallback)
      const updatedEvent = {
        ...event,
        title: formData.title,
        participant: formData.participant,
        memo: formData.memo,
        notification: formData.notification,
        startDate: startDate,
        endDate: endDate
      }

      setEvent(updatedEvent)

      const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
      const eventIndex = storedEvents.findIndex(e => e.id === eventId)

      if (eventIndex >= 0) {
        storedEvents[eventIndex] = {
          ...storedEvents[eventIndex],
          title: formData.title,
          participant: formData.participant,
          memo: formData.memo,
          notification: formData.notification,
          startDate: toMySQLDateTime(startDate),
          endDate: toMySQLDateTime(endDate)
        }
        localStorage.setItem('calendarEvents', JSON.stringify(storedEvents))
      }

      setIsEditing(false)
      setShowNotificationDropdown(false)

    } catch (err) {
      console.error('이벤트 저장 실패:', err)
      alert('일정 저장에 실패했습니다. 다시 시도해주세요.')
    }

  }

  const handleCancel = () => {

    if (event) {

      setFormData({

        title: event.title,

        participant: event.participant,

        startDate: event.startDate,

        endDate: event.endDate,

        memo: event.memo || '',

        notification: event.notification || ''

      })

    }

    setIsEditing(false)

    setShowNotificationDropdown(false)

    setParticipantInput('')

  }

  const handleDelete = async () => {

    if (window.confirm('정말 이 일정을 삭제하시겠습니까?')) {

      try {
        // DB에서 삭제 (인증된 사용자인 경우) - peter API 연동
        if (isAuthenticated() && event && event.id) {
          const response = await calendarAPI.deleteEvent(event.id)
          
          if (response.data && response.data.success) {
            navigate('/calendar')
            return
          } else {
            throw new Error('일정 삭제에 실패했습니다.')
          }
        }

        // 인증되지 않았거나 DB에 없는 경우 localStorage에서 삭제 (fallback)
        const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
        const filteredEvents = storedEvents.filter(e => e.id !== eventId)
        localStorage.setItem('calendarEvents', JSON.stringify(filteredEvents))

        navigate('/calendar')

      } catch (err) {

        console.error('이벤트 삭제 실패:', err)

        alert('일정 삭제에 실패했습니다. 다시 시도해주세요.')

      }

    }

  }

  const handleInputChange = (field, value) => {

    setFormData(prev => ({

      ...prev,

      [field]: value

    }))

  }

  if (loading) {

    return (

      <div className="event-detail-page">

        <div className="loading">일정을 불러오는 중...</div>

      </div>

    )

  }

  if (!event) {

    return (

      <div className="event-detail-page">

        <div className="error">일정을 찾을 수 없습니다.</div>

      </div>

    )

  }

  return (

    <div className="event-detail-page">

      {/* 헤더 */}

      <div className="event-detail-header">

        <button className="back-button" onClick={handleBack}>

          <span className="back-icon">
            <BackIcon />
          </span>

          <span>뒤로</span>

        </button>

        <h2 className="page-title">일정 상세</h2>

        {!isEditing ? (

          <button className="edit-button" onClick={handleEdit}>편집</button>

        ) : (

          <div className="edit-actions">

            <button className="cancel-button" onClick={handleCancel}>취소</button>

            <button className="save-button" onClick={handleSave}>저장</button>

          </div>

        )}

      </div>

      {/* 미팅 정보 섹션 */}

      <div className="meeting-info-section">

        <div className="section-header">

          <h3 className="section-title">미팅 정보</h3>

        </div>

        <div className="meeting-info-content">

          {isEditing ? (

            <div className="edit-form">

              <input

                type="text"

                className="edit-input title-input"

                value={formData.title}

                onChange={(e) => handleInputChange('title', e.target.value)}

                placeholder="일정 제목"

              />

              <div className="date-time-info">

                <button 

                  type="button"

                  className="date-time-button editable"

                  onClick={() => setShowDatePicker(!showDatePicker)}

                >

                  {formatDateForDisplay(formData.startDate || event.startDate)}

                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">

                    <path d="M4 6L8 10L12 6" stroke="#6a7282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

                  </svg>

                </button>

                <button 

                  type="button"

                  className="date-time-button editable"

                  onClick={() => setShowTimePicker(!showTimePicker)}

                >

                  {formatTimeForDisplay(formData.startDate || event.startDate)} ~ {formatTimeForDisplay(formData.endDate || event.endDate)}

                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">

                    <path d="M4 6L8 10L12 6" stroke="#6a7282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

                  </svg>

                </button>

              </div>

            </div>

          ) : (

            <>

              <div className="event-title-row">
                <h4 className="event-title">{event.title}</h4>
              </div>

              <p className="date-info">{formatDateForDisplay(event.startDate)}</p>

              <p className="time-info">{formatTimeForDisplay(event.startDate)} ~ {formatTimeForDisplay(event.endDate)}</p>

            </>

          )}

          

          {/* 시간 타임라인 - Meeting Info 내부로 이동 */}

          <div className="time-timeline">

            {(() => {

              const displayStartDate = formData.startDate || event.startDate

              const displayEndDate = formData.endDate || event.endDate

              const startHour = displayStartDate.getHours()

              const endHour = displayEndDate.getHours()

              const startMinute = displayStartDate.getMinutes()

              const endMinute = displayEndDate.getMinutes()

              

              // 시작 시간과 종료 시간을 분 단위로 계산

              const startTotalMinutes = startHour * 60 + startMinute

              const endTotalMinutes = endHour * 60 + endMinute

              

              // 시작 시간의 이전 시간부터 종료 시간의 다음 시간까지 시간 라벨 생성

              const startHourLabel = Math.max(0, startHour - 1) // 최소 0시

              const endHourLabel = Math.min(23, endHour + 1) // 최대 23시

              

              const timeLabels = []

              for (let hour = startHourLabel; hour <= endHourLabel; hour++) {

                const period = hour < 12 ? '오전' : '오후'

                const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)

                timeLabels.push({

                  hour,

                  minutes: hour * 60,

                  label: `${period} ${displayHour}시`

                })

              }

              

              // 이벤트 바의 위치 계산 (각 시간 라벨의 높이를 기준으로)

              const hourHeight = 30 // 각 시간 라벨의 높이 (픽셀) - 절반으로 줄임

              const offset = 4 // 시간 라벨과 바의 정렬을 위한 오프셋

              const eventStartPosition = ((startTotalMinutes - startHourLabel * 60) / 60) * hourHeight + offset

              const eventEndPosition = ((endTotalMinutes - startHourLabel * 60) / 60) * hourHeight + offset

              const eventHeight = eventEndPosition - eventStartPosition

              

              return (

                <div className="timeline-wrapper">

                  <div className="timeline-labels">

                    {timeLabels.map((timeLabel, index) => (

                      <div key={index} className="timeline-label-item" style={{ height: `${hourHeight}px` }}>

                        <span className="timeline-time">{timeLabel.label}</span>

                      </div>

                    ))}

                  </div>

                  <div className="timeline-bars-container">

                    <div 

                      className="timeline-event-bar" 

                      style={{ 

                        backgroundColor: event.color,

                        top: `${eventStartPosition}px`,

                        height: `${eventHeight}px`

                      }}

                    >

                      <span className="timeline-event-title">{formData.title || event.title}</span>

                    </div>

                  </div>

                </div>

              )

            })()}

          </div>

        </div>

      </div>

      {/* 참석자 섹션 */}
      <div className="participant-section-detail">
        <div className="section-header">
          <h3 className="section-title">참석자</h3>
        </div>

        {isEditing ? (
          <div className="participant-edit-wrapper">
            <div className="participant-input-container">
              <input
                type="text"
                className="participant-edit-input"
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && participantInput.trim()) {
                    const participants = formData.participant ? formData.participant.split(', ') : []
                    if (!participants.includes(participantInput.trim())) {
                      handleInputChange('participant', participants.length > 0 
                        ? `${formData.participant}, ${participantInput.trim()}` 
                        : participantInput.trim())
                    }
                    setParticipantInput('')
                  }
                }}
                placeholder="참석자 추가"
              />
              <button
                type="button"
                className="participant-add-button"
                onClick={() => {
                  if (participantInput.trim()) {
                    const participants = formData.participant ? formData.participant.split(', ') : []
                    if (!participants.includes(participantInput.trim())) {
                      handleInputChange('participant', participants.length > 0 
                        ? `${formData.participant}, ${participantInput.trim()}` 
                        : participantInput.trim())
                    }
                    setParticipantInput('')
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V13M3 8H13" stroke="#584cdc" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            {formData.participant && (
              <div className="participants-display">
                {formData.participant.split(', ').map((p, index) => (
                  <div key={index} className="participant-item">
                    <span>{p.trim()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="participant-content">
            {(() => {
              const participants = event.participants && Array.isArray(event.participants) && event.participants.length > 0
                ? event.participants
                : (event.participants && typeof event.participants === 'string' && event.participants.trim() !== ''
                  ? event.participants.split(', ').filter(p => p.trim())
                  : (event.participant && event.participant.trim() !== ''
                    ? event.participant.split(', ').filter(p => p.trim())
                    : []))
              
              return participants.length > 0 ? (
                <div className="participants-display">
                  {participants.map((participant, index) => (
                    <div key={index} className="participant-item">
                      <span>{participant.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>참석자가 없습니다.</p>
              )
            })()}
          </div>
        )}
      </div>

      {/* 메모 섹션 */}

      <div className="memo-section">

        <div className="section-header">

          <h3 className="section-title">메모</h3>

        </div>

        {isEditing ? (

          <textarea

            className="memo-textarea"

            value={formData.memo}

            onChange={(e) => handleInputChange('memo', e.target.value)}

            placeholder="메모를 입력하세요"

          />

        ) : (

          <div className="memo-content">

            <p>{event.memo || '메모가 없습니다.'}</p>

          </div>

        )}

      </div>

      {/* 알림 섹션 */}

      <div className="notification-section">

        <div className="section-header">

          <h3 className="section-title">알림</h3>

        </div>

        {isEditing ? (

          <div className="notification-edit-wrapper">

            <button 

              className="notification-button"

              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}

            >

              <span>{formData.notification || '없음'}</span>

              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">

                <path d="M4 6L8 10L12 6" stroke="#6a7282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

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

                          <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

                        </svg>

                      )}

                    </button>

                  ))}

                </div>

              </div>

            )}

          </div>

        ) : (

          <div className="notification-content">

            <p>{event.notification || '알림이 설정되지 않았습니다'}</p>

          </div>

        )}

      </div>

      {/* 날짜 선택 모달 */}

      {showDatePicker && (

        <div className="date-picker-modal" onClick={() => setShowDatePicker(false)}>

          <div className="date-picker-content" onClick={(e) => e.stopPropagation()}>

            <h3>날짜 선택</h3>

            <div className="date-picker-inputs">

              <div className="date-input-group">

                <label>년</label>

                <input

                  type="number"

                  min="2020"

                  max="2100"

                  value={(formData.startDate || event.startDate).getFullYear()}

                  onChange={(e) => {

                    const newDate = new Date(formData.startDate || event.startDate)

                    newDate.setFullYear(parseInt(e.target.value) || 2025)

                    setFormData(prev => ({ ...prev, startDate: newDate }))

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

                  value={(formData.startDate || event.startDate).getMonth() + 1}

                  onChange={(e) => {

                    const newDate = new Date(formData.startDate || event.startDate)

                    newDate.setMonth((parseInt(e.target.value) || 1) - 1)

                    setFormData(prev => ({ ...prev, startDate: newDate }))

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

                  value={(formData.startDate || event.startDate).getDate()}

                  onChange={(e) => {

                    const newDate = new Date(formData.startDate || event.startDate)

                    newDate.setDate(parseInt(e.target.value) || 1)

                    setFormData(prev => ({ ...prev, startDate: newDate }))

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

      {/* 시간 선택 모달 */}

      {showTimePicker && (

        <div className="time-picker-modal" onClick={() => setShowTimePicker(false)}>

          <div className="time-picker-content" onClick={(e) => e.stopPropagation()}>

            <h3>시작 시간</h3>

            <div className="time-inputs">

              <input

                type="number"

                min="0"

                max="23"

                value={(formData.startDate || event.startDate).getHours()}

                onChange={(e) => {

                  const newDate = new Date(formData.startDate || event.startDate)

                  const hours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))

                  newDate.setHours(hours)

                  setFormData(prev => ({ ...prev, startDate: newDate }))

                }}

                className="time-input"

              />

              <span>:</span>

              <input

                type="number"

                min="0"

                max="59"

                value={(formData.startDate || event.startDate).getMinutes()}

                onChange={(e) => {

                  const newDate = new Date(formData.startDate || event.startDate)

                  const minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))

                  newDate.setMinutes(minutes)

                  setFormData(prev => ({ ...prev, startDate: newDate }))

                }}

                className="time-input"

              />

            </div>

            <h3>종료 시간</h3>

            <div className="time-inputs">

              <input

                type="number"

                min="0"

                max="23"

                value={(formData.endDate || event.endDate).getHours()}

                onChange={(e) => {

                  const newDate = new Date(formData.endDate || event.endDate)

                  const hours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))

                  newDate.setHours(hours)

                  setFormData(prev => ({ ...prev, endDate: newDate }))

                }}

                className="time-input"

              />

              <span>:</span>

              <input

                type="number"

                min="0"

                max="59"

                value={(formData.endDate || event.endDate).getMinutes()}

                onChange={(e) => {

                  const newDate = new Date(formData.endDate || event.endDate)

                  const minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))

                  newDate.setMinutes(minutes)

                  setFormData(prev => ({ ...prev, endDate: newDate }))

                }}

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

      {/* 삭제 버튼 */}

      <button className="delete-button" onClick={handleDelete}>

        이벤트 삭제

      </button>

    </div>

  )

}

export default EventDetailPage
