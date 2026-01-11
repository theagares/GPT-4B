import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { calendarAPI, cardAPI } from '../utils/api'
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
  const location = useLocation()

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
  
  // 참여자 자동완성 관련 state
  const [contactSuggestions, setContactSuggestions] = useState([])
  const [showContactSuggestions, setShowContactSuggestions] = useState(false)
  const [linkedCardIds, setLinkedCardIds] = useState([])
  const [participants, setParticipants] = useState([]) // 참여자 객체 배열 (명함 정보 포함)
  const participantDropdownRef = useRef(null)
  const [showRegisterCardModal, setShowRegisterCardModal] = useState(false)
  const [selectedParticipantName, setSelectedParticipantName] = useState('')

  // 이벤트 데이터 로드 함수 (재사용 가능하도록 분리)
  const fetchEventData = async (showLoading = true) => {
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
              // linkedCardIds 파싱
              let linkedCardIdsArray = []
              if (foundEvent.linked_card_ids) {
                if (typeof foundEvent.linked_card_ids === 'string') {
                  linkedCardIdsArray = foundEvent.linked_card_ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
                } else if (Array.isArray(foundEvent.linked_card_ids)) {
                  linkedCardIdsArray = foundEvent.linked_card_ids.map(id => parseInt(id)).filter(id => !isNaN(id))
                }
              } else if (foundEvent.linkedCardIds) {
                linkedCardIdsArray = Array.isArray(foundEvent.linkedCardIds) 
                  ? foundEvent.linkedCardIds.map(id => parseInt(id)).filter(id => !isNaN(id))
                  : []
              }
              
              const eventData = {
                ...foundEvent,
                startDate: new Date(foundEvent.startDate),
                endDate: new Date(foundEvent.endDate),
                participants: typeof foundEvent.participants === 'string' 
                  ? foundEvent.participants.split(', ').filter(p => p)
                  : (foundEvent.participants || []),
                linkedCardIds: linkedCardIdsArray
              }
              
              // linkedCardIds의 명함 정보를 가져와서 이름으로 매칭
              const cardInfoMap = new Map()
              if (linkedCardIdsArray.length > 0) {
                try {
                  const cardPromises = linkedCardIdsArray.map(cardId => 
                    cardAPI.getById(cardId).catch(err => {
                      console.error(`Failed to fetch card ${cardId}:`, err)
                      return null
                    })
                  )
                  const cardResponses = await Promise.all(cardPromises)
                  
                  // 명함 정보를 이름을 키로 하는 Map에 저장
                  cardResponses.forEach((response) => {
                    if (response && response.data && response.data.success && response.data.data) {
                      const card = response.data.data
                      if (card.name) {
                        cardInfoMap.set(card.name.trim(), {
                          id: card.id,
                          name: card.name,
                          isFromCard: true
                        })
                      }
                    }
                  })
                } catch (err) {
                  console.error('Failed to fetch cards:', err)
                }
              }
              
              // 모든 참여자 이름으로 명함 검색 (명함 등록 후 새로 추가된 명함도 찾기 위해)
              try {
                const allCardsResponse = await cardAPI.getAll({})
                if (allCardsResponse.data.success && allCardsResponse.data.data) {
                  const allCards = allCardsResponse.data.data || []
                  
                  // 각 참여자 이름으로 명함 검색
                  eventData.participants.forEach((participantName) => {
                    const trimmedName = participantName.trim()
                    // 이미 cardInfoMap에 없으면 검색
                    if (!cardInfoMap.has(trimmedName)) {
                      const matchingCard = allCards.find(card => 
                        card.name && card.name.trim() === trimmedName
                      )
                      if (matchingCard) {
                        cardInfoMap.set(trimmedName, {
                          id: matchingCard.id,
                          name: matchingCard.name,
                          isFromCard: true
                        })
                      }
                    }
                  })
                }
              } catch (err) {
                console.error('Failed to search all cards:', err)
              }
              
              // participants 배열 생성 (이름으로 매칭)
              const participantsArray = eventData.participants.map((participantName) => {
                const matchedCard = cardInfoMap.get(participantName.trim())
                if (matchedCard) {
                  return matchedCard
                } else {
                  return {
                    name: participantName,
                    isFromCard: false
                  }
                }
              })
              
              setEvent(eventData)
              setLinkedCardIds(linkedCardIdsArray)
              setParticipants(participantsArray)
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
              if (showLoading) setLoading(false)
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
          if (showLoading) setLoading(false)
        } else {
          // 이벤트를 찾을 수 없으면 에러 표시
          if (showLoading) setLoading(false)
          console.error('Event not found:', eventId)
        }
      } catch (err) {
        console.error('이벤트 로드 실패:', err)
        if (showLoading) setLoading(false)
      }
    }

  // 이벤트 데이터 로드 (peter - API 연동)
  useEffect(() => {
    if (!eventId) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchEventData(true)
  }, [eventId])
  
  // 페이지 포커스 시 이벤트 데이터 새로고침 (명함 등록 후 돌아왔을 때 반영)
  useEffect(() => {
    const handleFocus = () => {
      if (eventId && isAuthenticated()) {
        fetchEventData(false) // 로딩 표시 없이 새로고침
      }
    }
    
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [eventId])

  const handleBack = () => {
    // 일정이 있는 날짜로 캘린더 이동
    if (event && event.startDate) {
      const eventDate = new Date(event.startDate)
      navigate('/calendar', { state: { selectedDate: eventDate } })
    } else {
      navigate('/calendar')
    }
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

  // 시간 검증 함수: 종료 시간이 시작 시간보다 같거나 빠른지 확인
  // 날짜는 항상 같으므로 시간만 비교
  const isEndTimeInvalid = () => {
    if (!event) return false
    
    const startDate = formData.startDate || event.startDate
    const endDate = formData.endDate || event.endDate
    
    if (!startDate || !endDate) return false
    
    // 시간만 분 단위로 변환하여 비교
    // 예: 시작 9시 (540분), 종료 11시 (660분) -> 유효함 (660 > 540)
    // 예: 시작 9시 (540분), 종료 8시 (480분) -> 유효하지 않음 (480 <= 540)
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes()
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes()
    
    return endMinutes <= startMinutes
  }

  // 명함 자동완성 검색
  const fetchContactSuggestions = async (searchText) => {
    if (!searchText || searchText.trim().length < 1) {
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
  }

  // 참여자 입력 변경 시 자동완성 검색
  const handleParticipantInputChange = (e) => {
    const value = e.target.value
    setParticipantInput(value)
    
    // 1글자 이상 입력 시 검색
    if (value.trim().length >= 1) {
      fetchContactSuggestions(value)
      // 명함 검색 결과가 없거나 입력한 이름이 검색 결과에 없으면 직접 입력 옵션 표시
      setShowContactSuggestions(true)
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
      const newParticipant = {
        id: contact.id,
        name: contact.name,
        company: contact.company,
        position: contact.position,
        isFromCard: true
      }
      setParticipants([...participants, newParticipant])
      setLinkedCardIds([...linkedCardIds, contact.id])
      // formData.participant 업데이트
      const participantNames = [...participants, newParticipant].map(p => p.name)
      handleInputChange('participant', participantNames.join(', '))
    }
    setParticipantInput('')
    setContactSuggestions([])
    setShowContactSuggestions(false)
  }

  const handleAddParticipant = () => {
    if (participantInput.trim()) {
      // 명함에 없는 직접 입력 참여자
      const newParticipant = {
        name: participantInput.trim(),
        isFromCard: false
      }
      setParticipants([...participants, newParticipant])
      // formData.participant 업데이트
      const participantNames = [...participants, newParticipant].map(p => p.name)
      handleInputChange('participant', participantNames.join(', '))
      setParticipantInput('')
      setContactSuggestions([])
      setShowContactSuggestions(false)
    }
  }

  const handleRemoveParticipant = (index) => {
    const removedParticipant = participants[index]
    const updatedParticipants = participants.filter((_, i) => i !== index)
    setParticipants(updatedParticipants)
    
    // 명함에서 온 참여자면 linkedCardIds에서도 제거
    if (removedParticipant.isFromCard && removedParticipant.id) {
      setLinkedCardIds(linkedCardIds.filter(id => id !== removedParticipant.id))
    }
    
    // formData.participant 업데이트
    const participantNames = updatedParticipants.map(p => p.name)
    handleInputChange('participant', participantNames.join(', '))
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

  // 참여자 버튼 클릭 핸들러
  const handleParticipantClick = async (participantName, index) => {
    if (isEditing) return // 편집 모드에서는 클릭 비활성화
    
    const linkedCardIdsList = event.linkedCardIds || []
    let cardId = null
    
    // linkedCardIds에 있는 명함들을 가져와서 이름으로 매칭
    if (linkedCardIdsList.length > 0) {
      try {
        // 모든 linkedCardIds의 명함 정보를 가져오기
        const cardPromises = linkedCardIdsList.map(cardId => 
          cardAPI.getById(cardId).catch(err => {
            console.error(`Failed to fetch card ${cardId}:`, err)
            return null
          })
        )
        
        const cardResponses = await Promise.all(cardPromises)
        
        // 이름이 정확히 일치하는 명함 찾기
        for (const response of cardResponses) {
          if (response && response.data && response.data.success && response.data.data) {
            const card = response.data.data
            if (card.name && card.name.trim() === participantName.trim()) {
              cardId = typeof card.id === 'string' ? parseInt(card.id, 10) : card.id
              break
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch cards:', err)
      }
    }
    
    // linkedCardIds에서 찾지 못했으면 이름으로 검색 시도
    if (!cardId) {
      try {
        const response = await cardAPI.getAll({ search: participantName.trim() })
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          // 이름이 정확히 일치하는 명함 찾기
          const matchingCard = response.data.data.find(card => 
            card.name && card.name.trim() === participantName.trim()
          )
          if (matchingCard) {
            cardId = typeof matchingCard.id === 'string' 
              ? parseInt(matchingCard.id, 10) 
              : matchingCard.id
          }
        }
      } catch (err) {
        console.error('Failed to search card by name:', err)
      }
    }
    
    if (cardId) {
      // 명함이 있으면 명함집 페이지로 이동하고 해당 명함 선택
      navigate('/business-cards', { 
        state: { 
          openCardId: cardId,
          returnToEventDetail: true,
          eventId: eventId // 일정 상세로 돌아가기 위한 eventId
        } 
      })
    } else {
      // 명함이 없으면 등록 팝업 표시
      setSelectedParticipantName(participantName)
      setShowRegisterCardModal(true)
    }
  }

  // 명함 등록하기 버튼 클릭
  const handleGoToRegisterCard = () => {
    setShowRegisterCardModal(false)
    navigate('/manual-add', { 
      state: { 
        participantName: selectedParticipantName,
        returnToEventDetail: true,
        eventId: eventId // 일정 상세로 돌아가기 위한 eventId
      } 
    })
  }

  // 명함 등록 팝업 닫기
  const handleCloseRegisterCardModal = () => {
    setShowRegisterCardModal(false)
    setSelectedParticipantName('')
  }

  const handleSave = async () => {

    try {
      // participants 배열에서 이름만 추출
      const participantNames = participants.map(p => typeof p === 'string' ? p : p.name)

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
          participants: participantNames,
          memo: formData.memo || '',
          notification: formData.notification || '',
          linkedCardIds: linkedCardIds.length > 0 ? linkedCardIds : null
        }

        const response = await calendarAPI.updateEvent(event.id, eventData)

        if (response.data && response.data.success) {
          // linkedCardIds 파싱
          let updatedLinkedCardIds = []
          if (response.data.data.linked_card_ids) {
            if (typeof response.data.data.linked_card_ids === 'string') {
              updatedLinkedCardIds = response.data.data.linked_card_ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
            } else if (Array.isArray(response.data.data.linked_card_ids)) {
              updatedLinkedCardIds = response.data.data.linked_card_ids.map(id => parseInt(id)).filter(id => !isNaN(id))
            }
          } else if (response.data.data.linkedCardIds) {
            updatedLinkedCardIds = Array.isArray(response.data.data.linkedCardIds) 
              ? response.data.data.linkedCardIds.map(id => parseInt(id)).filter(id => !isNaN(id))
              : []
          }
          
          // participants와 linkedCardIds를 매칭하여 participants 배열 업데이트
          const updatedParticipantsArray = participantNames.map((participantName, index) => {
            const cardId = updatedLinkedCardIds[index]
            if (cardId) {
              return {
                id: cardId,
                name: participantName,
                isFromCard: true
              }
            } else {
              return {
                name: participantName,
                isFromCard: false
              }
            }
          })
          
          // 업데이트된 이벤트 데이터로 상태 업데이트
          const updatedEvent = {
            ...event,
            ...response.data.data,
            title: formData.title,
            participants: participantNames,
            linkedCardIds: updatedLinkedCardIds,
            memo: formData.memo,
            notification: formData.notification,
            startDate: new Date(response.data.data.startDate),
            endDate: new Date(response.data.data.endDate)
          }

          setEvent(updatedEvent)
          setLinkedCardIds(updatedLinkedCardIds)
          setParticipants(updatedParticipantsArray)
          setIsEditing(false)
          setShowNotificationDropdown(false)
          
          // formData도 업데이트
          setFormData(prev => ({
            ...prev,
            participant: participantNames.join(', ')
          }))
          
          // 편집 모드 종료 후 일정 상세 페이지에 머물기
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
      
      // 편집 모드 종료 후 일정 상세 페이지에 머물기 (localStorage fallback)

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
        // 삭제할 일정의 날짜 저장
        const deletedEventDate = event?.startDate || new Date()

        // DB에서 삭제 (인증된 사용자인 경우) - peter API 연동
        if (isAuthenticated() && event && event.id) {
          const response = await calendarAPI.deleteEvent(event.id)
          
          if (response.data && response.data.success) {
            // 삭제된 일정의 날짜로 캘린더 이동
            navigate('/calendar', { state: { selectedDate: deletedEventDate } })
            return
          } else {
            throw new Error('일정 삭제에 실패했습니다.')
          }
        }

        // 인증되지 않았거나 DB에 없는 경우 localStorage에서 삭제 (fallback)
        const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
        const filteredEvents = storedEvents.filter(e => e.id !== eventId)
        localStorage.setItem('calendarEvents', JSON.stringify(filteredEvents))

        // 삭제된 일정의 날짜로 캘린더 이동
        navigate('/calendar', { state: { selectedDate: deletedEventDate } })

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

      {/* 일정 정보 섹션 */}

      <div className="meeting-info-section">

        <div className="section-header">

          <h3 className="section-title">일정 정보</h3>

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
            <div className="participant-input-container" ref={participantDropdownRef}>
              <input
                type="text"
                className="participant-edit-input"
                value={participantInput}
                onChange={handleParticipantInputChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    // 자동완성 목록이 있으면 첫 번째 항목 선택
                    if (showContactSuggestions && contactSuggestions.length > 0) {
                      handleSelectContact(contactSuggestions[0])
                    } else {
                      handleAddParticipant()
                    }
                  }
                }}
                placeholder="이름으로 명함 검색 또는 직접 입력"
              />
              <button
                type="button"
                className="participant-add-button"
                onClick={() => {
                  if (showContactSuggestions && contactSuggestions.length > 0) {
                    handleSelectContact(contactSuggestions[0])
                  } else {
                    handleAddParticipant()
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V13M3 8H13" stroke="#584cdc" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              {/* 자동완성 드롭다운 */}
              {showContactSuggestions && participantInput.trim().length >= 1 && (
                <div className="contact-suggestions-dropdown">
                  {/* 명함 검색 결과 */}
                  {contactSuggestions.map((contact) => (
                    <button
                      key={contact.id}
                      className="contact-suggestion-item"
                      onClick={() => handleSelectContact(contact)}
                    >
                      <div className="contact-suggestion-name">{contact.name}</div>
                      {(contact.company || contact.position) && (
                        <div className="contact-suggestion-info">
                          {contact.company && <span>{contact.company}</span>}
                          {contact.position && <span> · {contact.position}</span>}
                        </div>
                      )}
                    </button>
                  ))}
                  {/* 직접 입력 옵션 (명함 검색 결과에 없거나 입력한 이름이 검색 결과에 없는 경우) */}
                  {participantInput.trim() && 
                   !contactSuggestions.some(c => c.name === participantInput.trim()) &&
                   !participants.some(p => (typeof p === 'string' ? p : p.name) === participantInput.trim()) && (
                    <button
                      className="contact-suggestion-item"
                      onClick={handleAddParticipant}
                    >
                      <div className="contact-suggestion-name">{participantInput.trim()}</div>
                    </button>
                  )}
                </div>
              )}
            </div>
            {participants.length > 0 && (
              <div className="participants-display">
                {participants.map((participant, index) => (
                  <div key={index} className={`participant-item ${participant.isFromCard ? 'from-card' : ''}`}>
                    <span>{typeof participant === 'string' ? participant : participant.name}</span>
                    {participant.isFromCard && (
                      <span className="participant-card-badge" title="명함에서 추가됨">📇</span>
                    )}
                    <button
                      type="button"
                      className="participant-remove-btn"
                      onClick={() => handleRemoveParticipant(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="participant-content">
            {(() => {
              // participants 상태를 사용 (이름으로 이미 매칭되어 있음)
              const participantsList = participants.length > 0 
                ? participants 
                : (event.participants && Array.isArray(event.participants) && event.participants.length > 0
                  ? event.participants.map(name => ({ name, isFromCard: false }))
                  : (event.participants && typeof event.participants === 'string' && event.participants.trim() !== ''
                    ? event.participants.split(', ').filter(p => p.trim()).map(name => ({ name, isFromCard: false }))
                    : (event.participant && event.participant.trim() !== ''
                      ? event.participant.split(', ').filter(p => p.trim()).map(name => ({ name, isFromCard: false }))
                      : [])))
              
              return participantsList.length > 0 ? (
                <div className="participants-display">
                  {participantsList.map((participant, index) => {
                    const participantName = typeof participant === 'string' ? participant : participant.name
                    const isFromCard = typeof participant === 'object' && participant.isFromCard
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`participant-item-button ${isFromCard ? 'from-card' : ''}`}
                        onClick={() => handleParticipantClick(participantName.trim(), index)}
                      >
                        <span>{participantName.trim()}</span>
                        {isFromCard && (
                          <span className="participant-card-badge" title="명함에서 추가됨">📇</span>
                        )}
                      </button>
                    )
                  })}
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

              className={`notification-button ${showNotificationDropdown ? 'dropdown-open' : ''}`}

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

        <div className="event-detail-time-picker-modal" onClick={() => setShowTimePicker(false)}>

          <div className="event-detail-time-picker-content" onClick={(e) => e.stopPropagation()}>

            <h3>시작 시간</h3>

            <div className="event-detail-time-inputs">

              <input

                type="number"

                min="0"

                max="23"

                value={(formData.startDate || event.startDate).getHours()}

                onInput={(e) => {

                  let inputValue = e.target.value
                  // "0"으로 시작하는 두 자리 이상 숫자(예: "01", "05", "07")인 경우 첫 번째 "0" 제거
                  if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
                    inputValue = inputValue.substring(1)
                    e.target.value = inputValue
                  }
                }}

                onChange={(e) => {

                  const newDate = new Date(formData.startDate || event.startDate)

                  let inputValue = e.target.value
                  // "0"으로 시작하는 두 자리 이상 숫자(예: "01", "05", "07")인 경우 첫 번째 "0" 제거
                  if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
                    inputValue = inputValue.substring(1)
                  }
                  const hours = Math.max(0, Math.min(23, parseInt(inputValue) || 0))

                  newDate.setHours(hours)

                  setFormData(prev => ({ ...prev, startDate: newDate }))

                }}

                className="event-detail-time-input"

              />

              <span>:</span>

              <input

                type="number"

                min="0"

                max="59"

                value={(formData.startDate || event.startDate).getMinutes()}

                onInput={(e) => {

                  let inputValue = e.target.value
                  // "0"으로 시작하는 두 자리 이상 숫자(예: "01", "05", "07")인 경우 첫 번째 "0" 제거
                  if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
                    inputValue = inputValue.substring(1)
                    e.target.value = inputValue
                  }
                }}

                onChange={(e) => {

                  const newDate = new Date(formData.startDate || event.startDate)

                  let inputValue = e.target.value
                  // "0"으로 시작하는 두 자리 이상 숫자(예: "01", "05", "07")인 경우 첫 번째 "0" 제거
                  if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
                    inputValue = inputValue.substring(1)
                  }
                  const minutes = Math.max(0, Math.min(59, parseInt(inputValue) || 0))

                  newDate.setMinutes(minutes)

                  setFormData(prev => ({ ...prev, startDate: newDate }))

                }}

                className="event-detail-time-input"

              />

            </div>

            <h3>종료 시간</h3>

            <div className="event-detail-time-inputs">

              <input

                type="number"

                min="0"

                max="23"

                value={(formData.endDate || event.endDate).getHours()}

                onInput={(e) => {

                  let inputValue = e.target.value
                  // "0"으로 시작하는 두 자리 이상 숫자(예: "01", "05", "07")인 경우 첫 번째 "0" 제거
                  if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
                    inputValue = inputValue.substring(1)
                    e.target.value = inputValue
                  }
                }}

                onChange={(e) => {

                  const newDate = new Date(formData.endDate || event.endDate)

                  let inputValue = e.target.value
                  // "0"으로 시작하는 두 자리 이상 숫자(예: "01", "05", "07")인 경우 첫 번째 "0" 제거
                  if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
                    inputValue = inputValue.substring(1)
                  }
                  const hours = Math.max(0, Math.min(23, parseInt(inputValue) || 0))

                  newDate.setHours(hours)

                  setFormData(prev => ({ ...prev, endDate: newDate }))

                }}

                className={`event-detail-time-input ${isEndTimeInvalid() ? 'event-detail-time-input-error' : ''}`}

              />

              <span>:</span>

              <input

                type="number"

                min="0"

                max="59"

                value={(formData.endDate || event.endDate).getMinutes()}

                onInput={(e) => {

                  let inputValue = e.target.value
                  // "0"으로 시작하는 두 자리 이상 숫자(예: "01", "05", "07")인 경우 첫 번째 "0" 제거
                  if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
                    inputValue = inputValue.substring(1)
                    e.target.value = inputValue
                  }
                }}

                onChange={(e) => {

                  const newDate = new Date(formData.endDate || event.endDate)

                  let inputValue = e.target.value
                  // "0"으로 시작하는 두 자리 이상 숫자(예: "01", "05", "07")인 경우 첫 번째 "0" 제거
                  if (inputValue.length >= 2 && inputValue.startsWith('0') && inputValue[1] !== '0') {
                    inputValue = inputValue.substring(1)
                  }
                  const minutes = Math.max(0, Math.min(59, parseInt(inputValue) || 0))

                  newDate.setMinutes(minutes)

                  setFormData(prev => ({ ...prev, endDate: newDate }))

                }}

                className={`event-detail-time-input ${isEndTimeInvalid() ? 'event-detail-time-input-error' : ''}`}

              />

            </div>
            {isEndTimeInvalid() && (
              <p className="event-detail-time-error-message">종료 시간은 시작 시간보다 늦어야 합니다.</p>
            )}

            <button

              className="event-detail-time-picker-close"

              onClick={() => {
                if (!isEndTimeInvalid()) {
                  setShowTimePicker(false)
                }
              }}

              disabled={isEndTimeInvalid()}

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

      {/* 명함 등록 팝업 모달 */}
      {showRegisterCardModal && (
        <div className="register-card-modal-overlay" onClick={handleCloseRegisterCardModal}>
          <div className="register-card-modal" onClick={(e) => e.stopPropagation()}>
            <div className="register-card-modal-header">
              <h3 className="register-card-modal-title">명함 등록</h3>
              <button 
                className="register-card-modal-close"
                onClick={handleCloseRegisterCardModal}
              >
                ×
              </button>
            </div>
            <div className="register-card-modal-content">
              <p className="register-card-modal-message">
                <strong>{selectedParticipantName}</strong>님의 명함이 등록되어 있지 않습니다.
              </p>
              <p className="register-card-modal-hint">
                명함을 등록하시겠습니까?
              </p>
            </div>
            <div className="register-card-modal-actions">
              <button 
                className="register-card-modal-cancel"
                onClick={handleCloseRegisterCardModal}
              >
                취소
              </button>
              <button 
                className="register-card-modal-confirm"
                onClick={handleGoToRegisterCard}
              >
                명함 등록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  )

}

export default EventDetailPage
