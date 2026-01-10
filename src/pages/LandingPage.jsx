import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { useCardStore } from '../store/cardStore'
import { userAPI, calendarAPI, cardAPI } from '../utils/api'
import { isAuthenticated, getUser } from '../utils/auth'
import api from '../utils/api'
import './LandingPage.css'

// 인기 선물 데이터 (PopularGiftsPage와 동일한 데이터, 상위 5개만 표시)
const popularGifts = [
  {
    id: 1,
    rank: '#1',
    image: "https://shop-phinf.pstatic.net/20241026_151/17299254937003uih3_JPEG/6412801823777166_1731722875.jpg?type=m450",
    category: '캔들디퓨저',
    categoryColor: '#584cdc',
    name: '명품 고급 호텔 대형 백화점 대용량 실내 디퓨저 거실 현관 사무실 방향제 집들이 선물세트',
    price: '42000원',
    popularity: '인기 95%',
    url: 'https://m.shopping.naver.com/gift/products/4856091300'
  },
  {
    id: 2,
    rank: '#2',
    image: "https://shop-phinf.pstatic.net/20250806_115/1754462546764Npyyg_JPEG/86041343686824065_896651263.jpg?type=m450",
    category: '한우',
    categoryColor: '#584cdc',
    name: '[선물세트] 1++ 프리미엄 등급 한우 선물세트 / 등심600g + 부채살200g + 살치100g / 스킨포장 선물포장 명절 추석 설날 [원산지:국산]',
    price: '110,000원',
    popularity: '인기 95%',
    url: 'https://shopping.naver.com/gift/products/12210479933'
  },
  {
    id: 3,
    rank: '#3',
    image: "https://shop-phinf.pstatic.net/20250723_284/1753258518569xPQGb_JPEG/91339375597969581_1547240416.jpg?type=m450",
    category: '건강식품',
    categoryColor: '#584cdc',
    name: '고려은단 퓨어 밀크씨슬 180정, 1개 (6개월분) [원산지:상품 상세페이지 참조]',
    price: '24,900원',
    popularity: '인기 94%',
    url: 'https://shopping.naver.com/gift/products/11243018665'
  },
  {
    id: 4,
    rank: '#4',
    image: "https://shop-phinf.pstatic.net/20250328_105/1743139211350t11HM_PNG/33910072260525099_1890313163.png?type=m450",
    category: '과일',
    categoryColor: '#584cdc',
    name: '과일바구니 명절 추석선물세트 이바지 예단 상견례 승진축하 수원 분당 용인 [원산지:국산]',
    price: '56,000원',
    popularity: '인기 94%',
    url: 'https://shopping.naver.com/gift/products/11648536781'
  },
  {
    id: 5,
    rank: '#5',
    image: "https://shop-phinf.pstatic.net/20251114_240/1763101191530LmtpF_JPEG/17276444317271649_441517793.jpg?type=m450",
    category: '디지털가전',
    categoryColor: '#584cdc',
    name: '돌체구스토 네오 카페 캡슐 커피머신 + 네오 캡슐보관함 + 스타벅스 시그니처 데비 텀블러 473ml 증정',
    price: '119,000원',
    popularity: '인기 93%',
    url: 'https://m.shopping.naver.com/gift/products/12179079303'
  }
]

function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [userName, setUserName] = useState('')
  const [showCardCompleteModal, setShowCardCompleteModal] = useState(false)
  const cards = useCardStore((state) => state.cards)

  // DB에서 로그인한 유저의 이름 가져오기
  useEffect(() => {
    const fetchUserName = async () => {
      if (isAuthenticated()) {
        try {
          const response = await userAPI.getProfile()
          if (response.data.success && response.data.data.name) {
            setUserName(response.data.data.name)
          }
        } catch (error) {
          console.error('Failed to fetch user name:', error)
          // 에러 발생 시 localStorage에서 가져오기 (fallback)
          const name = localStorage.getItem('userName')
          if (name) {
            setUserName(name)
          }
        }
      } else {
        // 로그인하지 않은 경우 localStorage에서 가져오기
        const name = localStorage.getItem('userName')
        if (name) {
          setUserName(name)
        }
      }
    }

    fetchUserName()
  }, [])

  // Welcome 페이지에서 온 경우 팝업 표시
  useEffect(() => {
    if (location.state?.showCardCompleteModal) {
      // state 초기화
      navigate(location.pathname, { replace: true, state: {} })
      // 약간의 지연 후 팝업 표시
      setTimeout(() => {
        setShowCardCompleteModal(true)
      }, 300)
    }
  }, [location.state, navigate, location.pathname])

  const handleGoToMy = () => {
    setShowCardCompleteModal(false)
    navigate('/my')
  }

  const handleCloseModal = () => {
    setShowCardCompleteModal(false)
  }

  const [alerts, setAlerts] = useState([])
  
  // 5분 전 알람 관련 state
  const [upcomingAlerts, setUpcomingAlerts] = useState([])
  
  // 명함 정보 모달 관련 state
  const [showCardInfoModal, setShowCardInfoModal] = useState(false)
  const [selectedCardInfo, setSelectedCardInfo] = useState(null)
  const [loadingCardInfo, setLoadingCardInfo] = useState(false)
  
  // 스케줄 종료 팝업 관련 state
  const [showEndedEventPopup, setShowEndedEventPopup] = useState(false)
  const [endedEventInfo, setEndedEventInfo] = useState(null)
  const [processedEndedEvents, setProcessedEndedEvents] = useState(new Set())

  // 알림 시간 계산 함수
  const calculateNotificationTime = (eventStartDate, notificationSetting) => {
    if (!notificationSetting || notificationSetting === '없음') return null

    const startDate = new Date(eventStartDate)
    let notificationTime = new Date(startDate)

    // 알림 설정에 따라 시간 계산 (밀리초 단위로 정확하게 계산)
    if (notificationSetting.includes('분 전')) {
      const minutes = parseInt(notificationSetting.replace('분 전', ''))
      notificationTime.setTime(notificationTime.getTime() - (minutes * 60 * 1000))
    } else if (notificationSetting.includes('시간 전')) {
      const hours = parseInt(notificationSetting.replace('시간 전', ''))
      notificationTime.setTime(notificationTime.getTime() - (hours * 60 * 60 * 1000))
    } else if (notificationSetting.includes('일 전')) {
      const days = parseInt(notificationSetting.replace('일 전', ''))
      notificationTime.setTime(notificationTime.getTime() - (days * 24 * 60 * 60 * 1000))
    } else if (notificationSetting.includes('주 전')) {
      const weeks = parseInt(notificationSetting.replace('주 전', ''))
      notificationTime.setTime(notificationTime.getTime() - (weeks * 7 * 24 * 60 * 60 * 1000))
    }

    return notificationTime
  }

  // 알림 텍스트 생성 함수
  const generateAlertText = (event) => {
    const now = new Date()
    
    // 알림 시간 계산
    const notificationTime = calculateNotificationTime(event.startDate, event.notification)
    
    // participants가 문자열인 경우 배열로 변환
    let participantsList = event.participants
    if (typeof participantsList === 'string' && participantsList.trim() !== '') {
      participantsList = participantsList.split(',').map(p => p.trim()).filter(p => p)
    } else if (!Array.isArray(participantsList)) {
      participantsList = []
    }

    // 참가자 이름 형식화 (모든 참가자 표시)
    let participantText = ''
    if (participantsList && participantsList.length > 0) {
      if (participantsList.length === 1) {
        participantText = `${participantsList[0]} 님과의`
      } else {
        // 여러 명일 때: "김승준, 장서진 님과의" 형식
        const names = participantsList.slice(0, -1).join(', ')
        const lastName = participantsList[participantsList.length - 1]
        participantText = `${names}, ${lastName} 님과의`
      }
    }

    // 이벤트 시작 시간에서 현재 시간까지 남은 시간 계산
    const startDate = new Date(event.startDate)
    const diffTime = startDate - now
    
    // 이미 지난 일정인 경우
    if (diffTime <= 0) {
      if (participantText) {
        return `${participantText} ${event.title} 일정이 지났습니다.`
      } else {
        return `${event.title} 일정이 지났습니다.`
      }
    }

    // 남은 시간 계산
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const remainingHours = diffHours - (diffDays * 24) // 일수를 제외한 남은 시간
    const remainingMinutes = diffMinutes - (diffHours * 60) // 시간을 제외한 남은 분
    const diffWeeks = Math.floor(diffDays / 7)

    let timeText = ''
    
    // 주 단위로 표시 (7일 이상)
    if (diffWeeks > 0) {
      const remainingDays = diffDays - (diffWeeks * 7)
      if (remainingDays > 0) {
        timeText = `${diffWeeks}주 ${remainingDays}일 전입니다`
      } else {
        timeText = `${diffWeeks}주 전입니다`
      }
    }
    // 일과 시간을 함께 표시 (24시간 이상)
    else if (diffDays > 0) {
      if (remainingHours > 0) {
        timeText = `${diffDays}일 ${remainingHours}시간 전입니다`
      } else {
        timeText = `${diffDays}일 전입니다`
      }
    }
    // 0일 남았을 때 시간과 분을 함께 표시
    else if (diffHours > 0) {
      if (remainingMinutes > 0) {
        timeText = `${diffHours}시간 ${remainingMinutes}분 전입니다`
      } else {
        timeText = `${diffHours}시간 전입니다`
      }
    }
    // 분 단위로 표시
    else if (diffMinutes > 0) {
      timeText = `${diffMinutes}분 전입니다`
    }
    // 지금
    else {
      timeText = '지금입니다'
    }

    if (participantText) {
      return `${participantText} ${event.title} 일정이 ${timeText}.`
    } else {
      return `${event.title} 일정이 ${timeText}.`
    }
  }

  // 알림 아이콘 결정 함수
  const getAlertIcon = (event) => {
    const category = event.category
    if (category === '미팅') return '🤝'
    if (category === '업무') return '💼'
    if (category === '개인') return '🎁'
    return '📅'
  }

  // 알림 배경색 결정 함수 (일정 태그 색상의 파스텔톤)
  const getAlertBackgroundColor = (event) => {
    const category = event.category || '기타'
    // 일정 태그 색상의 파스텔톤 버전 (새로운 색상에 맞춰 조정, 더 진하게)
    const pastelColors = {
      '미팅': '#f0eff8', // #8f85e7의 파스텔톤 (보라색 톤)
      '업무': '#95b8ff', // #5b99f9의 파스텔톤 (조금 더 진하게)
      '개인': '#95d4a8', // #81bf99의 파스텔톤 (조금 더 진하게)
      '기타': '#b8bcc5'  // #9da3af의 파스텔톤 (더 진하게)
    }
    return pastelColors[category] || pastelColors['기타']
  }

  // 캘린더 이벤트에서 알림 가져오기
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!isAuthenticated()) {
        setAlerts([])
        return
      }

      try {
        const now = new Date()
        // 오늘부터 7일 후까지의 일정 가져오기
        const endDate = new Date(now)
        endDate.setDate(endDate.getDate() + 7)

        const response = await calendarAPI.getEvents(
          now.toISOString(),
          endDate.toISOString()
        )

        if (response.data && response.data.success) {
          const events = response.data.data || []
          
          // 알림이 설정된 일정만 필터링
          const eventsWithNotifications = events.filter(event => {
            if (!event.notification || event.notification === '없음') return false
            
            const notificationTime = calculateNotificationTime(event.startDate, event.notification)
            if (!notificationTime) return false

            const eventStart = new Date(event.startDate)
            
            // 알림 시간이 현재 시간과 같거나 지났고, 일정 시작 시간이 아직 지나지 않은 경우
            // 알림 시간이 정확히 되었을 때부터 일정 시작 시간까지 표시
            const isNotificationTimeReached = notificationTime <= now
            const isEventNotStarted = now < eventStart
            
            // 알림 시간과 현재 시간의 차이 계산
            const timeSinceNotification = now - notificationTime
            const hoursSinceNotification = timeSinceNotification / (1000 * 60 * 60)
            
            // 일정 시작 시간까지의 남은 시간 계산
            const timeUntilEvent = eventStart - now
            const hoursUntilEvent = timeUntilEvent / (1000 * 60 * 60)
            
            // 알림 시간이 지났고, 일정이 아직 시작하지 않았으며
            // 알림이 일정 시작 시간 이전에 설정된 경우 표시
            // (예: "2일 전" 알림은 일정 시작 2일 전부터 일정 시작 시간까지 표시)
            // 단, 일정 시작 시간이 7일 이내인 경우만 표시 (너무 먼 미래 일정 제외)
            return isNotificationTimeReached && isEventNotStarted && hoursUntilEvent <= 168 // 7일 = 168시간
          })
          
          // 알림 시간 순으로 정렬 (가장 가까운 일정이 먼저)
          eventsWithNotifications.sort((a, b) => {
            const aStart = new Date(a.startDate)
            const bStart = new Date(b.startDate)
            return aStart - bStart
          })

          // 알림 생성
          const alertList = eventsWithNotifications.map(event => ({
            id: event.id,
            icon: getAlertIcon(event),
            text: generateAlertText(event),
            event: event,
            type: 'calendar',
            backgroundColor: getAlertBackgroundColor(event),
            category: event.category || '기타'
          }))

          setAlerts(alertList)
        }
      } catch (error) {
        console.error('Failed to fetch calendar alerts:', error)
        setAlerts([])
      }
    }

    fetchAlerts()
    
    // 30초마다 알림 업데이트 (알림 시간에 정확히 맞춰 표시하기 위해 더 자주 체크)
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  // 5분 전 알람 체크 (알림 설정 여부와 상관없이)
  useEffect(() => {
    const checkUpcomingEvents = async () => {
      if (!isAuthenticated()) {
        setUpcomingAlerts([])
        return
      }

      try {
        const now = new Date()
        // 5분 후까지의 시간 범위
        const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000)

        const response = await calendarAPI.getEvents(
          now.toISOString(),
          fiveMinutesLater.toISOString()
        )

        if (response.data && response.data.success) {
          const events = response.data.data || []
          
          // 5분 이내에 시작하고, linkedCardIds가 있는 이벤트만 필터링
          const upcomingEvents = events.filter(event => {
            const eventStart = new Date(event.startDate)
            const diffMinutes = (eventStart - now) / (1000 * 60)
            
            // linkedCardIds 배열이 있고 비어있지 않은 경우
            const hasLinkedCard = event.linkedCardIds && event.linkedCardIds.length > 0
            
            return diffMinutes > 0 && diffMinutes <= 5 && hasLinkedCard
          })

          // 알림 생성
          const upcomingAlertList = upcomingEvents.map(event => ({
            id: `upcoming-${event.id}`,
            eventId: event.id,
            icon: '⏰',
            text: `${event.title} 일정이 5분 후에 시작합니다!`,
            event: event,
            type: 'upcoming',
            backgroundColor: '#584cdc',
            category: event.category || '기타',
            participants: event.participants,
            linkedCardIds: event.linkedCardIds
          }))

          setUpcomingAlerts(upcomingAlertList)
        }
      } catch (error) {
        console.error('Failed to fetch upcoming events:', error)
        setUpcomingAlerts([])
      }
    }

    checkUpcomingEvents()
    
    // 30초마다 체크
    const interval = setInterval(checkUpcomingEvents, 30000)
    return () => clearInterval(interval)
  }, [])

  // 참여자의 명함 정보 조회
  const fetchParticipantCardInfo = async (participantName) => {
    if (!participantName || !isAuthenticated()) return null
    
    try {
      // 명함 검색
      const response = await cardAPI.getAll({ search: participantName, limit: 1 })
      if (response.data.success && response.data.data.length > 0) {
        const card = response.data.data[0]
        
        // 메모 조회
        let memos = []
        try {
          const memoResponse = await api.get(`/memo/card/${card.id}`)
          if (memoResponse.data.success) {
            memos = memoResponse.data.data || []
          }
        } catch (e) {
          console.log('No memos found')
        }
        
        // 선호도 프로필 조회
        let preferenceProfile = null
        try {
          const prefResponse = await api.get(`/profile/${card.id}/preferences`)
          if (prefResponse.data.success) {
            preferenceProfile = prefResponse.data.data
          }
        } catch (e) {
          console.log('No preference profile found')
        }
        
        return {
          ...card,
          memos,
          preferenceProfile
        }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch card info:', error)
      return null
    }
  }

  // 스케줄 종료 시점 체크 (linked_card_ids 여부에 따른 팝업)
  useEffect(() => {
    const checkEndedEvents = async () => {
      if (!isAuthenticated()) return

      try {
        const now = new Date()
        // 최근 5분 이내에 끝난 이벤트 확인
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

        const response = await calendarAPI.getEvents(
          fiveMinutesAgo.toISOString(),
          now.toISOString()
        )

        if (response.data && response.data.success) {
          const events = response.data.data || []
          
          // 이미 끝난 이벤트 중 아직 처리하지 않은 것
          for (const event of events) {
            const eventEnd = new Date(event.endDate)
            
            // 이벤트가 끝났고, 아직 팝업을 보여주지 않은 경우
            if (eventEnd <= now && !processedEndedEvents.has(event.id)) {
              // linkedCardIds 확인 (배열이 있고 비어있지 않은지)
              const hasLinkedCard = event.linkedCardIds && event.linkedCardIds.length > 0
              
              // 첫 번째 카드 ID 추출
              let linkedCardId = null
              if (hasLinkedCard) {
                linkedCardId = event.linkedCardIds[0]
              }
              
              setEndedEventInfo({
                ...event,
                hasLinkedCard,
                linkedCardId
              })
              setShowEndedEventPopup(true)
              
              // 처리 완료 표시
              setProcessedEndedEvents(prev => new Set([...prev, event.id]))
              break // 한 번에 하나의 팝업만
            }
          }
        }
      } catch (error) {
        console.error('Failed to check ended events:', error)
      }
    }

    checkEndedEvents()
    
    // 30초마다 체크
    const interval = setInterval(checkEndedEvents, 30000)
    return () => clearInterval(interval)
  }, [processedEndedEvents])

  // 스케줄 종료 팝업 - "예" 버튼 클릭
  const handleEndedEventYes = () => {
    setShowEndedEventPopup(false)
    
    if (endedEventInfo?.hasLinkedCard && endedEventInfo?.linkedCardId) {
      // 명함이 있으면 → 명함 상세 페이지로 이동 (메모 작성)
      navigate(`/cards/${endedEventInfo.linkedCardId}`)
    } else {
      // 명함이 없으면 → 명함 등록 페이지로 이동
      navigate('/manual-add')
    }
  }

  // 스케줄 종료 팝업 - "아니요" 버튼 클릭
  const handleEndedEventNo = () => {
    setShowEndedEventPopup(false)
  }

  // 명함 정보 보기 버튼 클릭 - 선호도 프로필 팝업 표시
  const handleShowCardInfo = async (alert) => {
    setLoadingCardInfo(true)
    setShowCardInfoModal(true)
    
    // linkedCardIds가 있으면 직접 사용 (배열)
    const linkedCardIds = alert.linkedCardIds || alert.event?.linkedCardIds
    
    // linkedCardIds가 배열이고 비어있지 않은 경우
    const hasLinkedCards = Array.isArray(linkedCardIds) && linkedCardIds.length > 0
    
    if (hasLinkedCards) {
      // linkedCardIds에서 첫 번째 카드 ID 추출
      const cardId = linkedCardIds[0]
      
      try {
        // 명함 정보 조회
        const cardResponse = await cardAPI.getById(cardId)
        if (cardResponse.data.success && cardResponse.data.data) {
          const card = cardResponse.data.data
          
          // 선호도 프로필 조회
          let preferenceProfile = null
          try {
            const prefResponse = await api.get(`/profile/${cardId}/preferences`)
            if (prefResponse.data.success) {
              preferenceProfile = prefResponse.data.data
            }
          } catch (e) {
            console.log('No preference profile found')
          }
          
          setSelectedCardInfo({
            ...card,
            preferenceProfile,
            eventTitle: alert.event?.title
          })
        } else {
          setSelectedCardInfo({ notFound: true, eventTitle: alert.event?.title })
        }
      } catch (error) {
        console.error('Failed to fetch card info:', error)
        setSelectedCardInfo({ notFound: true, eventTitle: alert.event?.title })
      }
    } else {
      // linkedCardIds가 없으면 참여자 이름으로 검색 (기존 방식)
      let participants = alert.event?.participants || alert.participants
      if (typeof participants === 'string') {
        participants = participants.split(',').map(p => p.trim()).filter(p => p)
      }
      
      if (participants && participants.length > 0) {
        const cardInfo = await fetchParticipantCardInfo(participants[0])
        if (cardInfo && cardInfo.id) {
          setSelectedCardInfo({
            ...cardInfo,
            eventTitle: alert.event?.title,
            allParticipants: participants
          })
        } else {
          setSelectedCardInfo({
            name: participants[0],
            notFound: true,
            eventTitle: alert.event?.title,
            allParticipants: participants
          })
        }
      } else {
        setSelectedCardInfo({ noParticipants: true })
      }
    }
    setLoadingCardInfo(false)
  }

  // 알림 텍스트에서 이름 추출 함수
  const extractNameFromAlert = (alertText) => {
    // "최하늘 님과..." 또는 "강지민 님의..." 형식에서 이름 추출
    const match = alertText.match(/^([가-힣]+)\s+님/)
    return match ? match[1] : null
  }

  // "보기" 버튼 클릭 핸들러
  const handleViewAlert = (alert) => {
    if (alert.type === 'calendar' && alert.event) {
      // 캘린더 일정인 경우 일정 상세 페이지로 이동
      navigate(`/calendar/event/${alert.event.id}`)
    } else {
      // 기존 로직 (명함 관련 알림)
      const name = extractNameFromAlert(alert.text)
      if (name) {
        // 해당 이름의 명함 찾기
        const card = cards.find(c => c.name === name)
        if (card) {
          // 타인명함 상세 페이지로 이동 (모달 열기)
          navigate('/business-cards', { 
            state: { openCardId: card.id } 
          })
        } else {
          // 명함이 없으면 명함 목록으로 이동
          navigate('/business-cards')
        }
      } else {
        // 이름을 추출할 수 없으면 명함 목록으로 이동
        navigate('/business-cards')
      }
    }
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* AI Gift Recommendation Banner */}
        <div className="ai-banner">
        {/* Header */}
        <div className="landing-header">
          <img src="/assets/gpt_4b_logo_blueberry.png" alt="GPT-4b Logo" className="header-logo" />
          {userName && (
            <span className="welcome-message">{userName}님 환영합니다!</span>
          )}
        </div>
          <div className="banner-content">
            <div className="banner-text">
              <p className="banner-subtitle">AI 맞춤형 비즈니스 선물 추천 서비스 GPT-4b</p>
              <p className="banner-title">상대방의 정보를 기반으로 최적의 선물을 찾아드립니다</p>
            </div>
          </div>
        </div>

        {/* Popular Gifts Section */}
        <div className="popular-gifts-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <h2 className="section-title">인기 선물</h2>
            </div>
          </div>

          <div className="gift-cards-container">
            {popularGifts.map((gift) => (
              <a 
                key={gift.id} 
                href={gift.url}
                target="_blank"
                rel="noopener noreferrer"
                className="gift-card"
                style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
              >
                <div className="gift-card-image">
                  <img src={gift.image} alt={gift.name} />
                  <div className="rank-badge">{gift.rank}</div>
                </div>
                <div className="gift-card-content">
                  <div className="category-badge">{gift.category}</div>
                  <h3 className="gift-card-title">{gift.name}</h3>
                  <div className="gift-card-price">
                    <span className="price">{gift.price}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <button className="view-all-button" onClick={() => navigate('/popular-gifts')}>전체보기</button>
        </div>

        {/* 5분 전 알람 섹션 (알림 설정과 상관없이) */}
        {upcomingAlerts.length > 0 && (
          <div className="upcoming-alerts-section">
            <h2 className="alerts-title">⏰ 곧 시작하는 일정</h2>
            <div className="alerts-list">
              {upcomingAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="alert-card upcoming-alert"
                  style={{ backgroundColor: '#584cdc' }}
                >
                  <p className="alert-text" style={{ color: 'white' }}>
                    {alert.text}
                  </p>
                  {alert.participants && (
                    <button 
                      type="button"
                      className="alert-button alert-button-full"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleShowCardInfo(alert)
                      }}
                    >
                      상대방 정보 보기
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Alerts Section */}
        <div className="alerts-section">
          <h2 className="alerts-title">중요 알림</h2>
          <div className="alerts-list">
            {alerts.length > 0 ? (
              alerts.map((alert) => {
                const isMeeting = alert.category === '미팅'
                return (
                  <div 
                    key={alert.id} 
                    className="alert-card"
                    style={{ 
                      backgroundColor: isMeeting ? '#8e86e6' : alert.backgroundColor 
                    }}
                  >
                    <p 
                      className="alert-text"
                      style={{ color: 'white' }}
                    >
                      {alert.text}
                    </p>
                    <button 
                      className="alert-button"
                      onClick={() => handleViewAlert(alert)}
                    >
                      일정 보기
                    </button>
                </div>
                )
              })
            ) : upcomingAlerts.length === 0 ? (
              <div className="no-alerts">
                <p className="no-alerts-text">아직 등록된 일정이 없어요.</p>
                <p className="no-alerts-text">'캘린더' 탭에서 일정을 등록해보세요!</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <BottomNavigation />

      {/* Card Complete Modal */}
      {showCardCompleteModal && (
        <div className="card-complete-modal-overlay" onClick={handleCloseModal}>
          <div className="card-complete-modal" onClick={(e) => e.stopPropagation()}>
            <p className="card-complete-message">
              {userName}님의 명함이 완성됐어요.<br />
              확인하러 갈까요?
            </p>
            <div className="card-complete-buttons">
              <button 
                className="card-complete-btn card-complete-btn-primary"
                onClick={handleGoToMy}
              >
                확인하러 갈래요
              </button>
              <button 
                className="card-complete-btn card-complete-btn-secondary"
                onClick={handleCloseModal}
              >
                괜찮아요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 선호도 프로필 팝업 모달 */}
      {showCardInfoModal && (
        <div className="card-info-modal-overlay" onClick={() => setShowCardInfoModal(false)}>
          <div className="card-info-modal preference-modal" onClick={(e) => e.stopPropagation()}>
            <div className="card-info-header">
              <h3 className="card-info-title">💡 상대방 선호도 프로필</h3>
              <button 
                className="card-info-close"
                onClick={() => setShowCardInfoModal(false)}
              >
                ✕
              </button>
            </div>
            
            {loadingCardInfo ? (
              <div className="card-info-loading">선호도 정보를 불러오는 중...</div>
            ) : selectedCardInfo?.noParticipants ? (
              <div className="card-info-empty">참여자 정보가 없습니다.</div>
            ) : selectedCardInfo?.notFound ? (
              <div className="card-info-content">
                <div className="card-info-person-header">
                  <span className="card-info-name">{selectedCardInfo.name}</span>
                </div>
                <p className="card-info-not-found">명함에 등록되지 않은 참여자입니다.<br/>명함을 등록하면 선호도 프로필을 확인할 수 있어요!</p>
              </div>
            ) : selectedCardInfo ? (
              <div className="card-info-content">
                {/* 참여자 기본 정보 */}
                <div className="card-info-person-header">
                  <span className="card-info-name">{selectedCardInfo.name}</span>
                  <span className="card-info-detail">
                    {selectedCardInfo.company && selectedCardInfo.company}
                    {selectedCardInfo.position && ` · ${selectedCardInfo.position}`}
                  </span>
                </div>
                
                {/* 선호도 프로필 - 메인 */}
                {selectedCardInfo.preferenceProfile ? (
                  <div className="preference-profile-main">
                    {/* 좋아하는 것 */}
                    {selectedCardInfo.preferenceProfile.likes && (
                      <div className="pref-section pref-likes">
                        <div className="pref-section-header">
                          <span className="pref-icon">👍</span>
                          <span className="pref-title">좋아하는 것</span>
                        </div>
                        <div className="pref-tags">
                          {(() => {
                            const rawLikes = selectedCardInfo.preferenceProfile.likes
                            let likes = rawLikes
                            // 문자열이면 파싱 시도
                            if (typeof rawLikes === 'string') {
                              try {
                                likes = JSON.parse(rawLikes)
                              } catch {
                                return <span className="pref-tag pref-tag-like">{rawLikes}</span>
                              }
                            }
                            // 배열이면 map
                            if (Array.isArray(likes)) {
                              return likes.map((item, idx) => (
                                <span key={idx} className="pref-tag pref-tag-like">
                                  {typeof item === 'object' && item !== null ? item.item : String(item)}
                                </span>
                              ))
                            }
                            return <span className="pref-tag pref-tag-like">{String(rawLikes)}</span>
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {/* 싫어하는 것 */}
                    {selectedCardInfo.preferenceProfile.dislikes && (
                      <div className="pref-section pref-dislikes">
                        <div className="pref-section-header">
                          <span className="pref-icon">👎</span>
                          <span className="pref-title">싫어하는 것</span>
                        </div>
                        <div className="pref-tags">
                          {(() => {
                            const rawDislikes = selectedCardInfo.preferenceProfile.dislikes
                            let dislikes = rawDislikes
                            if (typeof rawDislikes === 'string') {
                              try {
                                dislikes = JSON.parse(rawDislikes)
                              } catch {
                                return <span className="pref-tag pref-tag-dislike">{rawDislikes}</span>
                              }
                            }
                            if (Array.isArray(dislikes)) {
                              return dislikes.map((item, idx) => (
                                <span key={idx} className="pref-tag pref-tag-dislike">
                                  {typeof item === 'object' && item !== null ? item.item : String(item)}
                                </span>
                              ))
                            }
                            return <span className="pref-tag pref-tag-dislike">{String(rawDislikes)}</span>
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {/* 불확실한 것 */}
                    {selectedCardInfo.preferenceProfile.uncertain && (
                      <div className="pref-section pref-uncertain">
                        <div className="pref-section-header">
                          <span className="pref-icon">🤔</span>
                          <span className="pref-title">불확실한 것</span>
                        </div>
                        <div className="pref-tags">
                          {(() => {
                            const rawUncertain = selectedCardInfo.preferenceProfile.uncertain
                            let uncertain = rawUncertain
                            if (typeof rawUncertain === 'string') {
                              try {
                                uncertain = JSON.parse(rawUncertain)
                              } catch {
                                return <span className="pref-tag pref-tag-uncertain">{rawUncertain}</span>
                              }
                            }
                            if (Array.isArray(uncertain)) {
                              return uncertain.map((item, idx) => (
                                <span key={idx} className="pref-tag pref-tag-uncertain">
                                  {typeof item === 'object' && item !== null ? item.item : String(item)}
                                </span>
                              ))
                            }
                            return <span className="pref-tag pref-tag-uncertain">{String(rawUncertain)}</span>
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-preference-profile">
                    <p>아직 선호도 프로필이 없어요.</p>
                    <p className="no-pref-hint">대화 내용을 메모로 남기면<br/>AI가 선호도를 분석해드려요!</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 스케줄 종료 팝업 */}
      {showEndedEventPopup && endedEventInfo && (
        <div className="ended-event-popup-overlay">
          <div className="ended-event-popup">
            <div className="ended-event-popup-icon">
              {endedEventInfo.hasLinkedCard ? '📝' : '📇'}
            </div>
            <h3 className="ended-event-popup-title">
              {endedEventInfo.title}
            </h3>
            <p className="ended-event-popup-subtitle">일정이 종료되었어요</p>
            <p className="ended-event-popup-message">
              {endedEventInfo.hasLinkedCard 
                ? '상대방에 대한 사소한 정보라도\n메모로 남겨봐요!'
                : '오늘 만난 상대방의 정보를\n명함으로 등록해봐요!'
              }
            </p>
            <div className="ended-event-popup-buttons">
              <button 
                className="ended-event-btn ended-event-btn-primary"
                onClick={handleEndedEventYes}
              >
                {endedEventInfo.hasLinkedCard ? '메모 작성하기' : '명함 등록하기'}
              </button>
              <button 
                className="ended-event-btn ended-event-btn-secondary"
                onClick={handleEndedEventNo}
              >
                다음에 할게요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage

